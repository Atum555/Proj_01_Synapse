let extensionGlobalData = {
    'selected': [],
    'state': {
        'searching': false,
        'complete': false,
        'searchIntervals': []
    },
    'records': [],
    'data': [],
    'user': false,
    'values': {}
}

// Update Selection
setInterval(updateSelection, 500);

// Send Message Asking for Data
function askData() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        const request = 'send-data';

        // Send If Valid Page
        if (activeTab.url.match('https://cwm.trofasaude.com/*')) {
            chrome.tabs.sendMessage(activeTab.id, request)
                .catch((error) => {
                    if (extensionGlobalData.state.searching) {
                        // Set to Loading
                        const totalElem = document.getElementById('table-total');
                        const warningElem = document.getElementById('content-warning');
                        const tableElem = document.getElementById('content-table');

                        totalElem.innerText = '0000';
                        tableElem.style.display = 'none';
                        warningElem.innerText = 'Loading...';
                        warningElem.style.display = '';
                    } else {
                        // Handle Error
                        const totalElem = document.getElementById('table-total');
                        const warningElem = document.getElementById('content-warning');
                        const tableElem = document.getElementById('content-table');

                        totalElem.innerText = '0000';
                        tableElem.style.display = 'none';
                        warningElem.innerText = 'Erro...';
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
    let next = whatToAskNext(message);

    // Nothing to Search
    if (next.nothing) { mountTable(); return; }

    // No Data
    if (message.error === "no-data") {
        let ret = false;
        extensionGlobalData.state.searchIntervals.forEach((interval) => {
            if (
                interval.startDate === message.startDate &&
                interval.endDate === message.endDate
            ) {
                interval.complete = true;
                ret = true;
            }
        });
        if (ret) { return; }

        // Mark as Searching
        extensionGlobalData.state.searching = true;
        sendResponse({
            'request': 'search',
            'startDate': next.startDate,
            'endDate': next.endDate
        });
        return;
    }

    // Update Records and Intervals Info
    extensionGlobalData.state.searchIntervals.forEach((interval) => {
        if (
            interval.startDate === message.startDate &&
            interval.endDate === message.endDate &&
            !(interval.pages.includes(message.page))
        ) {
            if (interval.count === 0 && message.page !== "1") { return; }
            interval.records.push(...message.records);
            interval.count += message.records.length;

            if (!message.nextBtn) {
                interval.complete = true;
                extensionGlobalData.records.push(...interval.records);
            }
        }
    });

    // Update User Name and Values
    if (extensionGlobalData.user !== message['userName']) {
        extensionGlobalData.user === message['userName'];
        updateValues();
    }

    // Update Next
    next = whatToAskNext(message);

    // Nothing to Search
    if (next.nothing) { mountTable(); return; }

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