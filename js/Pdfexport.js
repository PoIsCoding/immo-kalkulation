/**
 * pdfExport.js
 * Erstellt eine druckfertige PDF der Ergebnistabelle.
 * Verwendet die Bibliothek html2pdf.js (CDN).
 *
 * Ablauf:
 *  1. Tabelle aus dem DOM klonen
 *  2. Print-spezifisches CSS anwenden
 *  3. html2pdf rendert via html2canvas + jsPDF
 *  4. PDF wird automatisch heruntergeladen
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.1.0
 */

document.addEventListener('DOMContentLoaded', function () {
  Logger.info('pdfExport.js: DOMContentLoaded');

  const pdfBtn = document.getElementById('download-pdf');
  if (!pdfBtn) {
    Logger.warn('pdfExport.js: #download-pdf Button nicht gefunden');
    return;
  }

  pdfBtn.addEventListener('click', function () {
    Logger.info('pdfExport.js: PDF-Export gestartet');

    // Tabelle im Container suchen
    const table = document.querySelector('#results-container table');
    if (!table) {
      Logger.warn('pdfExport.js: Keine Tabelle gefunden – Abbruch');
      alert('Keine Ergebnistabelle gefunden. Bitte berechne zuerst die Ergebnisse.');
      return;
    }

    // Button-Status: Ladeanzeige
    const originalText = pdfBtn.innerHTML;
    pdfBtn.innerHTML   = '⏳ PDF wird erstellt …';
    pdfBtn.disabled    = true;
    Logger.debug('pdfExport.js: Button deaktiviert während Erstellung');

    // --- Wrapper für den PDF-Inhalt bauen ---
    // Wir klonen die Tabelle, damit das Original unberührt bleibt
    const pdfWrapper = document.createElement('div');
    pdfWrapper.id    = 'pdf-print-wrapper';

    // Titel & Datum einfügen
    const now       = new Date();
    const dateStr   = now.toLocaleDateString('de-AT', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const timeStr   = now.toLocaleTimeString('de-AT', {
      hour: '2-digit', minute: '2-digit'
    });

    pdfWrapper.innerHTML = `
      <div style="
        font-family: 'Sora', Arial, sans-serif;
        padding: 12px 8px 20px;
        color: #1a202c;
      ">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
          <div style="
            background: #1a7a4a;
            color: white;
            font-size: 18px;
            font-weight: 700;
            padding: 6px 16px;
            border-radius: 8px;
            letter-spacing: -0.3px;
          ">Immo-Rechner</div>
          <div style="color: #5a6a7a; font-size: 11px;">
            Erstellt am ${dateStr} um ${timeStr} Uhr
          </div>
        </div>
        <p style="font-size: 9px; color: #8899aa; margin-bottom: 14px;">
          ± 10 % Varianz · Alle Angaben sind Richtwerte ohne Gewähr · ©Poramet "PoIsCoding" Bahnschulte
        </p>
      </div>
    `;

    // Tabellen-Klon mit eigenem Styling für PDF
    const tableClone = table.cloneNode(true);
    applyPdfTableStyles(tableClone);
    pdfWrapper.appendChild(tableClone);

    // Wrapper kurz in DOM einhängen (unsichtbar), damit html2pdf ihn rendern kann
    pdfWrapper.style.position = 'absolute';
    pdfWrapper.style.left     = '-9999px';
    pdfWrapper.style.top      = '0';
    document.body.appendChild(pdfWrapper);
    Logger.debug('pdfExport.js: PDF-Wrapper ins DOM eingefügt (unsichtbar)');

    // --- html2pdf-Konfiguration ---
    const filename = `immo-ergebnisse_${dateStr.replace(/\./g, '-')}.pdf`;

    const opt = {
      margin:       [6, 4, 6, 4],          // oben, rechts, unten, links in mm
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.97 },
      html2canvas:  {
        scale:        2,                   // 2× Auflösung für scharfen Druck
        useCORS:      true,
        logging:      false,
        scrollX:      0,
        scrollY:      0
      },
      jsPDF: {
        unit:         'mm',
        format:       'a3',               // A3 Querformat für breite Tabelle
        orientation:  'landscape'
      },
      pagebreak: {
        mode:         ['avoid-all', 'css', 'legacy']
      }
    };

    Logger.info(`pdfExport.js: Starte html2pdf → Dateiname: ${filename}`);

    // html2pdf ausführen
    html2pdf()
      .set(opt)
      .from(pdfWrapper)
      .save()
      .then(function () {
        Logger.info('pdfExport.js: PDF erfolgreich erstellt und Download ausgelöst ✓');
        // Wrapper aus DOM entfernen
        document.body.removeChild(pdfWrapper);
        Logger.debug('pdfExport.js: Temporärer Wrapper aus DOM entfernt');
        // Button wieder aktivieren
        pdfBtn.innerHTML = originalText;
        pdfBtn.disabled  = false;
      })
      .catch(function (err) {
        Logger.error('pdfExport.js: Fehler beim Erstellen der PDF:', err);
        // Cleanup auch im Fehlerfall
        if (document.body.contains(pdfWrapper)) {
          document.body.removeChild(pdfWrapper);
        }
        pdfBtn.innerHTML = originalText;
        pdfBtn.disabled  = false;
        alert('Fehler beim Erstellen der PDF. Bitte versuche es erneut oder nutze die Browser-Druckfunktion (Strg+P).');
      });
  });

  Logger.info('pdfExport.js: Event-Listener für PDF-Export registriert ✓');
});

/**
 * Wendet kompaktes, druckoptimiertes Inline-CSS auf den Tabellen-Klon an.
 * Inline-Styles sind notwendig, da html2canvas externe Stylesheets
 * nicht immer vollständig liest.
 *
 * @param {HTMLElement} tableEl - Geklonte Tabelle
 */
function applyPdfTableStyles(tableEl) {
  Logger.debug('applyPdfTableStyles(): Styles werden auf Tabellenklon angewendet');

  // Basis-Tabellen-Style
  tableEl.style.cssText = `
    border-collapse: collapse;
    width: 100%;
    font-size: 7px;
    font-family: Arial, Helvetica, sans-serif;
    color: #1a202c;
    table-layout: auto;
  `;

  // Alle Header-Zellen
  const ths = tableEl.querySelectorAll('th');
  ths.forEach(th => {
    th.style.cssText = `
      background-color: #111b14 !important;
      color: #e8f5ee !important;
      font-size: 6.5px !important;
      font-weight: 600;
      text-align: center;
      padding: 4px 5px;
      border: 1px solid #333;
      white-space: nowrap;
    `;
    // Kaufpreis-Netto Spalte
    if (th.classList.contains('col-kaufpreis-netto')) {
      th.style.backgroundColor = '#1a5c38 !important';
      th.style.color            = '#a8e6c0 !important';
    }
  });

  // Alle Datenzellen
  const tds = tableEl.querySelectorAll('td');
  tds.forEach(td => {
    td.style.cssText = `
      padding: 3px 5px;
      font-size: 7px;
      text-align: right;
      border: 1px solid #ccc;
      white-space: nowrap;
      color: #1a202c;
    `;

    // Kaufpreis-Netto Zellen: grün markieren
    if (td.classList.contains('col-kaufpreis-netto')) {
      td.style.backgroundColor = '#d4f7d4';
      td.style.fontWeight      = '600';
    }

    // Trennlinien-Spalten
    if (td.classList.contains('col-sep')) {
      td.style.borderRight = '2px solid #333';
    }

    // Erste Spalte (Laufzeit) zentriert + leichter Hintergrund
    if (td.cellIndex === 0) {
      td.style.textAlign       = 'center';
      td.style.fontWeight      = '600';
      td.style.backgroundColor = '#f0f4f1';
    }
  });

  // Rote Zeilen (Budget-Überschreitung)
  const redRows = tableEl.querySelectorAll('tr.over-income');
  redRows.forEach(tr => {
    tr.querySelectorAll('td').forEach(td => {
      td.style.backgroundColor = '#fde8e8';
      td.style.color           = '#c0392b';
    });
  });

  // Block-Trennlinien
  const sepRows = tableEl.querySelectorAll('tr.block-separator');
  sepRows.forEach(tr => {
    tr.querySelectorAll('td').forEach(td => {
      td.style.borderBottom = '2px solid #1a7a4a';
    });
  });

  Logger.debug('applyPdfTableStyles(): Fertig ✓');
}