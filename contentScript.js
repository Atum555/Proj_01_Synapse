let STOP = false;

// Handle Messages
function handleMessage(request, sender, sendResponse) {
    // STOP if Loading Next Page
    if (STOP) { return; }

    if (request === "send-data") {
        sendData();
    }
}
chrome.runtime.onMessage.addListener(handleMessage);


// Send Messages
function sendData() {
    // STOP if Loading Next Page
    if (STOP) { return; }

    const message = {};

    // Date
    const startDate = document.getElementById('ctl00_MainContent_txtRptExamDate')?.value;
    const endDate = document.getElementById('ctl00_MainContent_txtRptExamEndDate')?.value;
    message['startDate'] = startDate;
    message['endDate'] = endDate;

    // Data
    message['records'] = [];
    const rows = document.querySelector("#ctl00_MainContent_pnlReports")?.querySelector(".table-body-report")?.children[0].children[0].children[0].children;

    // Check if no data is present on the page
    if (rows === undefined) {
        message['error'] = 'no-data';
        chrome.runtime.sendMessage(message, handleResponse);
        return;
    }

    for (let i = 0; i < rows.length; i++) {
        let dataPoint = {};

        // Index
        dataPoint.i = i;

        // Exams
        dataPoint.exams = rows[i].children[2].querySelector("span").innerText.split(",").map(s => s.trim());

        // Seguro
        dataPoint.seguro = rows[i].children[4].innerText.split("|")[1].trim();

        // Exam Type
        dataPoint.exam_Type = rows[i].children[7].innerText.trim();

        // Date
        dataPoint.date = new Date(rows[i].children[9].innerText.split(" ")[0].trim().replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
        message.records.push(dataPoint);
    }

    // Exams Total
    const footNote = document.getElementById('ctl00_MainContent_tdReportsFooterPager').children[document.getElementById('ctl00_MainContent_tdReportsFooterPager').children.length - 1].children[0].innerText.split(' ');
    // TODO Parse foot note.    
    message['page'] = footNote[3];
    message['totalRecordCount'] = footNote[7];

    // Next Page Button
    message['nextBtn'] = document.getElementById('ctl00_MainContent_lkReportNext') ? true : false;

    // Send Message
    chrome.runtime.sendMessage(message, handleResponse);
}

// Handle Response from Message
function handleResponse(response) {
    // STOP if Loading Next Page
    if (STOP) { return; }

    console.log(response);

    if (response.request === 'search') {
        // Input Dates
        const startDateElem = document.getElementById('ctl00_MainContent_txtRptExamDate');
        const endDateElem = document.getElementById('ctl00_MainContent_txtRptExamEndDate');

        startDateElem.value = response.startDate;
        endDateElem.value = response.endDate;

        // Select Exames Finalizados
        document.getElementById('ctl00_MainContent_ddlRptStatus').value = '6';

        // Send Search Request to Page
        window.postMessage({
            'direction': 'from-content-script',
            'request': 'search'
        });
    }
    if (response.request === 'next-page') {
        document.getElementById('ctl00_MainContent_lkReportNext').click();
        // TODO Check if this works
        // If not send request to inPage Script
    }
}

// Stop if next page is loading
window.addEventListener('beforeunload', function (event) {
    // STOP if Loading Next Page
    stop = true;
    chrome.runtime.onMessage.removeListener(handleMessage);
});