let extensionGlobalData = {
    'seguros': false,
    'user': false,
    'values': {}
}

// Read Usar Name
function getUser() {
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
            const request = 'settings-send-data';
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
}
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message['userName'] && extensionGlobalData.user !== message['userName']) {
        extensionGlobalData.user = message['userName'];
        setTimeout(getValues, 100);
    }
});
getUser();
setInterval(getUser, 400);

// Seguros Btn EventListener
document.getElementById('seguros-btn').addEventListener('click', (event) => {
    document.getElementById('seguros-btn').classList.toggle('seguros-btn-active');
    extensionGlobalData.seguros = !extensionGlobalData.seguros;
    setTimeout(mountTable, 200);
});

// Importar Btn EventListener
document.getElementById('import-btn').addEventListener('click', (event) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                if (reader.readyState === FileReader.DONE) {
                    const jsonData = event.target.result;

                    try {
                        const parsedData = JSON.parse(jsonData);
                        importSettings(parsedData.values);
                    }
                    catch (error) { document.getElementById('import-btn').style.animation = 'input-error ease 3s'; }
                }
            }

            reader.readAsText(file);
        }
        else { document.getElementById('import-btn').style.animation = 'input-error ease 3s'; }
        document.body.removeChild(fileInput);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
});

// Exportar Btn EventListener
document.getElementById('export-btn').addEventListener('click', (event) => {
    const a = document.createElement('a');

    const fileName = `Definições - ${extensionGlobalData.user}.json`;
    const data = { 'values': extensionGlobalData.values };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { 'type': 'octet/stream' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
});

// Delete Btn EventListener
document.getElementById('delete-btn').addEventListener('click', (event) => {
    extensionGlobalData.values = {};
    setTimeout(updateStorage, 0);
    setTimeout(mountTable, 100, true);
});

// Read Stored Data
function getValues() {
    const user = extensionGlobalData.user;

    // Return if user not defined
    if (!user) { getUser(); return; }

    chrome.storage.sync.get([user]).then((result) => {
        const userValues = result[user] ? result[user] : {};
        extensionGlobalData.values = userValues;
        setTimeout(mountTable, 100);
    });
}

// Write Stored Data
function updateStorage() {
    const data = {};
    data[extensionGlobalData.user] = JSON.parse(JSON.stringify(extensionGlobalData.values));
    chrome.storage.sync.set(data).catch(() => { return; });
}


// Import Config
function importSettings(settings) {
    console.log('import settings:');
    console.log(settings);

    // Loop ExamTypes
    for (examType in settings) {
        extensionGlobalData.values[examType] = extensionGlobalData.values[examType] || {};

        // Set value if new or undefined
        if (settings[examType].default || !extensionGlobalData.values[examType].default) { extensionGlobalData.values[examType].default = settings[examType].default; }

        // Loop Exams
        for (exam in settings[examType]) {
            if (exam === 'default') { continue; }
            extensionGlobalData.values[examType][exam] = extensionGlobalData.values[examType][exam] || {};

            // Set value if new or undefined
            if (settings[examType][exam].default || !extensionGlobalData.values[examType][exam].default) { extensionGlobalData.values[examType][exam].default = settings[examType][exam].default; }

            // Loop Seguros
            for (seguro in settings[examType][exam]) {
                if (seguro === 'default') { continue; }
                extensionGlobalData.values[examType][exam][seguro] = extensionGlobalData.values[examType][exam][seguro] || {};

                // Set value if new or undefined
                if (settings[examType][exam][seguro].value || !extensionGlobalData.values[examType][exam][seguro].value) {
                    extensionGlobalData.values[examType][exam][seguro].value = settings[examType][exam][seguro].value;
                }
            }
        }
    }

    document.getElementById('import-btn').style.animation = 'input-success 4s ease';
    setTimeout(mountTable, 150);
}

// Mount Table
function mountTable(overWrite = false) {
    // Load Data if no Data is Present
    if (!overWrite && Object.keys(extensionGlobalData.values).length === 0) { getValues(); return; }

    const warningElem = document.getElementById('content-warning');
    const tableElem = document.getElementById('content-table');
    const tbodyElem = document.getElementById('table-body');

    const values = extensionGlobalData.values;
    let tableRows = [];
    for (const exam_Type in values) {
        const examTypeRowElem = document.createElement('tr');
        const examTypeNameElem = document.createElement('td');
        const examTypeValueElem = document.createElement('td');
        const examTypeSpanElem = document.createElement('span');

        tableRows.push(examTypeRowElem);
        examTypeRowElem.replaceChildren(examTypeNameElem, examTypeValueElem);
        examTypeValueElem.replaceChildren(examTypeSpanElem, document.createTextNode("€"));
        examTypeNameElem.innerText = exam_Type;
        examTypeRowElem.classList.add('exam-type-row');
        examTypeNameElem.classList.add('exam-name');
        examTypeValueElem.classList.add('exam-value');
        examTypeSpanElem.innerText = `${values[exam_Type].default}`;
        examTypeSpanElem.contentEditable = 'plaintext-only';
        examTypeSpanElem.addEventListener('input', (event) => {
            // Filter Input
            const text = event.target.innerText;
            const filteredText = text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g) ? text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g)[0] : '0';
            event.target.innerText = filteredText;
            window.getSelection().collapse(event.target.firstChild, filteredText.length);

            // Update Stored Value
            values[exam_Type].default = Number(filteredText.replace(",", "."));
            setTimeout(updateStorage, 0);
        });

        for (const exam in values[exam_Type]) {
            if (exam === "default") { continue; }
            const examRowElem = document.createElement('tr');
            const examNameElem = document.createElement('td');
            const examValueElem = document.createElement('td');
            const examSpanElem = document.createElement('span');

            tableRows.push(examRowElem);
            examRowElem.replaceChildren(examNameElem, examValueElem);
            examValueElem.replaceChildren(examSpanElem, document.createTextNode("€"));
            examNameElem.innerText = exam;
            examRowElem.classList.add('exam-row');
            examNameElem.classList.add('exam-name');
            examValueElem.classList.add('exam-value');
            if (values[exam_Type][exam].default == 0) { examValueElem.classList.add('empty-value'); }
            examSpanElem.innerText = `${values[exam_Type][exam].default}`;
            examSpanElem.contentEditable = 'plaintext-only';
            examSpanElem.addEventListener('input', (event) => {
                // Filter Input
                const text = event.target.innerText;
                const filteredText = text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g) ? text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g)[0] : '0';
                event.target.innerText = filteredText;
                if (filteredText === '0') { event.target.parentElement.classList.add('empty-value'); }
                else { event.target.parentElement.classList.remove('empty-value'); }
                window.getSelection().collapse(event.target.firstChild, filteredText.length);

                // Update Stored Value
                values[exam_Type][exam].default = Number(filteredText.replace(",", "."));
                setTimeout(updateStorage, 0);
            });

            if (extensionGlobalData.seguros) {
                for (const seguro in values[exam_Type][exam]) {
                    if (seguro === "default") { continue; }
                    const seguroRowElem = document.createElement('tr');
                    const seguroNameElem = document.createElement('td');
                    const seguroValueElem = document.createElement('td');
                    const seguroSpanElem = document.createElement('span');

                    tableRows.push(seguroRowElem);
                    seguroRowElem.replaceChildren(seguroNameElem, seguroValueElem);
                    seguroValueElem.replaceChildren(seguroSpanElem, document.createTextNode("€"));
                    seguroNameElem.innerText = seguro;
                    seguroRowElem.classList.add('seguro-row');
                    seguroNameElem.classList.add('exam-name');
                    seguroValueElem.classList.add('exam-value');
                    if (values[exam_Type][exam][seguro].value == 0) { seguroValueElem.classList.add('empty-value'); }
                    seguroSpanElem.innerText = `${values[exam_Type][exam][seguro].value}`;
                    seguroSpanElem.contentEditable = 'plaintext-only';
                    seguroSpanElem.addEventListener('input', (event) => {
                        // Filter Input
                        const text = event.target.innerText;
                        const filteredText = text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g) ? text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g)[0] : '0';
                        event.target.innerText = filteredText;
                        if (filteredText === '0') { event.target.parentElement.classList.add('empty-value'); }
                        else { event.target.parentElement.classList.remove('empty-value'); }
                        window.getSelection().collapse(event.target.firstChild, filteredText.length);

                        // Update Stored Value
                        values[exam_Type][exam][seguro].value = Number(filteredText.replace(",", "."));
                        setTimeout(updateStorage, 0);
                    });
                }
            }
        }
    }

    // Update Table
    tbodyElem.replaceChildren(...tableRows);
    warningElem.style.display = 'none';
    tableElem.style.display = '';
}