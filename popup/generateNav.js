// Generate NavBar
(() => {
    const nav = document.getElementById('date-selector');

    for (let i = 0; i < 6; i++) {
        // Generate Containers
        const navSubContainer = document.createElement('div');
        const yearContainer = document.createElement('section');
        const monthContainer = document.createElement('section');
        navSubContainer.replaceChildren(yearContainer, monthContainer);
        // Style Containers
        yearContainer.classList.add('year-container');
        monthContainer.classList.add('month-container');

        // Generate Buttons
        const date = new Date();
        const year = date.getFullYear();
        // Generate Year Button
        const yearBtn = document.createElement("button");
        yearBtn.classList.add("year-btn");

        const yearNumber = String(date.getFullYear() - i);
        yearBtn.innerText = yearNumber;
        yearContainer.appendChild(yearBtn);

        // Generate Months Buttons
        const numberToMonth = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const numberToMonthFull = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const maxMonth = i == 0 ? date.getMonth() + 1 : 12;
        for (let j = 1; j <= maxMonth; j++) {
            const monthBtn = document.createElement("button");
            monthBtn.classList.add("month-btn");
            monthBtn.innerText = numberToMonth[j - 1];
            monthBtn.title = `Selecionar ${numberToMonthFull[j - 1]}`;
            monthBtn.id = `mBtn-${year}-${j}`;
            monthBtn.addEventListener('click', function (event) {
                const btn = event.target;
                btn.classList.toggle('month-btn-active');
            });
            // Click present month
            if (i == 0 && j == 1) { monthBtn.click(); }
            monthContainer.appendChild(monthBtn);
        }
        nav.appendChild(navSubContainer);
    }

    const deselectBtn = document.getElementById('deselect-icon');
    deselectBtn.addEventListener('click', () => {
        const monthBtnList = Array(...document.getElementsByClassName('month-btn-active'));
        monthBtnList.forEach((btn) => {
            btn.classList.remove('month-btn-active');
        });
    });
})();