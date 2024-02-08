// Handle Messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request === "send-data") {
        setTimeout(sendData, 100);
    }
});


// Send Messages
function sendData() {
    const message = {};

    // Date
    const startDate = document.getElementById('ctl00_MainContent_txtRptExamDate').value;
    const endDate = document.getElementById('ctl00_MainContent_txtRptExamEndDate').value;
    message['startDate'] = startDate;
    message['endDate'] = endDate;

    // Data
    message['records'] = [];
    const rows = document.querySelector("#ctl00_MainContent_pnlReports").querySelector(".table-body-report")?.children[0].children[0].children[0].children;

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
    const footNote = document.getElementById('ctl00_MainContent_tdReportsFooterPager').children[document.getElementById('ctl00_MainContent_tdReportsFooterPager').children.length - 1].children[0].innerText;
    // TODO Parse foot note.    
    message['page'] = 2;
    message['totalRecordCount'] = 3;

    // Next Page Button
    // TODO Check whether or not Next Page Button is available
    message['nextBtn'] = true;

    // Send Message
    chrome.runtime.sendMessage(message, handleResponse);
}

// Handle Response from Message
function handleResponse(response) {
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