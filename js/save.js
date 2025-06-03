document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('download-csv');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      const table = document.querySelector('#results-container table');
      if (!table) return;

      // Bestimme Spaltenanzahl anhand der obersten Tabellen-Zeile
      const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
      const numCols = headerRow ? headerRow.querySelectorAll('th, td').length : 0;

      const rows = Array.from(table.querySelectorAll('tr'));
      const csvLines = rows.map(tr => {
        const cells = Array.from(tr.querySelectorAll('th, td'));
        // Zelleninhalte ohne Zeilenumbrüche
        const rowTexts = cells.map(cell => cell.textContent.replace(/\r?\n/g, ' ').replace(/"/g, '""'));
        // Fehlen Spalten, auffüllen mit leeren Strings
        while (rowTexts.length < numCols) {
          rowTexts.push('');
        }
        return rowTexts.map(text => `"${text}"`).join(';');
      });

      const csvBlob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(csvBlob);
      link.download = 'ergebnisse.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});