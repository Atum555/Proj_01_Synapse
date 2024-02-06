let extensionGlobalData = {
    'selected': [],
    'state': {
        'complete': false,
        'searchIntervals': []
    }
}

// Send Message Asking for Data
function askData() {
    chrome.runtime.sendMessage('send-data');
}
setInterval(askData, 1000);


// Receive data
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
    sendResponse({ "hey look me too!": message['hey I sent data'] });
});