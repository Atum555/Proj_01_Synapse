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

    // Acquire Data (reference to the HTML table)
    const table_elt = document.getElementById("content-table");

    // Extract Data (create a workbook object from the table)
    var workbook = XLSX.utils.table_to_book(table_elt);

    // Process Data (add a new row)
    var ws = workbook.Sheets["Sheet1"];
    XLSX.utils.sheet_add_aoa(ws, [["Created " + new Date().toISOString()]], { origin: -1 });

    // Package and Release Data (`writeFile` tries to write and save an XLSB file)
    XLSX.writeFile(workbook, "Report.xlsb");
});