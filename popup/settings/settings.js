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
// Exportar Btn EventListener
// TODO Implement Import / Export

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

// Mount Table
function mountTable() {
    // Load Data if no Data is Present
    if (Object.keys(extensionGlobalData.values).length === 0) { getValues(); return; }

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
            values[exam_Type].default = Number(filteredText.replace(",","."));
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
            examSpanElem.innerText = `${values[exam_Type][exam].default}`;
            examSpanElem.contentEditable = 'plaintext-only';
            examSpanElem.addEventListener('input', (event) => {
                // Filter Input
                const text = event.target.innerText;
                const filteredText = text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g) ? text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g)[0] : '0';
                event.target.innerText = filteredText;
                window.getSelection().collapse(event.target.firstChild, filteredText.length);

                // Update Stored Value
                values[exam_Type][exam].default = Number(filteredText.replace(",","."));
                setTimeout(updateStorage, 0);
            });

            if (extensionGlobalData.seguros) {
                for (const seguro in values[exam_Type][exam]) {
                    if (seguro === "default") {continue;}
                    const seguroRowElem = document.createElement('tr');
                    const seguroNameElem = document.createElement('td');
                    const seguroValueElem = document.createElement('td');
                    const seguroSpanElem = document.createElement('span');

                    tableRows.push(seguroRowElem);
                    seguroRowElem.replaceChildren(seguroNameElem, seguroValueElem);
                    seguroValueElem.replaceChildren(seguroSpanElem, document.createTextNode("€"));
                    seguroNameElem.innerText = seguro;
                    seguroRowElem.classList.add('exam-row');
                    seguroNameElem.classList.add('exam-name');
                    seguroValueElem.classList.add('exam-value');
                    seguroSpanElem.innerText = `${values[exam_Type][exam][seguro].value}`;
                    seguroSpanElem.contentEditable = 'plaintext-only';
                    seguroSpanElem.addEventListener('input', (event) => {
                        // Filter Input
                        const text = event.target.innerText;
                        const filteredText = text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g) ? text.match(/[1-9][0-9]*(,)?([0-9]*[1-9])?/g)[0] : '0';
                        event.target.innerText = filteredText;
                        window.getSelection().collapse(event.target.firstChild, filteredText.length);

                        // Update Stored Value
                        values[exam_Type][exam][seguro].value = Number(filteredText.replace(",","."));
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