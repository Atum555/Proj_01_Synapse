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
                'pages': [],
                'records': [],
                'count': 0
            });
        }
        // Delete year record
        selected.splice(selected.indexOf(yearObj), 1);
    }
    extensionGlobalData.state.searchIntervals = searchIntervals;
    extensionGlobalData.records = [];
    extensionGlobalData.data = [];
}

function mountTable() {
    // TODO Check if table mount works

    const titleElem = document.querySelector('title');
    const totalElem = document.getElementById('table-total');
    const warningElem = document.getElementById('content-warning');
    const tableElem = document.getElementById('content-table');
    const tbodyElem = document.getElementById('table-body');

    // Parse Records
    let data = [];
    extensionGlobalData.records.forEach((record) => {
        // Exam Type
        const exam_Type = record.exam_Type;
        const seguro = record.seguro;

        // Create exam_Type if non existent
        if (!data.some((e) => e.name === exam_Type )) {
            data.push({
                'name': exam_Type,
                'exams': [],
                'count': 0,
                'total': 0
            });
        }
        const d_Exam_Type = data.find((e) => e.name === exam_Type );

        // Exams
        record.exams.forEach((exam) => {
            // TODO Insert Real Values Here
            const defaultValue = 10;
            const seguroValue = 0;
            const value = seguroValue | defaultValue;


            // Create exam if non existent
            if (!d_Exam_Type.exams.some((e) => e.name == exam )) {
                d_Exam_Type.exams.push({
                    'name': exam,
                    'count': 0,
                    'total': 0,
                    'value': defaultValue,
                    'seguros': []
                });
            }
            const d_Exam = d_Exam_Type.exams.find((e) => e.name === exam );


            // Create seguro if non existent
            if (!d_Exam.seguros.some((e) =>  e.name === seguro )) {
                d_Exam.seguros.push({
                    'name': seguro,
                    'count': 0,
                    'value': seguroValue,
                    'total': 0
                });
            }
            const d_Seguro = d_Exam.seguros.find((e) => e.name === seguro );

            // Increase exam_Type count
            // Increase subTotalOuter
            // Increase exam count
            // Increase subTotalInner
            // Increase seguro count
            // Increase subTotalSeguro
            d_Exam_Type.count += 1;
            d_Exam_Type.total += value;
            d_Exam.count += 1;
            d_Exam.total += value;
            d_Seguro.count += 1;
            d_Seguro.total += value;
        });
    });

    // Don't update DOM if data didn't change
    if (JSON.stringify(extensionGlobalData.data) === JSON.stringify(data)) { return; }
    extensionGlobalData.data = data;


    // Rows list && Total value
    let total = 0;
    let tableRows = [];
    data.forEach((exam_Type) => {
        // First row of this exam_Type
        let examTypeFirst = true;

        // Update total
        total += exam_Type.total;

        // Exam_Type Specific Elements
        const examTypeRowElem = document.createElement('tr');
        const examTypeNameElem = document.createElement('td');
        const examTypeTotalElem = document.createElement('td');

        tableRows.push(examTypeRowElem);
        examTypeTotalElem.innerHTML = `${exam_Type.count}<br>${exam_Type.total}<span class="examTypeEuro">€</span>`;
        examTypeNameElem.innerText = exam_Type.name;

        // Init RowSpan
        examTypeNameElem.rowSpan = 0;
        examTypeTotalElem.rowSpan = 0;

        exam_Type.exams.forEach((exam) => {
            // First row of this exam
            let examFirst = true;

            // Exam Specific Elements
            const examNameElem = document.createElement('td');
            const examCountElem = document.createElement('td');
            const examTotalElem = document.createElement('td');

            examNameElem.innerText = exam.name;
            examCountElem.innerText = exam.count;
            examTotalElem.innerHTML = `${exam.total}<span class="examEuro">€</span>`;
            examNameElem.rowSpan = exam.seguros.length;
            examCountElem.rowSpan = exam.seguros.length;
            examTotalElem.rowSpan = exam.seguros.length;

            // Increase ExamType RowSpan Count
            examTypeNameElem.rowSpan += exam.seguros.length;
            examTypeTotalElem.rowSpan += exam.seguros.length;

            exam.seguros.forEach((seguro) => {
                const seguroNameElem = document.createElement('td');
                const seguroCountElem = document.createElement('td');
                const seguroTotalElem = document.createElement('td');

                seguroNameElem.innerText = seguro.name;
                seguroCountElem.innerHTML = seguro.count;
                seguroTotalElem.innerText = `${seguro.total}€`;

                // First row of this exam_Type
                if (examTypeFirst) {
                    examTypeFirst = false;
                    examFirst = false;
                    examTypeRowElem.replaceChildren(
                        examTypeTotalElem, examTypeNameElem,
                        examNameElem, examCountElem, examTotalElem,
                        seguroNameElem, seguroCountElem, seguroTotalElem
                    );
                    return;
                }

                const rowElem = document.createElement('tr');
                tableRows.push(rowElem);

                // First row of this exam
                if (examFirst) {
                    examFirst = false;
                    rowElem.replaceChildren(
                        examNameElem, examCountElem, examTotalElem,
                        seguroNameElem, seguroCountElem, seguroTotalElem
                    );
                    return;
                }

                rowElem.replaceChildren(
                    seguroNameElem, seguroCountElem, seguroTotalElem
                );
            });
        });
    });

    // Update Table
    tbodyElem.replaceChildren(...tableRows);
    totalElem.innerText = total;
    warningElem.style.display = 'none';
    tableElem.style.display = '';

    // Update Title
    titleElem.innerText = "Extrato";
    extensionGlobalData.selected.forEach((year) => {
        titleElem.innerText += ` - ${year.year}`;

        const months = JSON.parse(JSON.stringify(year.months) || {});
        months.sort((a, b) => a - b);

        const numberToMonth = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        months.forEach((month) => {
            titleElem.innerText += ` ${numberToMonth[month - 1]}`;
        });
    });
    return;
}

function whatToAskNext(previousMessage) {
    // Update
    updateSelection();

    const message = {};
    // Nothing
    if (extensionGlobalData.state.complete || extensionGlobalData.state.searchIntervals.length === 0) {
        message['nothing'] = true;
        return message;
    }

    // Incomplete Interval Search Next Page
    for (let i = 0; i < extensionGlobalData.state.searchIntervals.length; i++) {
        const interval = extensionGlobalData.state.searchIntervals[i];

        if (interval.startDate === previousMessage.startDate && interval.endDate === previousMessage.endDate && previousMessage.nextBtn) {
            message['nextPage'] = true;
            return message;
        }
    }

    // Search Missing Intervals
    for (let i = 0; i < extensionGlobalData.state.searchIntervals.length; i++) {
        const interval = extensionGlobalData.state.searchIntervals[i];

        if (!interval.complete) {
            message['search'] = true;
            message['startDate'] = interval.startDate;
            message['endDate'] = interval.endDate;
            return message;
        }
    }

    // TODO Remove This!
    message['nothing'] = true;
    return message;
    // TODO Check if logic Works
}