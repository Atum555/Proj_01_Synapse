// Auxiliary Functions
function getMonthsSelected() {
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
                'endDate': endDate
            });
        }
        // Delete year record
        selected.splice(selected.indexOf(yearObj), 1);
    }
    extensionGlobalData.state.searchIntervals = searchIntervals;
}