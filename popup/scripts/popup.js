let extensionGlobalData = {
    'selected': [],
    'state': {
        'searching': false,
        'complete': false,
        'searchIntervals': []
    },
    'records': [],
    'data': []
}

// Update Selected Months
setInterval(function () {
    if (updateSelection()) { askData(); }
}, 250);


// Send Message Asking for Data
function askData() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        const request = 'send-data';

        // Send If Valid Page
        if (tabs[0].url.match('https://cwm.trofasaude.com/*')) {
            chrome.tabs.sendMessage(activeTab.id, request)
                .catch((error) => {
                    if (!extensionGlobalData.state.searching){
                        // Handle Error
                        const totalElem = document.getElementById('table-total');
                        const warningElem = document.getElementById('content-warning');
                        const tableElem = document.getElementById('content-table');
    
                        totalElem.innerText = '0000';
                        tableElem.style.display = 'none';
                        warningElem.innerText = 'Erro.';
                        warningElem.style.display = '';
                    }
                });
        } else {
            // Set Invalid Page
            const totalElem = document.getElementById('table-total');
            const warningElem = document.getElementById('content-warning');
            const tableElem = document.getElementById('content-table');

            totalElem.innerText = '0000';
            tableElem.style.display = 'none';
            warningElem.innerText = 'WebSite inválido.';
            warningElem.style.display = '';
        }
    });
}
setInterval(askData, 300);


// Receive data
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
    let next = whatToAskNext(
        {
            'startDate': message.startDate,
            'endDate': message.endDate
        }
    );

    // Nothing to Search
    if (next.nothing) { mountTable(); }

    // No Data
    if (message.error === "no-data") {
        sendResponse({
            'request': 'search',
            'startDate': next.startDate,
            'endDate': next.endDate
        });
        return;
    }

    // Update Records and Intervals Info
    extensionGlobalData.state.searchIntervals.forEach((interval) => {
        if (interval.startDate === message.startDate && interval.endDate === message.endDate) {
            interval.records.push(...message.records);
            interval.count += message.records.length;

            if (interval.count === message.totalRecordCount) {
                interval.complete = true;
                extensionGlobalData.records.push(...interval.records);
            }
        }
    });

    // Update Next
    next = whatToAskNext(
        {
            'startDate': message.startDate,
            'endDate': message.endDate
        }
    );

    // Nothing to Search
    if (next.nothing) { mountTable(); }

    // Mark as Searching
    extensionGlobalData.state.searching = true;

    // Search Next Page
    if (next.nextPage) { sendResponse({ 'request': 'next-page' }); }
    
    // Search Next Interval
    sendResponse({
        'request': 'search',
        'startDate': next.startDate,
        'endDate': next.endDate
    });
});