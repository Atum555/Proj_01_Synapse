/* function sendData() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        const text = document.getElementById("inText").value;
        chrome.tabs.sendMessage(activeTab.id, { "data": text }, handleResponse);
    });
}

function handleResponse(response) {
    document.getElementById("inText").style.borderColor = response ? "salmon" : "chartreuse";
}

document.getElementById('inText').addEventListener('input', sendData);
setInterval(sendData, 250); */

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

            // Add event listeners to years buttons
            document.querySelectorAll(".month-btn").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    document.querySelectorAll(".month-btn").forEach((btn) => {
                        btn.classList.remove("month-btn-active");
                    });
                    event.target.classList.add("month-btn-active");
                });
            });
            // Dispatch click on first month
            document.querySelector(".month-btn").dispatchEvent(new Event("click"));
        });
    });
    // Dispatch click on first year
    document.querySelector(".year-btn").dispatchEvent(new Event("click"));
})();