// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var events = [];

var handleReply = function(reply) {
  chrome.test.log('handle reply: ' + reply);
  // |reply| is the next command for the extension.
  if (reply == 'idle') {
    // Do nothing, wait for events.
  } else if (reply.indexOf('get-policy-') == 0) {
    // Send a policy value back.
    chrome.storage.managed.get(reply.substr(11), function(policy) {
      chrome.test.log('sending policy value: ' + JSON.stringify(policy));
      chrome.test.sendMessage(JSON.stringify(policy), handleReply);
    });
  } else {
    // Unexpected reply, make the test fail.
    chrome.test.sendMessage('fail');
  }
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace == 'managed') {
    chrome.test.log('change event: ' + JSON.stringify(changes));
    events.push(changes);
    chrome.test.sendMessage('event', handleReply);
  }
});

chrome.test.log('main body done, sending ready');
// Send the initial 'ready' message, and start waiting for replies.
chrome.test.sendMessage('ready', handleReply);
