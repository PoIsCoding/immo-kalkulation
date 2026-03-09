/**
 * pdfExport.js
 * Erstellt eine druckfertige PDF der Ergebnistabelle.
 *
 * Strategie:
 *  - Primär:   html2pdf.js (CDN) → direkt PDF-Download
 *  - Fallback: Browser-Druckfenster falls CDN nicht verfügbar oder Fehler
 *
 * Wichtig für html2canvas:
 *  Der zu rendernde Wrapper MUSS im sichtbaren Viewport liegen.
 *  position:fixed mit top:-9999px führt zu leerem Rendering (leere PDF!).
 *  Lösung: opacity:0 + pointer-events:none + position:absolute top:0
 *  sodass html2canvas den Inhalt sieht, der User aber nicht.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.2.0
 */

document.addEventListener('DOMContentLoaded', function () {
  Logger.info('pdfExport.js: DOMContentLoaded');

  const pdfBtn = document.getElementById('download-pdf');
  if (!pdfBtn) {
    Logger.warn('pdfExport.js: #download-pdf nicht gefunden – abgebrochen');
    return;
  }

  pdfBtn.addEventListener('click', function () {
    Logger.info('pdfExport.js: PDF-Button geklickt');

    // Tabelle im Ergebnis-Container suchen
    const table = document.querySelector('#results-container table');
    if (!table) {
      Logger.warn('pdfExport.js: Keine Tabelle im #results-container gefunden');
      alert('Keine Ergebnistabelle gefunden. Bitte berechne zuerst die Ergebnisse.');
      return;
    }

    // Entscheide Methode: html2pdf verfügbar?
    if (typeof html2pdf !== 'undefined') {
      Logger.info('pdfExport.js: html2pdf verfügbar → starte html2pdf-Export');
      exportViaPdfLib(table, pdfBtn);
    } else {
      Logger.warn('pdfExport.js: html2pdf nicht verfügbar → Fallback Druckfenster');
      exportViaPrintWindow(table);
    }
  });

  Logger.info('pdfExport.js: Event-Listener registriert ✓');
});

// ============================================================
// METHODE 1: html2pdf.js
// ============================================================

/**
 * Exportiert die Tabelle als PDF-Datei via html2pdf.js (CDN).
 *
 * Kernproblem html2canvas:
 *  html2canvas kann nur Elemente rendern, die im sichtbaren Viewport sind.
 *  Elemente mit top:-9999px oder display:none werden als leer gerendert.
 *  Lösung: Wrapper mit opacity:0 im normalen Dokumentfluss platzieren.
 *
 * @param {HTMLElement} table  - Originaltabelle im DOM
 * @param {HTMLElement} pdfBtn - Export-Button (für Ladezustand)
 */
function exportViaPdfLib(table, pdfBtn) {
  Logger.info('exportViaPdfLib(): Starte Vorbereitung');

  // Button-Status: Ladeindikator
  const originalHTML = pdfBtn.innerHTML;
  pdfBtn.innerHTML   = '⏳ Wird erstellt …';
  pdfBtn.disabled    = true;

  // Datum & Uhrzeit für Header und Dateiname
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr  = now.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });
  const filename = `immo-ergebnisse_${dateStr.replace(/\./g, '-')}.pdf`;

  // --- Wrapper aufbauen ---
  // WICHTIG: position:absolute top:0 left:0 → liegt IM Viewport (html2canvas kann rendern)
  // opacity:0 + pointer-events:none → User sieht/berührt ihn nicht
  const wrapper = document.createElement('div');
  wrapper.id    = 'pdf-render-wrapper';
  wrapper.style.cssText = [
    'position: absolute',
    'top: 0',
    'left: 0',
    'width: 2200px',           // Fixe Breite für A3 Querformat
    'z-index: 9999',
    'opacity: 0',              // Unsichtbar für User, aber renderbar für html2canvas
    'pointer-events: none',    // Keine Interaktion möglich
    'background: white',
    'padding: 16px',
    'font-family: Arial, Helvetica, sans-serif',
    'color: #1a202c'
  ].join(';');

  // PDF-Titelzeile mit Datum
  wrapper.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">
      <div style="background:#1a7a4a;color:#fff;font-size:16px;font-weight:700;
                  padding:6px 16px;border-radius:6px;letter-spacing:-0.3px;">
        Immo-Rechner
      </div>
      <div style="color:#5a6a7a;font-size:11px;">
        Erstellt am ${dateStr} um ${timeStr} Uhr
      </div>
    </div>
    <p style="font-size:9px;color:#8899aa;margin-bottom:14px;">
      ± 10 % Varianz · Alle Angaben sind Richtwerte ohne Gewähr ·
      ©Poramet "PoIsCoding" Bahnschulte · v2.2.0
    </p>
  `;

  // Tabelle klonen & Inline-Styles anwenden
  const tableClone = table.cloneNode(true);
  applyPdfTableStyles(tableClone);
  wrapper.appendChild(tableClone);

  // Wrapper ans body hängen – NICHT fixed, NICHT off-screen
  document.body.appendChild(wrapper);
  Logger.debug('exportViaPdfLib(): Wrapper ins DOM eingefügt (position:absolute top:0, opacity:0)');

  // Kurze Pause damit der Browser den Wrapper vollständig layoutet
  // bevor html2canvas zugreift
  setTimeout(function () {
    Logger.info('exportViaPdfLib(): Starte html2pdf mit Dateiname: ' + filename);

    const opt = {
      margin:      [6, 4, 6, 4],        // mm: oben, rechts, unten, links
      filename:    filename,
      image:       { type: 'jpeg', quality: 0.97 },
      html2canvas: {
        scale:        2,                 // 2× Auflösung für scharfen Druck
        useCORS:      true,
        logging:      false,
        scrollX:      0,
        scrollY:      0                  // Kein scroll-offset nötig da absolute top:0
      },
      jsPDF: {
        unit:         'mm',
        format:       'a3',             // A3 für breite Tabelle
        orientation:  'landscape'
      }
    };

    html2pdf()
      .set(opt)
      .from(wrapper)
      .save()
      .then(function () {
        Logger.info('exportViaPdfLib(): ✓ PDF erfolgreich erstellt → ' + filename);
        cleanup();
      })
      .catch(function (err) {
        Logger.error('exportViaPdfLib(): Fehler bei html2pdf:', err);
        cleanup();
        // Automatisch Fallback
        Logger.info('exportViaPdfLib(): Wechsle zu Fallback-Druckfenster');
        exportViaPrintWindow(table);
      });

    /** Aufräumen: Wrapper entfernen, Button zurücksetzen */
    function cleanup() {
      const el = document.getElementById('pdf-render-wrapper');
      if (el) {
        document.body.removeChild(el);
        Logger.debug('exportViaPdfLib(): Wrapper entfernt ✓');
      }
      pdfBtn.innerHTML = originalHTML;
      pdfBtn.disabled  = false;
    }

  }, 200); // 200ms Wartezeit für vollständiges Browser-Layout
}

// ============================================================
// METHODE 2: Browser-Druckfenster (Fallback – funktioniert immer)
// ============================================================

/**
 * Öffnet ein neues Fenster mit der formatierten Tabelle und ruft
 * automatisch window.print() auf. Der Nutzer wählt "Als PDF speichern".
 *
 * @param {HTMLElement} table - Originaltabelle
 */
function exportViaPrintWindow(table) {
  Logger.info('exportViaPrintWindow(): Starte Druckfenster-Methode');

  const now     = new Date();
  const dateStr = now.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' });

  // Tabelle klonen und stylen
  const tableClone = table.cloneNode(true);
  applyPdfTableStyles(tableClone);

  const printHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <title>Immo-Ergebnisse ${dateStr}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A3 landscape;
      margin: 8mm 5mm;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7px;
      color: #1a202c;
      background: white;
      padding: 10px;
    }

    /* Hinweis nur am Bildschirm (vor dem Druck) */
    .screen-hint {
      background: #1a7a4a;
      color: white;
      padding: 10px 18px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 14px;
      text-align: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print { .screen-hint { display: none !important; } }

    .print-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 8px;
    }
    .logo-box {
      background: #1a7a4a;
      color: white;
      font-size: 14px;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 5px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .meta       { font-size: 10px; color: #5a6a7a; }
    .disclaimer { font-size: 7.5px; color: #8899aa; margin-bottom: 12px; }

    /* Tabelle */
    table {
      border-collapse: collapse;
      width: 100%;
      font-size: 6.5px;
    }
    th {
      background-color: #111b14 !important;
      color: #e8f5ee !important;
      font-size: 6px;
      font-weight: 600;
      text-align: center;
      padding: 3px 4px;
      border: 1px solid #333;
      white-space: nowrap;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    th.col-kaufpreis-netto {
      background-color: #1a5c38 !important;
      color: #a8e6c0 !important;
    }
    td {
      padding: 2px 4px;
      text-align: right;
      border: 1px solid #ccc;
      white-space: nowrap;
    }
    td:first-child {
      text-align: center;
      font-weight: 600;
      background-color: #f0f4f1;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    td.col-kaufpreis-netto {
      background-color: #d4f7d4 !important;
      font-weight: 600;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    td.col-sep  { border-right: 2px solid #333 !important; }
    th.col-sep  { border-right: 2px solid #555 !important; }
    tr.block-separator td {
      border-bottom: 2px solid #1a7a4a !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    tr.over-income td {
      background-color: #fde8e8 !important;
      color: #c0392b !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div class="screen-hint">
    ℹ️ Druckdialog wird geöffnet –
    wähle <strong>„Als PDF speichern"</strong> als Drucker.
    Empfehlung: <strong>Querformat · A3</strong>
  </div>

  <div class="print-header">
    <div class="logo-box">Immo-Rechner</div>
    <div class="meta">Erstellt am ${dateStr} um ${timeStr} Uhr</div>
  </div>
  <p class="disclaimer">
    ± 10 % Varianz · Alle Angaben sind Richtwerte ohne Gewähr ·
    ©Poramet "PoIsCoding" Bahnschulte · v2.2.0
  </p>

  ${tableClone.outerHTML}

  <script>
    // Druckdialog automatisch öffnen sobald Seite geladen
    window.onload = function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 400);
    };
  <\/script>
</body>
</html>`;

  // Druckfenster öffnen
  const printWin = window.open('', '_blank', 'width=1400,height=900,scrollbars=yes');

  if (!printWin) {
    Logger.error('exportViaPrintWindow(): Popup blockiert!');
    alert(
      'Popup wurde vom Browser blockiert.\n\n' +
      'Bitte erlaube Popups für diese Seite (Adressleiste → Popup erlauben)\n' +
      'und klicke dann erneut auf „PDF speichern".\n\n' +
      'Alternativ: Strg+P (Windows) / Cmd+P (Mac) öffnet den Druckdialog direkt.'
    );
    return;
  }

  // HTML ins neue Fenster schreiben
  printWin.document.open();
  printWin.document.write(printHTML);
  printWin.document.close();

  Logger.info('exportViaPrintWindow(): Druckfenster geöffnet ✓');
}

// ============================================================
// Hilfsfunktion: Inline-CSS auf Tabellenklon anwenden
// ============================================================

/**
 * Setzt alle nötigen Styles als Inline-Styles direkt auf den Tabellenklon.
 * Notwendig weil:
 *  - html2canvas externe CSS-Dateien nicht zuverlässig liest
 *  - das Druckfenster keinen Zugriff auf styles.css der Hauptseite hat
 *
 * @param {HTMLElement} tableEl - Geklonte Tabelle (wird direkt mutiert)
 */
function applyPdfTableStyles(tableEl) {
  Logger.debug('applyPdfTableStyles(): Wende Inline-Styles an');

  // Basis-Tabellen-Style
  tableEl.removeAttribute('style');
  tableEl.style.cssText = [
    'border-collapse: collapse',
    'width: 100%',
    'font-size: 7px',
    'font-family: Arial, Helvetica, sans-serif',
    'color: #1a202c',
    'background: white'
  ].join(';');

  // ── Header-Zellen ──
  tableEl.querySelectorAll('th').forEach(function (th) {
    th.style.cssText = [
      'background-color: #111b14',
      'color: #e8f5ee',
      'font-size: 6px',
      'font-weight: 600',
      'text-align: center',
      'padding: 3px 5px',
      'border: 1px solid #444',
      'white-space: nowrap'
    ].join(';');

    if (th.classList.contains('col-kaufpreis-netto')) {
      th.style.backgroundColor = '#1a5c38';
      th.style.color           = '#a8e6c0';
    }
    if (th.classList.contains('col-sep')) {
      th.style.borderRight = '2.5px solid #666';
    }
  });

  // ── Datenzellen ──
  tableEl.querySelectorAll('td').forEach(function (td) {
    td.style.cssText = [
      'padding: 2px 5px',
      'font-size: 7px',
      'text-align: right',
      'border: 1px solid #ccc',
      'white-space: nowrap',
      'color: #1a202c',
      'background-color: white'
    ].join(';');

    if (td.classList.contains('col-kaufpreis-netto')) {
      td.style.backgroundColor = '#d4f7d4';
      td.style.fontWeight      = '600';
    }
    if (td.classList.contains('col-sep')) {
      td.style.borderRight = '2.5px solid #555';
    }
    // Erste Spalte (Laufzeit): zentriert + hellgrau
    if (td.cellIndex === 0) {
      td.style.textAlign       = 'center';
      td.style.fontWeight      = '600';
      td.style.backgroundColor = '#f0f4f1';
    }
  });

  // ── Rote Zeilen (Budget-Überschreitung) ──
  tableEl.querySelectorAll('tr.over-income').forEach(function (tr) {
    tr.querySelectorAll('td').forEach(function (td) {
      td.style.backgroundColor = '#fde8e8';
      td.style.color           = '#c0392b';
    });
  });

  // ── Grüne Block-Trennlinien ──
  tableEl.querySelectorAll('tr.block-separator').forEach(function (tr) {
    tr.querySelectorAll('td').forEach(function (td) {
      td.style.borderBottom = '2px solid #1a7a4a';
    });
  });

  Logger.debug('applyPdfTableStyles(): Fertig ✓');
}