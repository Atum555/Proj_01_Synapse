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
    const table = document.getElementById("content-table");

    // Extract Data (create a worksheet object from the table)
    const ws = XLSX.utils.table_to_sheet(table);


    // Get the number of columns in the worksheet
    const numberOfColumns = ws['!ref'].split(':')[1].charCodeAt(0) - ws['!ref'].split(':')[0].charCodeAt(0) + 1;

    // Initialize an array to store maximum column widths
    const columnWidths = new Array(numberOfColumns).fill(0);

    // Iterate through each row in the worksheet
    ws.forEach(function (row) {
        // Iterate through each cell in the row
        row.forEach(function (cell, columnIndex) {
            // Calculate the content length of the cell (you may need to adjust this based on your content)
            const contentLength = cell && cell.w ? cell.w.length : 0;

            // Update the maximum width for the column if the content length is greater than the current maximum
            if (columnWidths[columnIndex] < contentLength) {
                columnWidths[columnIndex] = contentLength;
            }
        });
    });

    // Set the column widths based on the maximum content length
    columnWidths.forEach(function (width, columnIndex) {
        const excelWidth = (width + 2) * 256; // Adding extra width for padding

        // Update the column width in the worksheet
        ws['!cols'] = ws['!cols'] || [];
        ws['!cols'][columnIndex] = { width: excelWidth };
    });


    // Add Total
    XLSX.utils.sheet_add_aoa(ws, [["Total:", `${document.getElementById('table-total').innerText}€`]], { origin: -1 });

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Folha1');

    // Package and Release Data
    XLSX.writeFile(wb, "Report.xlsx");
});