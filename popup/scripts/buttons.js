// PDF Button Event Listener
document.getElementById('pdf-btn').addEventListener('click', (event) => {
    event.preventDefault();
    if (JSON.stringify(extensionGlobalData?.data) === JSON.stringify({})) { return; }
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
    const nav = document.getElementById('date-selector');
    setTimeout(() => {
        myWindow.document.getElementById('date-selector').scrollLeft = nav.scrollLeft;
        myWindow.print();
        myWindow.close();
    }, 500);
});

// Excel Button Event Listener
document.getElementById('excel-btn').addEventListener('click', (event) => {
    // TODO Add Excel Button Functionality
});