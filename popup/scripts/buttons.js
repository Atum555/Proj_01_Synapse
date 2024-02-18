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

    // !!!!
    // Get the range of cells in the worksheet
    var range = XLSX.utils.decode_range(ws['!ref']);
    var columnCount = range.e.c - range.s.c + 1;

    // Initialize an array to store maximum column widths
    var columnWidths = new Array(columnCount).fill(0);

    // Iterate through each cell in the range
    for (var R = range.s.r; R <= range.e.r; ++R) {
        for (var C = range.s.c; C <= range.e.c; ++C) {
            // Get the address of the current cell
            var cellAddress = { c: C, r: R };

            // Convert the cell address to A1 notation
            var cellRef = XLSX.utils.encode_cell(cellAddress);

            // Get the value of the cell
            var cell = ws[cellRef];

            // Calculate the content length of the cell (you may need to adjust this based on your content)
            var contentLength = cell && cell.w ? cell.w.length : 0;

            // Update the maximum width for the column if the content length is greater than the current maximum
            if (columnWidths[C] < contentLength) {
                columnWidths[C] = contentLength;
            }
        }
    }

    // Set the column widths based on the maximum content length
    columnWidths.forEach(function (width, columnIndex) {
        // Excel's column width unit is 1/256th of the width of the zero character, so you may need to adjust your widths accordingly
        var excelWidth = (width + 2) * 256; // Adding extra width for padding

        // Update the column width in the worksheet
        ws['!cols'] = ws['!cols'] || [];
        ws['!cols'][columnIndex] = { width: excelWidth };
    });


    // !!!!

    // Add Total
    XLSX.utils.sheet_add_aoa(ws, [["Total:", `${document.getElementById('table-total').innerText}€`]], { origin: -1 });

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Folha1');

    // Package and Release Data
    XLSX.writeFile(wb, "Report.xlsx");
});