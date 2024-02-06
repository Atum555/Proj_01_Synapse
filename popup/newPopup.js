let extensionGlobalData = {
    'selected': [],
    'state': {   
        'complete': false,
        'searchIntervals': []
    }
}

function getMonthsSelected() {
    let months = [];
    Array(...document.getElementsByClassName('month-btn-active')).forEach((monthElem) => {
        months.push(monthElem.innerText);
    });
}