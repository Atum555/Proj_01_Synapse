let extensionGlobalData = {
    'selected': [],
    'state': {
        'complete': false,
        'searchIntervals': []
    }
}

// Send Message Asking for Data
function askData() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        const request = 'send-data';
        chrome.tabs.sendMessage(activeTab.id, request)
            .catch((error) => {
                // Set Invalid Page
                const totalElem = document.getElementById('table-total');
                const warningElem = document.getElementById('content-warning');
                const tableElem = document.getElementById('content-table');

                totalElem.innerText = '0000';
                tableElem.style.display = 'none';
                warningElem.innerText = 'WebSite inválido.';
                warningElem.style.display = '';
            });
    });
}
setInterval(askData, 1000);


// Receive data
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
});