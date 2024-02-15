let extensionGlobalData = {
    'seguros': false,
    'user': false,
    'values': {}
}

// Read Usar Name
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    
    //Set Invalid Page
    if (!activeTab.url.match('https://cwm.trofasaude.com/*')) {
        const tableElem = document.getElementById('content-table');
        const warningElem = document.getElementById('content-warning');

        tableElem.style.display = 'none';
        warningElem.innerText = 'WebSite inválido.';
        warningElem.style.display = '';
    } else {
        const request = 'send-data';
        chrome.tabs.sendMessage(activeTab.id, request)
            .catch((error) => {
                // Handle Error
                const tableElem = document.getElementById('content-table');
                const warningElem = document.getElementById('content-warning');

                tableElem.style.display = 'none';
                warningElem.innerText = 'Erro...';
                warningElem.style.display = '';
            });
    }
});

// Seguros Btn EventListener
document.getElementById('seguros-btn').addEventListener('click', (event) => {
    document.getElementById('seguros-btn').classList.toggle('seguros-btn-active');
    extensionGlobalData.seguros = !extensionGlobalData.seguros;
    mountTable();
});


// Importar Btn EventListener
// Exportar Btn EventListener
// TODO Implement Import Export

// Read Stored Data
function getValues() {
    const user = extensionGlobalData.user;

    // Return if user not defined
    if (!user) { return; }

    chrome.storage.sync.get([user]).then((result) => {
        const userValues = Array.isArray(result[user]) ? result[user] : [];
        extensionGlobalData.values = userValues;
    });
}

// Mount Table
function mountTable() {
    // Load Data if no Data is Present
    if (JSON.stringify(extensionGlobalData.values) === JSON.stringify({})) { getValues(); return; }

    const warningElem = document.getElementById('content-warning');
    const tableElem = document.getElementById('content-table');
    const tbodyElem = document.getElementById('table-body');

    const values = extensionGlobalData.values;
    let tableRows = [];
    for (const exam_Type in values) {
        const examTypeRowElem = document.createElement('tr');
        const examTypeNameElem = document.createElement('td');
        const examTypeValueElem = document.createElement('td');

        tableRows.push(examTypeRowElem);
        examTypeNameElem.innerText = exam_Type;
        examTypeValueElem.innerHTML = `<span contenteditable="plaintext-only">${values[exam_Type].default}</span>€`;
        examTypeRowElem.classList.add('exam-type-row');
        examTypeNameElem.classList.add('exam-name');
        examTypeValueElem.classList.add('exam-value');

        for (const exam in values[exam_Type]) {
            const examRowElem = document.createElement('tr');
            const examNameElem = document.createElement('td');
            const examValueElem = document.createElement('td');

            tableRows.push(examRowElem);
            examNameElem.innerText = exam;
            examValueElem.innerHTML = `<span contenteditable="plaintext-only">${values[exam_Type][exam].default}</span>€`;
            examRowElem.classList.add('exam-row');
            examNameElem.classList.add('exam-name');
            examValueElem.classList.add('exam-value');

            if (extensionGlobalData.seguros) {
                for (const seguro in values[exam_Type][exam]) {
                    const seguroRowElem = document.createElement('tr');
                    const seguroNameElem = document.createElement('td');
                    const seguroValueElem = document.createElement('td');

                    tableRows.push(seguroRowElem);
                    seguroNameElem.innerText = exam;
                    seguroValueElem.innerHTML = `<span contenteditable="plaintext-only">${values[exam_Type][exam][seguro].value}</span>€`;
                    seguroRowElem.classList.add('exam-row');
                    seguroNameElem.classList.add('exam-name');
                    seguroValueElem.classList.add('exam-value');
                }
            }
        }
    }

    // Update Table
    tbodyElem.replaceChildren(...tableRows);
    warningElem.style.display = 'none';
    tableElem.style.display = '';
}