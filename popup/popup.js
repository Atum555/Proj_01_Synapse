function handleResponse(response) {
    console.log(response);
    const rData = response?.data;
    const totalElem = document.getElementById('table-total');
    const tableElem = document.getElementById('content-table');
    const warningElem = document.getElementById('content-warning');

    // No data
    if ( !rData || rData?.length == 0) {
        totalElem.innerText = '0000';
        tableElem.style.display = 'none';
        warningElem.style.display = '';
        return;
    }

    // Data Population
    tableElem.style.display = '';
    warningElem.style.display = 'none';

    let data = {};
    rData.forEach((item) => {
        // Exam Type
        if (!data.hasOwnProperty(item.exam_Type)) { data[item.exam_Type] = { 'count': 0, 'exams': {}, 'seguros': {} }; }
        data.count += 1;

        // Exams
        item.exams.forEach((exam) => {
            if (!data[item.exam_Type].exams.hasOwnProperty(exam)) { data[item.exam_Type].exams[exam] = 0; }
            data[item.exam_Type].exams[exam] += 1;
        });

        // Seguros
        if (!data[item.exam_Type].seguros.hasOwnProperty(item.seguro)) { data[item.exam_Type].seguros[item.seguro] = 0; }
        data[item.exam_Type].seguros[item.seguro] += 1;
    });

    console.log(data);
}

function sendRequest() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const year = document.getElementsByClassName('year-btn-active')[0].innerText;
        const month = document.getElementsByClassName('month-btn-active')[0].innerText;
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
        const startDate = monthMapperStart[month] + year;
        const endDate = monthMapperEnd[month] + year;
        const data = {
            'startDate': startDate,
            'endDate': endDate,
            'month': month,
            'year': year
        }

        // Send Message
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { "data": data }, handleResponse);
    });
}
setInterval(sendRequest, 250);

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

            // Remove old months buttons
            document.querySelectorAll(".month-btn").forEach((btn) => {
                btn.remove();
            });

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
            for (let i = maxMonth; i >= 1; i--) {
                const monthBtn = document.createElement("button");
                monthBtn.classList.add("month-btn");
                monthBtn.innerText = numberToMonth[i];
                document.getElementById("month-selector").appendChild(monthBtn);
            }

            // Add event listeners to months buttons
            document.querySelectorAll(".month-btn").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    document.querySelectorAll(".month-btn").forEach((btn) => {
                        btn.classList.remove("month-btn-active");
                    });
                    event.target.classList.add("month-btn-active");
                    sendRequest();
                });
            });
            // Dispatch click on first month
            document.querySelector(".month-btn").dispatchEvent(new Event("click"));
        });
    });
    // Dispatch click on first year
    document.querySelector(".year-btn").dispatchEvent(new Event("click"));
})();