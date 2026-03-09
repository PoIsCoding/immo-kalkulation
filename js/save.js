/**
 * save.js
 * Ermöglicht den Export der Ergebnistabelle als CSV-Datei.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.0.0
 */

document.addEventListener('DOMContentLoaded', function () {
  Logger.info('save.js: DOMContentLoaded');

  const downloadBtn = document.getElementById('download-csv');
  if (!downloadBtn) {
    Logger.debug('save.js: #download-csv nicht gefunden – kein Export-Button');
    return;
  }

  downloadBtn.addEventListener('click', function () {
    Logger.info('save.js: CSV-Download gestartet');

    // Tabelle im Ergebnis-Container suchen
    const table = document.querySelector('#results-container table');
    if (!table) {
      Logger.warn('save.js: Keine Tabelle im #results-container gefunden');
      return;
    }

    // Spaltenanzahl aus der Header-Zeile ermitteln
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    const numCols   = headerRow ? headerRow.querySelectorAll('th, td').length : 0;
    Logger.debug(`save.js: Tabelle hat ${numCols} Spalten`);

    // Alle Zeilen durchgehen und in CSV konvertieren
    const rows     = Array.from(table.querySelectorAll('tr'));
    const csvLines = rows.map(tr => {
      const cells    = Array.from(tr.querySelectorAll('th, td'));
      // Zelleninhalt bereinigen (keine Zeilenumbrüche, Anführungszeichen escapen)
      const rowTexts = cells.map(cell =>
        cell.textContent.replace(/\r?\n/g, ' ').replace(/"/g, '""').trim()
      );
      // Fehlende Spalten mit leeren Strings auffüllen
      while (rowTexts.length < numCols) rowTexts.push('');
      return rowTexts.map(text => `"${text}"`).join(';');
    });

    Logger.info(`save.js: ${csvLines.length} Zeilen als CSV aufbereitet`);

    // CSV-Blob erstellen und Download auslösen
    const csvContent = '\uFEFF' + csvLines.join('\n'); // BOM für Excel-Kompatibilität
    const csvBlob    = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link       = document.createElement('a');
    link.href        = URL.createObjectURL(csvBlob);
    link.download    = 'immo-ergebnisse.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Logger.info('save.js: CSV-Download erfolgreich ausgelöst ✓');
  });

  Logger.info('save.js: Event-Listener für CSV-Download registriert ✓');
});
