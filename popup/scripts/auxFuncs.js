// Auxiliary Functions
function updateSelection() {
    const selected = [];
    Array(...document.getElementsByClassName('month-btn-active')).forEach((monthElem) => {
        const id = monthElem.id;
        const year = id.split('-')[1];
        const month = id.split('-')[2];

        let hasYear = false;
        for (let i = 0; i < selected.length; i++) {
            const yearObj = selected[i];
            if (yearObj.year === year) {
                yearObj.months.push(month);
                hasYear = true;
            }
        }
        if (!hasYear) {
            selected.push({
                'year': year,
                'months': [month]
            });
        }
    });
    // Compare with global
    if (JSON.stringify(extensionGlobalData.selected) !== JSON.stringify(selected)) {
        extensionGlobalData.selected = selected;
        extensionGlobalData.state.complete = false;
        extensionGlobalData.state.searchIntervals = [];
        extensionGlobalData.data = [];
        calculateSearchIntervals();
        return true;
    }
    return false;
}

function calculateSearchIntervals() {
    const searchIntervals = [];
    const selected = JSON.parse(JSON.stringify(extensionGlobalData.selected) || JSON.stringify({}));
    while (selected.length) {
        const yearObj = selected[0];
        const year = Number(yearObj.year);
        while (yearObj.months.length) {
            // Create Limits (Range)
            const pivot = Number(yearObj.months[0]);
            const range = [[pivot, year], [pivot, year]];
            // Remove month
            yearObj.months.shift();

            // Search
            let lookForward = true;
            let lookBackward = true;
            while (lookForward) {
                lookForward = false;
                const next = [
                    range[1][0] + 1 > 12 ? 1 : range[1][0] + 1,
                    range[1][0] + 1 > 12 ? range[1][1] + 1 : range[1][1]
                ];
                for (let i = 0; i < selected.length; i++) {
                    const subYearObject = selected[i];
                    if (subYearObject.year === String(next[1]) && subYearObject.months.indexOf(String(next[0])) !== -1) {
                        const index = subYearObject.months.indexOf(String(next[0]));
                        subYearObject.months.splice(index, 1);
                        range[1] = next;
                        lookForward = true
                        break;
                    }
                }
            }
            while (lookBackward) {
                lookBackward = false;
                const next = [
                    range[0][0] - 1 <= 0 ? 12 : range[0][0] - 1,
                    range[0][0] - 1 <= 0 ? range[0][1] - 1 : range[0][1]
                ];
                for (let i = 0; i < selected.length; i++) {
                    const subYearObject = selected[i];
                    if (subYearObject.year === String(next[1]) && subYearObject.months.indexOf(String(next[0])) !== -1) {
                        const index = subYearObject.months.indexOf(String(next[0]));
                        subYearObject.months.splice(index, 1);
                        range[0] = next;
                        lookBackward = true
                        break;
                    }
                }
            }

            // Converto Into Dates
            const monthMapperStart = ['01/01/', '01/02/', '01/03/', '01/04/', '01/05/', '01/06/', '01/07/', '01/08/', '01/09/', '01/10/', '01/11/', '01/12/'];
            const monthMapperEnd = ['31/01/', (Number(year) % 4 ? '28/02/' : '29/02/'), '31/03/', '30/04/', '31/05/', '30/06/', '31/07/', '31/08/', '30/09/', '31/10/', '30/11/', '31/12/'];
            const startDate = monthMapperStart[range[0][0] - 1] + String(range[0][1]);
            const endDate = monthMapperEnd[range[1][0] - 1] + String(range[1][1]);
            searchIntervals.push({
                'complete': false,
                'startDate': startDate,
                'endDate': endDate,
                'records': [],
                'count': 0
            });
        }
        // Delete year record
        selected.splice(selected.indexOf(yearObj), 1);
    }
    extensionGlobalData.state.searchIntervals = searchIntervals;
}

function mountTable() {
    const titleElem = document.querySelector('title');
    const totalElem = document.getElementById('table-total');
    const warningElem = document.getElementById('content-warning');
    const tableElem = document.getElementById('content-table');
    const tbodyElem = document.getElementById('table-body');

    // Data Population
    let data = [];
    extensionGlobalData.records.forEach((record) => {
        // Exam Type
        const exam_Type = record.exam_Type;
        const seguro = record.seguro;

        // Create exam_Type if non existent
        if (!data.some((e) => { e.name === exam_Type })) {
            data.push({
                'name': exam_Type,
                'exams': [],
                'count': 0,
                'subTotalOuter': 0
            });
        }
        const d_Exam_Type = data.find((e) => { e.name === exam_Type });

        // Exams
        record.exams.forEach((exam) => {
            // TODO Insert Real Values Here
            const defaultValue = 10;
            const seguroValue = 0;
            const value = seguroValue | defaultValue;

            
            // Create exam if non existent
            if (!d_Exam_Type.exams.some((e) => { e.name == exam })) {
                d_Exam_Type.exams.push({
                    'name': exam,
                    'count': 0,
                    'subTotalInner': 0,
                    'value': defaultValue,
                    'seguros': []
                });
            }
            const d_Exam = d_Exam_Type.find((e) => { e.name === exam });
            
            
            // Create seguro if non existent
            if (!d_Exam.seguros.some((e) => { e.name === seguro })) {
                d_Exam.seguros.push({
                    'name': seguro,
                    'count': 0,
                    'value': seguroValue,
                    'subTotalSeguro': 0
                });
            }
            const d_Seguro = d_Exam.find((e) => {e.name === seguro});
            
            // Increase exam_Type count
            // Increase subTotalOuter
            // Increase exam count
            // Increase subTotalInner
            // Increase seguro count
            // Increase subTotalSeguro
            d_Exam_Type.count += 1;
            d_Exam_Type.subTotalOuter += value;
            d_Exam.count += 1;
            d_Exam.subTotalInner += value;
            d_Seguro.count += 1;
            d_Seguro.subTotalSeguro += value;
        });
    });
    
    // Don't update DOM if data didn't change
    if (JSON.stringify(extensionGlobalData.data) === JSON.stringify(data)) { return; }
    extensionGlobalData.data = data;
    

    // Rows list && Total value
    let total = 0;
    let rows = [];
    data.forEach((exam_Type) => {
        const exams = exam_Type.exams;
        
        // First row of this exam_Type
        let first = true;
        
        // Update total
        total += exam_Type.subTotalOuter;
        
        // TODO IMPORTANT Keep Checking Mount Table Logic

        exam_Type.exams.forEach((exam) => {
            const examNameElem = document.createElement('td');
            const countExamElem = document.createElement('td');
            const subTotalInnerElem = document.createElement('td');


            nameElem.innerText = exam.name;
            countElem.innerText = exam.count;
            subTotalInnerElem.innerText = `${exam.subTotalInner}€`;

            // First row of this exam_Type
            if (first) {
                first = false;

                const mainRowElem = document.createElement('tr');
                const subTotalOuterElem = document.createElement('td');
                const mainNameElem = document.createElement('td');

                subTotalOuterElem.innerHTML =
                    `${data[exam_Type].count}<br>${data[exam_Type].subTotalOuter}<span>€</span>`;

                subTotalOuterElem.rowSpan = Object.keys(exams).length;

                mainNameElem.innerText = data[exam_Type].name;
                mainNameElem.rowSpan = Object.keys(exams).length;
                mainRowElem.replaceChildren(subTotalOuterElem, mainNameElem, nameElem, countElem, subTotalInnerElem);
                rows.push(mainRowElem);
            }
            // Other rows of this exam_Type
            else {
                const tr = document.createElement('tr');
                tr.replaceChildren(nameElem, countElem, subTotalInnerElem);
                rows.push(tr);
            }
        });
    });
    tbodyElem.replaceChildren(...rows);
    totalElem.innerText = total;
    warningElem.style.display = 'none';
    tableElem.style.display = '';

    // Update Title
    const year = document.getElementsByClassName('year-btn-active')[0].innerText;
    let months = [];
    Array(...document.getElementsByClassName('month-btn-active')).forEach((monthElem) => {
        months.push(monthElem.innerText);
    });
    titleElem.innerText = `Extrato - ${year} - ${months.join(" ")}`;

    // TODO Make mount table Logic
    return;
}

function whatToAskNext(previous) {
    // Update
    updateSelection();

    const message = {};
    // Nothing
    if (extensionGlobalData.state.complete || extensionGlobalData.state.searchIntervals.length === 0) {
        message['nothing'] = true;
        return message;
    }

    // TODO Make What to ask next Logic
}