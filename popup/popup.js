// Update Table Data
let globalData = {};
function handleResponse(response) {
    const rData = response?.data;
    const totalElem = document.getElementById('table-total');
    const warningElem = document.getElementById('content-warning');
    const tableElem = document.getElementById('content-table');
    const tbodyElem = document.getElementById('table-body');
    const titleElem = document.querySelector('title');

    // No data
    if (response === 'no-data') {
        totalElem.innerText = '0000';
        tableElem.style.display = 'none';
        warningElem.innerText = 'Não existem exames para esta data.';
        warningElem.style.display = '';
        globalData = {};
        return;
    }
    // Wrong WebSite
    if (response === 'wrong-site') {
        totalElem.innerText = '0000';
        tableElem.style.display = 'none';
        warningElem.innerText = 'WebSite inválido.';
        warningElem.style.display = '';
        globalData = {};
        return;
    }
    // Error
    if (!rData) {
        totalElem.innerText = '0000';
        tableElem.style.display = 'none';
        warningElem.innerText = 'Loading...';
        warningElem.style.display = '';
        globalData = {};
        return;
    }

    // Data Population
    let data = {};
    rData.forEach((item) => {
        // Exam Type
        const exam_Type = item.exam_Type;
        const seguro = item.seguro;

        // Create exam_Type if non existent
        if (!data.hasOwnProperty(exam_Type)) {
            data[exam_Type] = { 'name': exam_Type, 'count': 0, 'subTotalOuter': 0, 'exams': {}, 'seguros': {} };
        }

        // Exams
        item.exams.forEach((exam) => {
            const defaultValue = 10;
            const seguroValue = 0;
            const value = seguroValue | defaultValue;
            // Create exam if non existent
            if (!data[exam_Type].exams.hasOwnProperty(exam)) {
                data[exam_Type].exams[exam] = {
                    'name': exam,
                    'count': 0,
                    'value': defaultValue,
                    'subTotalInner': 0,
                    'seguros': {}
                };
            }
            // Create seguro if non existent
            if (!data[exam_Type].exams[exam].hasOwnProperty(seguro)) {
                data[exam_Type].exams[exam][seguro] = {
                    'name': seguro,
                    'count': 0,
                    'value': seguroValue,
                    'subTotalSeguro': 0
                }
            }
            // Increase exam_Type count
            // Increase exam count
            // Increase seguro count
            // Increase subTotalSeguro
            // Increase subTotalInner
            // Increase subTotalOuter
            data[exam_Type].count += 1;
            data[exam_Type].exams[exam].count += 1;
            data[exam_Type].exams[exam][seguro].count += 1;
            data[exam_Type].exams[exam][seguro].subTotalSeguro += value;
            data[exam_Type].exams[exam].subTotalInner += value;
            data[exam_Type].subTotalOuter += value;
        });
    });

    // Don't update DOM if data didn't change
    if (JSON.stringify(globalData) === JSON.stringify(data)) { return; }
    globalData = data;

    // Rows list && Total value
    let rows = [];
    let total = 0;
    for (const exam_Type in data) {
        const exams = data[exam_Type].exams;

        // First row of this exam_Type
        let first = true;

        // Update total
        total += data[exam_Type].subTotalOuter;

        for (const exam in exams) {
            const nameElem = document.createElement('td');
            const countElem = document.createElement('td');
            const subTotalInnerElem = document.createElement('td');

            nameElem.innerText = exams[exam].name;
            countElem.innerText = exams[exam].count;
            subTotalInnerElem.innerText = `${exams[exam].subTotalInner}€`;

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
        }
    }
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
}

// Read Page Data
function updateTable() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const year = document.getElementsByClassName('year-btn-active')[0].innerText;
        let months = [];
        Array(...document.getElementsByClassName('month-btn-active')).forEach((monthElem) => {
            months.push(monthElem.innerText);
        });
        const monthMapperStart = {
            'Jan': '01/01/',
            'Fev': '01/02/',
            'Mar': '01/03/',
            'Abr': '01/04/',
            'Mai': '01/05/',
            'Jun': '01/06/',
            'Jul': '01/07/',
            'Ago': '01/08/',
            'Set': '01/09/',
            'Out': '01/10/',
            'Nov': '01/11/',
            'Dez': '01/12/'
        }
        const monthMapperEnd = {
            'Jan': '31/01/',
            'Fev': (Number(year) % 4 ? '28/02/' : '29/02/'),
            'Mar': '31/03/',
            'Abr': '30/04/',
            'Mai': '31/05/',
            'Jun': '30/06/',
            'Jul': '31/07/',
            'Ago': '31/08/',
            'Set': '30/09/',
            'Out': '31/10/',
            'Nov': '30/11/',
            'Dez': '31/12/'
        }

        const startDate = monthMapperStart[months[months.length - 1]] + year;
        const endDate = monthMapperEnd[months[0]] + year;
        const data = {
            'startDate': startDate,
            'endDate': endDate,
            'months': months,
            'year': year
        }

        // ! console!
        console.log(data);
        // Send Message
        const activeTab = tabs[0];
        if (tabs[0].url.match('https://cwm.trofasaude.com/*')) {
            chrome.tabs.sendMessage(activeTab.id, { "data": data }, handleResponse);
        } else {
            handleResponse("wrong-site");
        }
    });
}
// AutoUpdate Table
setInterval(updateTable, 250);

// Generate NavBar
(() => {
    for (let i = 0; i < 10; i++) {
        const yearBtn = document.createElement("button");
        yearBtn.classList.add("year-btn");
        const date = new Date();
        const yearNumber = String(date.getFullYear() - i);
        yearBtn.innerText = yearNumber;
        document.getElementById("year-selector").appendChild(yearBtn);
    }


    // Add event listeners to years buttons
    document.querySelectorAll(".year-btn").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            // Remove Old Active
            document.querySelectorAll(".year-btn").forEach((btn) => {
                btn.classList.remove("year-btn-active");
            });
            // Set Active
            event.target.classList.add("year-btn-active");

            // Create months buttons
            const numberToMonth = {
                1: "Jan",
                2: "Fev",
                3: "Mar",
                4: "Abr",
                5: "Mai",
                6: "Jun",
                7: "Jul",
                8: "Ago",
                9: "Set",
                10: "Out",
                11: "Nov",
                12: "Dez"
            }
            const date = new Date();
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth();
            const maxMonth = Number(btn.innerText) == currentYear ? currentMonth + 1 : 12;
            let months = [];
            for (let i = maxMonth; i >= 1; i--) {
                const monthBtn = document.createElement("button");
                monthBtn.classList.add("month-btn");
                monthBtn.innerText = numberToMonth[i];
                months.push(monthBtn);
            }
            document.getElementById("month-selector").replaceChildren(...months);

            // Add event listeners to months buttons
            document.querySelectorAll(".month-btn").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    const thisBtn = event.target;

                    // If month not active
                    if (thisBtn.classList.length == 1) {
                        const activeMonths = Array(...document.getElementsByClassName("month-btn-active"));

                        // If thisMonth not next to an active month remove all active months 
                        if (
                            (thisBtn.nextSibling ? thisBtn.nextSibling.classList.length == 1 : true) &&
                            (thisBtn.previousSibling ? thisBtn.previousSibling.classList.length == 1 : true)
                        ) {
                            activeMonths.forEach((btn) => {
                                btn.classList.remove("month-btn-active");
                            });
                        }
                        // Set this month to active
                        thisBtn.classList.add("month-btn-active");
                        updateTable();
                        return;
                    }
                    // If month active and one of the siblings active and the other not
                    if (
                        ((thisBtn.nextSibling ? thisBtn.nextSibling.classList.length == 2 : false) &&
                            !(thisBtn.previousSibling ? thisBtn.previousSibling.classList.length == 2 : false)) ||
                        (!(thisBtn.nextSibling ? thisBtn.nextSibling.classList.length == 2 : false) &&
                            (thisBtn.previousSibling ? thisBtn.previousSibling.classList.length == 2 : false))
                    ) {
                        thisBtn.classList.remove("month-btn-active");
                        updateTable();
                    }
                });
            });
            // Dispatch click on first month
            document.querySelector(".month-btn").dispatchEvent(new Event("click"));
        });
    });
    // Dispatch click on first year
    document.querySelector(".year-btn").dispatchEvent(new Event("click"));
})();

// Add Buttons EventListeners
document.getElementById('pdf-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    if (JSON.stringify(globalData) === JSON.stringify({})) { return; }
    let myWindow = window.open('', 'PRINT', 'height=400,width=600');

    myWindow.document.write('<html><head>');
    myWindow.document.write(document.querySelector("head").innerHTML);
    myWindow.document.write('</head><body><header>');
    myWindow.document.write(document.querySelector("header").innerHTML);
    myWindow.document.write('</header><main>');
    myWindow.document.write(document.querySelector("main").innerHTML);
    myWindow.document.write('</main>');
    myWindow.document.write('</body></html>');

    myWindow.document.close(); // necessary for IE >= 10
    myWindow.focus(); // necessary for IE >= 10*/
/*     myWindow.document.addEventListener('readystatechange', (event) => {
        if (event.target.readyState === "complete") {
            myWindow.print();
            myWindow.close();
        }
    }); */
    setTimeout(() => {
        myWindow.print();
        myWindow.close();
    }, 500);
});
/* TODO
 - Add Excel Btn EventListeners
*/