/**
 * functions.js
 * Hilfsfunktionen, Slider-Events und Ergebnis-Rendering für den Immo-Rechner.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.0.0
 */

// Logger steht global aus berechnungen.js zur Verfügung

// ========== Eingabe-Hilfsfunktionen ==========

/**
 * Bereinigt ein Nettoeinkommen-Textfeld: Erlaubt nur Ziffern, Punkt, Komma.
 * @param {string} idx - Index des Feldes (1, 2 oder 3)
 */
function filterNetInput(idx) {
  Logger.debug(`filterNetInput(${idx}) aufgerufen`);
  const input = document.getElementById('net-income' + idx);
  if (!input) return;
  input.value = input.value.replace(/[^\d.,]/g, '');
}

/**
 * Formatiert ein Nettoeinkommen-Feld im deutschen Zahlenformat.
 * Beispiel: "1234.56" → "1.234,56"
 * @param {string} idx - Index des Feldes (1, 2 oder 3)
 */
function formatNetIncome(idx) {
  Logger.debug(`formatNetIncome(${idx}) aufgerufen`);
  const input = document.getElementById('net-income' + idx);
  if (!input) return;

  // Normalisierung: Punkte weg, Komma → Punkt
  let raw = input.value.replace(/\./g, '').replace(/,/g, '.');
  let num = parseFloat(raw) || 0;

  const parts       = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Tausenderpunkte einfügen
  input.value = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decimalPart;
  Logger.debug(`formatNetIncome(${idx}) → ${input.value}`);
}

/**
 * Liest einen Nettoeinkommen-Wert als Zahl aus dem Textfeld.
 * @param {string} idx - Index des Feldes (1, 2 oder 3)
 * @returns {number} Zahlenwert oder 0
 */
function getNetIncomeValue(idx) {
  const input = document.getElementById('net-income' + idx);
  if (!input) return 0;
  const raw = input.value.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(raw) || 0;
}

// ========== Slider-Aktualisierung ==========

/**
 * Aktualisiert die Anzeige eines Max-Rate-Sliders:
 * Zeigt den Prozentwert und den absoluten Eurobetrag an.
 *
 * @param {string} sliderId     - ID des Sliders
 * @param {string} valueSpanId  - ID des Prozent-Anzeigeelements
 * @param {string} absSpanId    - ID des Euro-Anzeigeelements
 * @param {string} netIncomeId  - ID des Nettoeinkommen-Feldes
 */
function updateSliderValue(sliderId, valueSpanId, absSpanId, netIncomeId) {
  const slider   = document.getElementById(sliderId);
  const valueSpan = document.getElementById(valueSpanId);
  const absSpan   = document.getElementById(absSpanId);
  if (!slider || !valueSpan || !absSpan) return;

  // Nettoeinkommen aus Textfeld lesen
  const raw = document.getElementById(netIncomeId)?.value.replace(/\./g, '').replace(/,/g, '.') || '0';
  const net = parseFloat(raw) || 0;

  // Prozentwert anzeigen
  valueSpan.textContent = slider.value;

  // Absoluten Eurobetrag berechnen und anzeigen
  const absValue     = parseFloat((net * slider.value / 100).toFixed(2));
  const formattedAbs = absValue.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' €';
  absSpan.textContent = formattedAbs;

  Logger.debug(`updateSliderValue(${sliderId}): ${slider.value}% = ${formattedAbs}`);
}

/**
 * Platzhalter für zukünftige Live-Vorschau-Logik.
 */
function updateValues() {
  // Kann für Live-Vorschau erweitert werden
}

// ========== Tabellen-Rendering ==========

/**
 * Hilfsfunktion: Gibt eine formatierte Tabellenzelle zurück.
 * @param {string|number} val  - Wert
 * @param {string}        unit - Einheit (€, %, ...)
 * @param {string}        cls  - Optionale CSS-Klasse
 * @param {number}        rs   - rowspan (optional)
 * @returns {string} <td>...</td>
 */
function td(val, unit, cls, rs) {
  const classAttr   = cls ? ` class="${cls}"` : '';
  const rowspanAttr = rs  ? ` rowspan="${rs}"` : '';
  return `<td${classAttr}${rowspanAttr}>${val}${unit ? ' ' + unit : ''}</td>`;
}

/**
 * Baut die komplette HTML-Tabelle für alle Szenarien und Laufzeiten.
 *
 * @param {object} data - Eingabedaten aus sessionStorage
 * @returns {string} HTML-String der fertigen Tabelle
 */
function calculateResultsFromData(data) {
  Logger.info('calculateResultsFromData() → starte Tabellenberechnung');

  // --- Nettoeinkommen einlesen ---
  const incomes = [1, 2, 3].map(i => {
    const raw = (data['netIncome' + i] || '0').replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(raw) || 0;
  });

  // --- Fixkosten einlesen ---
  const fixedCostsArr = [1, 2, 3].map(i => {
    const raw = (data['fixedCosts' + i] || '0').replace(/\./g, '').replace(/,/g, '.');
    return parseFloat(raw) || 0;
  });

  // --- Laufzeiten einlesen ---
  const terms = [1, 2, 3, 4, 5].map(i => parseInt(data['term' + i]) || 0);
  Logger.debug('Laufzeiten:', terms);

  // --- Blöcke (Szenarien) einlesen ---
  const blocks = [1, 2, 3].map(i => ({
    label:       `Szenario ${i}`,
    maxRatePct:  parseFloat(data['maxRate' + i]) || 0,
    equityPct:   parseFloat(data['equityShare' + i]) || 0,
    interestPct: parseFloat(data['interestRate' + i]) || 0
  }));
  Logger.debug('Szenarien:', blocks);

  // --- Tabellen-Header ---
  const headers = [
    { label: 'Laufzeit<br>in Jahren',              title: 'Laufzeit in Jahren' },
    { label: 'Zinssatz (%)',                        title: 'Nominaler Jahreszinssatz' },
    { label: 'Monatliche Rate',                     title: 'Monatliche Tilgungsrate', sep: true },
    { label: 'Darlehenssumme',                      title: 'Maximale Darlehenssumme nach Annuitätenformel' },
    { label: 'Gesamtzinsen',                        title: 'Gesamte Zinszahlungen über die Laufzeit' },
    { label: 'Zinsanteil (%)',                      title: 'Anteil der Zinsen an der Gesamtrückzahlung' },
    { label: 'Rückzahlung an Bank',                 title: 'Gesamte Rückzahlung = Darlehen + Zinsen', sep: true },
    { label: 'Kaufpreis netto',                     title: 'Kaufpreis ohne Nebenkosten', green: true },
    { label: 'Eigenanteil (%)',                     title: 'Prozentualer Eigenkapitalanteil' },
    { label: 'Eigenanteil (€)',                     title: 'Absoluter Eigenkapitalbetrag', sep: true },
    { label: 'Grunderwerbssteuer',                  title: '3,5% des Kaufpreises netto' },
    { label: 'Grundbucheintragung',                 title: '1,1% des Kaufpreises netto' },
    { label: 'Hypothekeneintragung',                title: '1,2% des Kaufpreises netto' },
    { label: 'Maklerkosten',                        title: '3,6% des Kaufpreises netto' },
    { label: 'Notar / Rechtsanwalt',                title: '1,5% × 1,20 (inkl. MwSt)' },
    { label: 'Sonstige Kosten',                     title: '1,0% des Kaufpreises netto' },
    { label: 'Ges. Kaufnebenkosten',                title: 'Summe aller Kaufnebenkosten' },
    { label: 'KNK-Anteil (%)',                      title: 'Kaufnebenkosten in % vom Kaufpreis netto', sep: true },
    { label: 'Kaufkosten Brutto',                   title: 'Eigenkapital + Darlehenssumme', sep: true },
    { label: 'Betriebskosten (mtl.)',               title: '2,3% p.a. ÷ 12 Monate' },
    { label: 'Gesamtbelastung (mtl.)',              title: 'Rate + Betriebskosten' },
    { label: 'Belastungsquote (%)',                 title: 'Gesamtbelastung ÷ Nettoeinkommen × 100' },
    { label: 'Monatl. Fixkosten',                   title: 'Eingegebene monatliche Fixkosten' },
    { label: 'Gesamtbelastung<br>inkl. Fixkosten', title: 'Rate + Betriebskosten + Fixkosten' },
    { label: 'Aufgelaufene<br>Nebenkosten',         title: 'Zinsen + Kaufnebenkosten' },
    { label: 'Nebenkosten-Anteil (%)',              title: 'Aufgelaufene Nebenkosten ÷ Kaufpreis netto × 100', sep: true },
    { label: 'Betriebskosten gesamt<br>(Laufzeit)',title: 'Monatliche Betriebskosten × Laufzeit in Monaten' },
    { label: 'Gesamtbelastung<br>(Laufzeit)',       title: 'Monatliche Gesamtbelastung × Laufzeit in Monaten', sep: true },
    { label: 'Totale Gesamtkosten',                 title: 'Alle Kosten + Kaufpreis inkl. Eigenkapital' }
  ];

  let html = '<table>';

  // Thead
  html += '<thead><tr>';
  headers.forEach(h => {
    const cls = [
      h.sep   ? 'col-sep' : '',
      h.green ? 'col-kaufpreis-netto' : ''
    ].filter(Boolean).join(' ');
    html += `<th class="${cls}" title="${h.title}">${h.label}</th>`;
  });
  html += '</tr></thead><tbody>';

  // --- Daten-Zeilen je Block ---
  blocks.forEach((blk, index) => {
    const netIncome  = incomes[index];
    const fixedCosts = fixedCostsArr[index];

    // Überspringe leere Szenarien (kein Einkommen oder kein Zinssatz)
    if (netIncome === 0 || blk.interestPct === 0) {
      Logger.warn(`Szenario ${index + 1} übersprungen: Einkommen=${netIncome}, Zins=${blk.interestPct}`);
      return;
    }

    Logger.info(`Rendere Szenario ${index + 1}: Einkommen=${netIncome} €`);

    // Erste Zeile des Blocks
    const m0 = calculateRowMetrics(netIncome, blk, terms[0], fixedCosts);
    const overClass0 = m0.overIncome ? ' class="over-income"' : '';

    html += `<tr${overClass0}>`;
    html += td(terms[0] + ' Jahre', '', '');
    html += td(formatNumber(blk.interestPct), '%', '', 5);                           // rowspan=5
    html += td(formatNumber(m0.R), '€', 'col-sep', 5);                               // rowspan=5
    html += td(formatNumber(m0.loanAmt), '€', '');
    html += td(formatNumber(m0.interestAmt), '€', '');
    html += td(formatNumber((m0.interestAmt / (m0.loanAmt + m0.interestAmt)) * 100), '%', '');
    html += td(formatNumber(m0.loanAmt + m0.interestAmt), '€', 'col-sep');
    html += td(formatNumber(m0.netPurchase), '€', 'col-kaufpreis-netto');
    html += td(formatNumber(blk.equityPct), '%', '', 5);                              // rowspan=5
    html += td(formatNumber(m0.equityAbs), '€', 'col-sep');
    html += td(formatNumber(m0.grunderwerb), '€', '');
    html += td(formatNumber(m0.grundbuch), '€', '');
    html += td(formatNumber(m0.hypothek), '€', '');
    html += td(formatNumber(m0.makler), '€', '');
    html += td(formatNumber(m0.notar), '€', '');
    html += td(formatNumber(m0.sonstige), '€', '');
    html += td(formatNumber(m0.gesamtNebenkosten), '€', '');
    html += td(formatNumber(m0.nebKostenPct), '%', 'col-sep');
    html += td(formatNumber(m0.loanAmt + m0.equityAbs), '€', 'col-sep');
    html += td(formatNumber(m0.monthlyOps), '€', '');
    html += td(formatNumber(m0.burdenMonthly), '€', '');
    html += td(formatNumber(m0.burdenPct), '%', '');
    html += td(formatNumber(fixedCosts), '€', '', 5);                                 // rowspan=5
    html += td(formatNumber(m0.totalWithFix), '€', '');
    html += td(formatNumber(m0.accumulatedCosts), '€', '');
    html += td(formatNumber(m0.nebKostenAnteilPct), '%', 'col-sep');
    html += td(formatNumber(m0.totalOpsOverTerm), '€', '');
    html += td(formatNumber(m0.totalBurdenOverTerm), '€', 'col-sep');
    html += td(formatNumber(m0.totalCosts), '€', '');
    html += '</tr>';

    // Folge-Laufzeiten (t=1..4)
    for (let t = 1; t < terms.length; t++) {
      if (!terms[t]) continue; // Laufzeit = 0 überspringen

      const isLast = (t === terms.length - 1);
      const mT     = calculateRowMetrics(netIncome, blk, terms[t], fixedCosts);
      const rowCls = [isLast ? 'block-separator' : '', mT.overIncome ? 'over-income' : '']
                       .filter(Boolean).join(' ');
      const trAttr = rowCls ? ` class="${rowCls}"` : '';

      html += `<tr${trAttr}>`;
      html += td(terms[t] + ' Jahre', '', '');
      // Zinssatz & Rate wurden via rowspan bereits gesetzt
      html += td(formatNumber(mT.loanAmt), '€', '');
      html += td(formatNumber(mT.interestAmt), '€', '');
      html += td(formatNumber((mT.interestAmt / (mT.loanAmt + mT.interestAmt)) * 100), '%', '');
      html += td(formatNumber(mT.loanAmt + mT.interestAmt), '€', 'col-sep');
      html += td(formatNumber(mT.netPurchase), '€', 'col-kaufpreis-netto');
      // Eigenanteil % via rowspan gesetzt
      html += td(formatNumber(mT.equityAbs), '€', 'col-sep');
      html += td(formatNumber(mT.grunderwerb), '€', '');
      html += td(formatNumber(mT.grundbuch), '€', '');
      html += td(formatNumber(mT.hypothek), '€', '');
      html += td(formatNumber(mT.makler), '€', '');
      html += td(formatNumber(mT.notar), '€', '');
      html += td(formatNumber(mT.sonstige), '€', '');
      html += td(formatNumber(mT.gesamtNebenkosten), '€', '');
      html += td(formatNumber(mT.nebKostenPct), '%', 'col-sep');
      html += td(formatNumber(mT.loanAmt + mT.equityAbs), '€', 'col-sep');
      html += td(formatNumber(mT.monthlyOps), '€', '');
      html += td(formatNumber(mT.burdenMonthly), '€', '');
      html += td(formatNumber(mT.burdenPct), '%', '');
      // Fixkosten via rowspan gesetzt
      html += td(formatNumber(mT.totalWithFix), '€', '');
      html += td(formatNumber(mT.accumulatedCosts), '€', '');
      html += td(formatNumber(mT.nebKostenAnteilPct), '%', 'col-sep');
      html += td(formatNumber(mT.totalOpsOverTerm), '€', '');
      html += td(formatNumber(mT.totalBurdenOverTerm), '€', 'col-sep');
      html += td(formatNumber(mT.totalCosts), '€', '');
      html += '</tr>';
    }

    Logger.info(`Szenario ${index + 1} fertig gerendert.`);
  });

  html += '</tbody></table>';
  Logger.info('calculateResultsFromData() ✓ Tabelle vollständig erstellt');
  return html;
}

/**
 * Fügt die generierte Ergebnistabelle in den results-container ein.
 * @param {object} inputData - Eingabedaten aus sessionStorage
 */
function renderResults(inputData) {
  Logger.info('renderResults() gestartet');
  const container = document.getElementById('results-container');
  if (!container) {
    Logger.error('renderResults(): #results-container nicht gefunden!');
    return;
  }
  try {
    container.innerHTML = calculateResultsFromData(inputData);
    Logger.info('renderResults() ✓ Tabelle wurde eingefügt');
  } catch (err) {
    Logger.error('renderResults() Fehler:', err);
    container.innerText = 'Fehler beim Berechnen der Ergebnisse. Bitte gehe zurück und überprüfe deine Eingaben.';
  }
}

// ========== Event-Registrierung ==========

document.addEventListener('DOMContentLoaded', function () {
  Logger.info('DOMContentLoaded → functions.js initialisiert');

  // Hilfsfunktion: Slider-Events für einen Block registrieren
  function initBlock(i) {
    const maxRateSlider  = document.getElementById(`max-rate${i}`);
    const equitySlider   = document.getElementById(`equity-share${i}`);
    const netIncomeInput = document.getElementById(`net-income${i}`);
    const equityValue    = document.getElementById(`equity-share${i}-value`);

    if (maxRateSlider && netIncomeInput) {
      Logger.debug(`Block ${i}: Max-Rate-Slider registriert`);

      // Slider-Event
      maxRateSlider.addEventListener('input', function () {
        updateSliderValue(`max-rate${i}`, `max-rate${i}-value`, `max-rate${i}-abs`, `net-income${i}`);
      });

      // Nettoeinkommen-Input: Live-Aktualisierung
      netIncomeInput.addEventListener('input', function () {
        updateSliderValue(`max-rate${i}`, `max-rate${i}-value`, `max-rate${i}-abs`, `net-income${i}`);
      });

      // Initiale Anzeige
      updateSliderValue(`max-rate${i}`, `max-rate${i}-value`, `max-rate${i}-abs`, `net-income${i}`);
    }

    if (equitySlider && equityValue) {
      Logger.debug(`Block ${i}: Eigenkapital-Slider registriert`);
      equitySlider.addEventListener('input', function () {
        equityValue.textContent = this.value;
        updateValues();
      });
    }
  }

  // Alle drei Blöcke initialisieren
  [1, 2, 3].forEach(i => initBlock(i));

  Logger.info('functions.js: Alle Event-Listener registriert ✓');
});
