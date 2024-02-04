chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const startDateElem = document.getElementById('ctl00_MainContent_txtRptExamDate');
    const endDateElem = document.getElementById('ctl00_MainContent_txtRptExamEndDate');
    const startDate = startDateElem.value;
    const endDate = endDateElem.value;

    if (startDate === request.data.startDate && endDate === request.data.endDate) {
        // Get Data
        const rows = document.querySelector("#ctl00_MainContent_pnlReports").querySelector(".table-body-report").children[0].children[0].children[0].children;

        let data = [];

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
            data.push(dataPoint);
        }

        sendResponse(data);
    } else {
        // SEARCH DATA
        startDateElem.value = request.data.startDate;
        endDateElem.value = request.data.endDate;

        // Select Finalizados
        document.getElementById('ctl00_MainContent_ddlRptStatus').value = '6';

        // Search
        sendResponse('search');
        return;
    }
});

(() => {
    const myJavaScript = `
function handleResponse(response) {
    console.log(response);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.scripting.executeScript({
            'target': { 'tabId': activeTab.id },
            'func': () => {
                __doPostBack('ctl00$MainContent$cmdRptSearch', '');
            }
        });
    });
}`;    //You need to put your JS here. 
    const scriptTag = document.createElement("script");
    scriptTag.innerHTML = myJavaScript;
    document.head.appendChild(scriptTag);
})();

/* // GET DATA
rows = document.querySelector("#ctl00_MainContent_pnlReports").querySelector(".table-body-report").children[0].children[0].children[0].children;

data = [];

for (let i = 0; i < rows.length; i++) {
    dataPoint = {};
    
    // Index
    dataPoint.i = i;

    // Exams
    dataPoint.exams = element.children[2].querySelector("span").innerText.split(",").map(s => s.trim());

    // Seguro
    dataPoint.seguro = element.children[4].innerText.split("|")[1].trim();

    // Exam Type
    dataPoint.exam_Type = element.children[7].innerText.trim();

    // Date
    dataPoint.date = new Date(element.children[9].innerText.split(" ")[0].trim().replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"));
}

console.log(data);

// SEARCH DATA
const startDate = document.getElementById('ctl00_MainContent_txtRptExamDate');
const endDate = document.getElementById('ctl00_MainContent_txtRptExamEndDate');

// Select Finalizados
document.getElementById('ctl00_MainContent_ddlRptStatus').value = '6';

// Search
document.getElementById('ctl00_MainContent_cmdRptSearch').click() */

