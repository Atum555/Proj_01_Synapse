let STOP = false;

// Handle Data Asked
function handleMessage(request) {
    // STOP if Loading Next Page
    if (STOP) { return; }

    if (request === "send-data") {
        sendData();
    }
}
window.addEventListener('load', function () {
    chrome.runtime.onMessage.addListener(handleMessage);
});


// Send Messages
function sendData() {
    // STOP if Loading Next Page
    if (STOP) { return; }

    // Init Return Message
    const message = {};

    // Read Start Date
    message['startDate'] = document.getElementById('ctl00_MainContent_txtRptExamDate')?.value;
    message['endDate'] = document.getElementById('ctl00_MainContent_txtRptExamEndDate')?.value;

    // Records
    message['records'] = [];
    const rows = document.querySelector("#ctl00_MainContent_pnlReports")?.querySelector(".table-body-report")?.children[0].children[0].children[0].children;

    // Check if no data is present on the page
    if (
        rows.length === 0 ||
        rows[0]?.children[0]?.children[0]?.children[0]?.tagName === 'SPAN'
    ) {
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

    // Foot Note, Page Number, Exams Total
    const footNote = document.getElementById('ctl00_MainContent_tdReportsFooterPager').children[document.getElementById('ctl00_MainContent_tdReportsFooterPager').children.length - 1].children[0].innerText.split(' ');
    message['page'] = footNote[3];
    message['totalRecordCount'] = footNote[7];

    // Next Page Button
    message['nextBtn'] = document.getElementById('ctl00_MainContent_lkReportNext') ? true : false;


    // User Name
    message['userName'] = document.getElementById('ctl00_cntHeader_lbUserName').innerText;

    // Send Message
    chrome.runtime.sendMessage(message, handleResponse);
}

// Handle Response Request
function handleResponse(response) {
    // STOP if Loading Next Page
    if (STOP) { return; }

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
    }
}

// Stop if next page is loading
window.addEventListener('beforeunload', function (event) {
    // STOP if Loading Next Page
    stop = true;
    chrome.runtime.onMessage.removeListener(handleMessage);
});