
// Funktionen aus berechnungen.js stehen global zur Verfügung:
// formatNumber(...), calcLoan(...), calculateIncidentalCosts(...)


// ========== Gemeinsame Hilfsfunktionen ==========

/**
 * Filtert ein Nettoeinkommen-Feld nach erlaubten Zeichen (Ziffern, Punkt, Komma).
 * @param {string} idx - Index (z.B. '1', '2', '3') für net-incomeX.
 */
function filterNetInput(idx) {
  const input = document.getElementById('net-income' + idx);
  input.value = input.value.replace(/[^\d.,]/g, '');
}

/**
 * Formatiert das Nettoeinkommen-Feld (Dezimalpunkt -> Komma, Tausenderpunkte).
 * @param {string} idx - Index (z.B. '1', '2', '3') für net-incomeX.
 */
function formatNetIncome(idx) {
  const input = document.getElementById('net-income' + idx);
  let raw = input.value.replace(/\./g, '').replace(/,/g, '.');
  let num = parseFloat(raw) || 0;
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  input.value = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + decimalPart;
}

/**
 * Aktualisiert Slider-Werte und absolute Beträge in Euro.
 * @param {string} sliderId - ID des Sliders (z.B. 'max-rate1').
 * @param {string} valueSpanId - ID des Elements, das den Prozentwert anzeigen soll.
 * @param {string} absSpanId - ID des Element, das den absoluten Eurowert anzeigen soll.
 * @param {string} netIncomeId - ID des Nettoeinkommen-Feldes (z.B. 'net-income1').
 */
function updateSliderValue(sliderId, valueSpanId, absSpanId, netIncomeId) {
  const slider = document.getElementById(sliderId);
  const raw = document.getElementById(netIncomeId).value.replace(/\./g, '').replace(/,/g, '.');
  const net = parseFloat(raw) || 0;
  document.getElementById(valueSpanId).textContent = slider.value;
  const absValue = parseFloat((net * slider.value / 100).toFixed(2));
  const formattedAbs = absValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  document.getElementById(absSpanId).textContent = formattedAbs;
  updateValues();
}

/**
 * Platzhalter-Funktion für Live-Aktualisierungen (kann bei Bedarf erweitert werden).
 */
function updateValues() {
  // Hier kann zusätzliche Logik für Live-Vorschau o.Ä. eingefügt werden.
}

/**
 * Sendet das Formular ab und leitet auf ergebnisse.html weiter.
 */
function submitForm() {
  const params = new URLSearchParams();
  // Drei separate Nettoeinkommen eintragen
  params.set('netIncome1', document.getElementById('net-income1').value);
  params.set('netIncome2', document.getElementById('net-income2').value);
  params.set('netIncome3', document.getElementById('net-income3').value);
  [1, 2, 3].forEach(i => {
    params.set(`maxRate${i}`, document.getElementById(`max-rate${i}`).value);
    params.set(`equity${i}`, document.getElementById(`equity-share${i}`).value);
    params.set(`interest${i}`, document.getElementById(`interest-rate${i}`).value);
  });
  [1, 2, 3, 4, 5].forEach(i => {
    params.set(`term${i}`, document.getElementById(`term${i}`).value);
  });
  // Monatliche Fixkosten pro Block
  params.set('fixedCosts1', document.getElementById('fixed-costs1').value);
  params.set('fixedCosts2', document.getElementById('fixed-costs2').value);
  params.set('fixedCosts3', document.getElementById('fixed-costs3').value);
  window.location.href = 'ergebnisse.html?' + params.toString();
}

// ========== Funktionen für ergebnisse.html ==========


/**
 * Berechnet Ergebnisse basierend auf übergebenen Daten aus sessionStorage.
 * @param {object} data - Objekt mit den Eingabewerten aus sessionStorage.
 * @returns {string} HTML-String der Tabelle
 */
function calculateResultsFromData(data) {
  // Drei separate Nettoeinkommen einlesen
  const rawNet1 = data.netIncome1.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawNet2 = data.netIncome2.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawNet3 = data.netIncome3.replace(/\./g, '').replace(/,/g, '.') || '0';
  const netIncome1 = parseFloat(rawNet1) || 0;
  const netIncome2 = parseFloat(rawNet2) || 0;
  const netIncome3 = parseFloat(rawNet3) || 0;
  const incomes = [netIncome1, netIncome2, netIncome3];
  // Monatliche Fixkosten pro Block
  const rawFix1 = data.fixedCosts1.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawFix2 = data.fixedCosts2.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawFix3 = data.fixedCosts3.replace(/\./g, '').replace(/,/g, '.') || '0';
  const fixedCostsArr = [
    parseFloat(rawFix1) || 0,
    parseFloat(rawFix2) || 0,
    parseFloat(rawFix3) || 0
  ];
  // Laufzeiten
  const terms = [
    parseInt(data.term1) || 0,
    parseInt(data.term2) || 0,
    parseInt(data.term3) || 0,
    parseInt(data.term4) || 0,
    parseInt(data.term5) || 0
  ];
  // Blocks mit maxRate, equity, Zinssatz
  const blocks = [1, 2, 3].map(i => ({
    maxRatePct: parseFloat(data['maxRate' + i]) || 0,
    equityPct: parseFloat(data['equityShare' + i]) || 0,
    interestPct: parseFloat(data['interestRate' + i]) || 0
  }));
  let html = '<table border="1" cellpadding="5" cellspacing="0" style="width: 100%; text-align: right;">';
  // Kopfzeile ...
  html += '<tr>'
       + '<th title="Laufzeit in Jahren." data-info="Laufzeit in Jahren." style="text-align: center; width: 100px;">Laufzeit<br>in Jahren</th>'
       + '<th title="" data-info="" style="width: 80px;">Zinssatz (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 120px;">Monatliche Rate</th>'
       + '<th title="" data-info="" style="width: 150px;">Darlehenssumme</th>'
       + '<th title="" data-info="" style="width: 150px; padding: 0px 20px">Gesamtzinsen</th>'
       + '<th title="" data-info="" style="width: 120px;">Zinsanteil (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">Rückzahlung an Bank</th>'
       + '<th title="" data-info="" class="col-kaufpreis-netto" style="width: 200px; padding: 0px 20px">Kaufpreis netto</th>'
       + '<th title="" data-info="" style="width: 100px;">Eigenanteil (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 120px; padding: 0px 20px">Eigenanteil (€)</th>'
       + '<th title="" data-info="" style="width: 120px;">Grunderwerbssteuer</th>'
       + '<th title="" data-info="" style="width: 120px;">Grundbucheintragung</th>'
       + '<th title="" data-info="" style="width: 150px;">Kredit-/<br>Hypothekeneintragung</th>'
       + '<th title="" data-info="" style="width: 120px;">Maklerkosten</th>'
       + '<th title="" data-info="" style="width: 180px;">Notar-/Rechtsanwalt</th>'
       + '<th title="" data-info="" style="width: 150px;">Sonstige Kosten</th>'
       + '<th title="" data-info="" style="width: 150px;">Ges. Kaufnebenkosten</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">KNK-Anteil (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">Kaufkosten Brutto</th>'
       + '<th title="" data-info="" style="width: 170px;">Betriebskosten<br>(monatl.)</th>'
       + '<th title="" data-info="" style="width: 150px;">Gesamtbelastung<br>(monatl.)</th>'
       + '<th title="Prozentualer Anteil der monatlichen Gesamtbelastung am Nettoeinkommen" data-info="Formel: Gesamtbelastung ÷ Nettoeinkommen × 100 %." style="width: 150px;">Belastung-Anteil (%)</th>'
       + '<th title="Monatliche Fixkosten" data-info="Der Wert, den du oben im Szenario für Fixkosten eingegeben hast." style="width: 150px; padding: 0px 20px">Monatl.<br>Fixkosten</th>'
       + '<th title="Monatliche Gesamtbelastung + Fixkosten" data-info="Formel: Gesamtbelastung + Fixkosten." style="width: 300px;">Gesamtbelastung inkl.<br>Fixkosten (monatl.)</th>'
       + '<th title="" data-info="" style="width: 500px; padding: 0px 20px">Aufgelaufene<br>Nebenkosten</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">Nebenkosten-<br>Anteil (%)</th>'
       + '<th title="" data-info="" style="width: 170px;">Betriebskosten gesamt<br>(Laufzeit)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 190px;">Gesamtbelastung gesamt<br>(Laufzeit)</th>'
       + '<th title="" data-info="" style="width: 170px;">Totale Gesamtkosten<br>gesamte Laufzeit</th>'
       + '</tr>';
  blocks.forEach((blk, index) => {
    const netIncome = incomes[index];
    const metrics = calculateRowMetrics(netIncome, blk, terms[0], fixedCostsArr[index]);
    const {
      R,
      loanAmt,
      interestAmt,
      netPurchase,
      equityAbs,
      grunderwerb,
      grundbuch,
      hypothek,
      makler,
      notar,
      sonstige,
      gesamtNebenkosten,
      nebKostenPct,
      monthlyOps,
      burdenMonthly,
      totalWithFix,
      accumulatedCosts,
      nebKostenAnteilPct,
      totalOpsOverTerm,
      totalBurdenOverTerm,
      totalCosts,
      burdenPct,
      overIncome
    } = metrics;
    const rowStyle0 = overIncome ? ' style="background-color: #fdd;"' : '';
    html += `<tr${rowStyle0}>`;
    html += `<td>${terms[0]} Jahre</td>`;
    html += `<td rowspan="5">${formatNumber(blk.interestPct)} %</td>`;
    html += `<td class="col-sep" rowspan="5">${formatNumber(R)} €</td>`;
    html += `<td>${formatNumber(loanAmt)} €</td>`;
    html += `<td>${formatNumber(interestAmt)} €</td>`;
    html += `<td>${formatNumber((interestAmt / (loanAmt + interestAmt)) * 100)} %</td>`;
    html += `<td class="col-sep">${formatNumber(loanAmt + interestAmt)} €</td>`;
    html += `<td class="col-kaufpreis-netto">${formatNumber(netPurchase)} €</td>`;
    html += `<td rowspan="5">${formatNumber(blk.equityPct)} %</td>`;
    html += `<td class="col-sep" style="white-space: nowrap;">${formatNumber(equityAbs)}&nbsp;€</td>`;
    html += `<td>${formatNumber(grunderwerb)} €</td>`;
    html += `<td>${formatNumber(grundbuch)} €</td>`;
    html += `<td>${formatNumber(hypothek)} €</td>`;
    html += `<td>${formatNumber(makler)} €</td>`;
    html += `<td>${formatNumber(notar)} €</td>`;
    html += `<td>${formatNumber(sonstige)} €</td>`;
    html += `<td>${formatNumber(gesamtNebenkosten)} €</td>`;
    html += `<td class="col-sep">${formatNumber(nebKostenPct)} %</td>`;
    html += `<td class="col-sep">${formatNumber(loanAmt + equityAbs)} €</td>`;
    html += `<td>${formatNumber(monthlyOps)} €</td>`;
    html += `<td>${formatNumber(burdenMonthly)} €</td>`;
    html += `<td>${formatNumber(burdenPct)} %</td>`;
    html += `<td rowspan="5">${formatNumber(fixedCostsArr[index])} €</td>`;
    html += `<td>${formatNumber(totalWithFix)} €</td>`;
    html += `<td>${formatNumber(accumulatedCosts)} €</td>`;
    html += `<td class="col-sep">${formatNumber(nebKostenAnteilPct)} %</td>`;
    html += `<td>${formatNumber(totalOpsOverTerm)} €</td>`;
    html += `<td class="col-sep">${formatNumber(totalBurdenOverTerm)} €</td>`;
    html += `<td>${formatNumber(totalCosts)} €</td>`;
    html += '</tr>';
    for (let t = 1; t < terms.length; t++) {
      const isLast = (t === terms.length - 1);
      const metricsT = calculateRowMetrics(netIncome, blk, terms[t], fixedCostsArr[index]);
      const {
        loanAmt: loanT,
        interestAmt: interestT,
        netPurchase: netPurchaseT,
        equityAbs: equityAbsT,
        grunderwerb: grunderwerbT,
        grundbuch: grundbuchT,
        hypothek: hypothekT,
        makler: maklerT,
        notar: notarT,
        sonstige: sonstigeT,
        gesamtNebenkosten: gesamtNebenkostenT,
        nebKostenPct: nebKostenPctT,
        monthlyOps: monthlyOpsT,
        burdenMonthly: burdenMonthlyT,
        totalWithFix: totalWithFixT,
        accumulatedCosts: accumulatedCostsT,
        nebKostenAnteilPct: nebKostenAnteilT,
        totalOpsOverTerm: totalOpsOverTermT,
        totalBurdenOverTerm: totalBurdenOverTermT,
        totalCosts: totalCostsT,
        burdenPct: burdenPctT,
        overIncome: overIncomeT
      } = metricsT;
      const rowStyleT = overIncomeT ? ' style="background-color: #fdd;"' : '';
      const trTag = isLast
        ? `<tr class="block-separator"${rowStyleT}>`
        : `<tr${rowStyleT}>`;
      html += trTag;
      html += `<td>${terms[t]} Jahre</td>`;
      // Für Folgelaufzeiten keine Zinssatz- und Rate-Zellen, da rowspan im ersten Block-Zeile
      html += `<td>${formatNumber(loanT)} €</td>`;
      html += `<td>${formatNumber(interestT)} €</td>`;
      html += `<td>${formatNumber((interestT / (loanT + interestT)) * 100)} %</td>`;
      html += `<td class="col-sep">${formatNumber(loanT + interestT)} €</td>`;
      html += `<td class="col-kaufpreis-netto">${formatNumber(netPurchaseT)} €</td>`;
      html += `<td class="col-sep" style="white-space: nowrap;">${formatNumber(equityAbsT)}&nbsp;€</td>`;
      html += `<td>${formatNumber(grunderwerbT)} €</td>`;
      html += `<td>${formatNumber(grundbuchT)} €</td>`;
      html += `<td>${formatNumber(hypothekT)} €</td>`;
      html += `<td>${formatNumber(maklerT)} €</td>`;
      html += `<td>${formatNumber(notarT)} €</td>`;
      html += `<td>${formatNumber(sonstigeT)} €</td>`;
      html += `<td>${formatNumber(gesamtNebenkostenT)} €</td>`;
      html += `<td class="col-sep">${formatNumber(nebKostenPctT)} %</td>`;
      html += `<td class="col-sep">${formatNumber(loanT + equityAbsT)} €</td>`;
      html += `<td>${formatNumber(monthlyOpsT)} €</td>`;
      html += `<td>${formatNumber(burdenMonthlyT)} €</td>`;
      html += `<td>${formatNumber(burdenPctT)} %</td>`;
      html += `<td>${formatNumber(totalWithFixT)} €</td>`;
      html += `<td>${formatNumber(accumulatedCostsT)} €</td>`;
      html += `<td class="col-sep">${formatNumber(nebKostenAnteilT)} %</td>`;
      html += `<td>${formatNumber(totalOpsOverTermT)} €</td>`;
      html += `<td class="col-sep">${formatNumber(totalBurdenOverTermT)} €</td>`;
      html += `<td>${formatNumber(totalCostsT)} €</td>`;
      html += '</tr>';
    }
  });
  html += '</table>';
  return html;
}

/**
 * Liest URL-Parameter aus und führt die Berechnung durch.
 * Liefert ein HTML-String mit der Ergebnis-Tabelle.
 * @returns {string} HTML-String der Tabelle
 */
function calculateResultsFromParams() {
  const params = new URLSearchParams(window.location.search);
  // Drei separate Nettoeinkommen einlesen
  const rawNet1 = params.get('netIncome1')?.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawNet2 = params.get('netIncome2')?.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawNet3 = params.get('netIncome3')?.replace(/\./g, '').replace(/,/g, '.') || '0';
  const netIncome1 = parseFloat(rawNet1) || 0;
  const netIncome2 = parseFloat(rawNet2) || 0;
  const netIncome3 = parseFloat(rawNet3) || 0;
  const incomes = [netIncome1, netIncome2, netIncome3];
  // Monatliche Fixkosten pro Block aus URL-Parametern
  const rawFix1 = params.get('fixedCosts1')?.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawFix2 = params.get('fixedCosts2')?.replace(/\./g, '').replace(/,/g, '.') || '0';
  const rawFix3 = params.get('fixedCosts3')?.replace(/\./g, '').replace(/,/g, '.') || '0';
  const fixedCostsArr = [
    parseFloat(rawFix1) || 0,
    parseFloat(rawFix2) || 0,
    parseFloat(rawFix3) || 0
  ];
  // Laufzeiten
  const terms = [
    parseInt(params.get('term1')) || 0,
    parseInt(params.get('term2')) || 0,
    parseInt(params.get('term3')) || 0,
    parseInt(params.get('term4')) || 0,
    parseInt(params.get('term5')) || 0
  ];
  // Blocks mit maxRate, equity, Zinssatz
  const blocks = [1, 2, 3].map(i => ({
    maxRatePct: parseFloat(params.get('maxRate' + i)) || 0,
    equityPct: parseFloat(params.get('equity' + i)) || 0,
    interestPct: parseFloat(params.get('interest' + i)) || 0
  }));
  let html = '<table border="1" cellpadding="5" cellspacing="0" style="width: 100%; text-align: right;">';
  // Kopfzeile ...
  html += '<tr>'
       + '<th title="Laufzeit in Jahren." data-info="Laufzeit in Jahren." style="text-align: center; width: 100px;">Laufzeit<br>in Jahren</th>'
       + '<th title="" data-info="" style="width: 80px;">Zinssatz (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 120px;">Monatliche Rate</th>'
       + '<th title="" data-info="" style="width: 150px;">Darlehenssumme</th>'
       + '<th title="" data-info="" style="width: 150px; padding: 0px 20px">Gesamtzinsen</th>'
       + '<th title="" data-info="" style="width: 120px;">Zinsanteil (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">Rückzahlung an Bank</th>'
       + '<th title="" data-info="" class="col-kaufpreis-netto" style="width: 200px; padding: 0px 20px">Kaufpreis netto</th>'
       + '<th title="" data-info="" style="width: 100px;">Eigenanteil (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 120px; padding: 0px 20px">Eigenanteil (€)</th>'
       + '<th title="" data-info="" style="width: 120px;">Grunderwerbssteuer</th>'
       + '<th title="" data-info="" style="width: 120px;">Grundbucheintragung</th>'
       + '<th title="" data-info="" style="width: 150px;">Kredit-/<br>Hypothekeneintragung</th>'
       + '<th title="" data-info="" style="width: 120px;">Maklerkosten</th>'
       + '<th title="" data-info="" style="width: 180px;">Notar-/Rechtsanwalt</th>'
       + '<th title="" data-info="" style="width: 150px;">Sonstige Kosten</th>'
       + '<th title="" data-info="" style="width: 150px;">Ges. Kaufnebenkosten</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">KNK-Anteil (%)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">Kaufkosten Brutto</th>'
       + '<th title="" data-info="" style="width: 170px;">Betriebskosten<br>(monatl.)</th>'
       + '<th title="" data-info="" style="width: 150px;">Gesamtbelastung<br>(monatl.)</th>'
       + '<th title="Prozentualer Anteil der monatlichen Gesamtbelastung am Nettoeinkommen" data-info="Formel: Gesamtbelastung ÷ Nettoeinkommen × 100 %." style="width: 150px;">Belastung-Anteil (%)</th>'
       + '<th title="Monatliche Fixkosten" data-info="Der Wert, den du oben im Szenario für Fixkosten eingegeben hast." style="width: 150px; padding: 0px 20px">Monatl.<br>Fixkosten</th>'
       + '<th title="Monatliche Gesamtbelastung + Fixkosten" data-info="Formel: Gesamtbelastung + Fixkosten." style="width: 300px;">Gesamtbelastung inkl.<br>Fixkosten (monatl.)</th>'
       + '<th title="" data-info="" style="width: 500px; padding: 0px 20px">Aufgelaufene<br>Nebenkosten</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 150px;">Nebenkosten-<br>Anteil (%)</th>'
       + '<th title="" data-info="" style="width: 170px;">Betriebskosten gesamt<br>(Laufzeit)</th>'
       + '<th title="" data-info="" class="col-sep" style="width: 190px;">Gesamtbelastung gesamt<br>(Laufzeit)</th>'
       + '<th title="" data-info="" style="width: 170px;">Totale Gesamtkosten<br>gesamte Laufzeit</th>'
       + '</tr>';
  // Durchlaufe Blöcke ...
  blocks.forEach((blk, index) => {
    const netIncome = incomes[index];
    // Rufe zentrale Berechnungsfunktion auf
    const metrics = calculateRowMetrics(netIncome, blk, terms[0], fixedCostsArr[index]);

    // Extrahiere alle Werte
    const {
      R,
      loanAmt,
      interestAmt,
      netPurchase,
      equityAbs,
      grunderwerb,
      grundbuch,
      hypothek,
      makler,
      notar,
      sonstige,
      gesamtNebenkosten,
      nebKostenPct,
      monthlyOps,
      burdenMonthly,
      totalWithFix,
      accumulatedCosts,
      nebKostenAnteilPct,
      totalOpsOverTerm,
      totalBurdenOverTerm,
      totalCosts,
      burdenPct,
      overIncome
    } = metrics;
    // Determine row background if total monthly burden exceeds net income
    const rowStyle0 = overIncome ? ' style="background-color: #fdd;"' : '';
    html += `<tr${rowStyle0}>`;
    html += `<td>${terms[0]} Jahre</td>`;
    html += `<td rowspan="5">${formatNumber(blk.interestPct)} %</td>`;
    html += `<td class="col-sep" rowspan="5">${formatNumber(R)} €</td>`;
    html += `<td>${formatNumber(loanAmt)} €</td>`;
    html += `<td>${formatNumber(interestAmt)} €</td>`;
    html += `<td>${formatNumber((interestAmt / (loanAmt + interestAmt)) * 100)} %</td>`;
    html += `<td class="col-sep">${formatNumber(loanAmt + interestAmt)} €</td>`;
    html += `<td class="col-kaufpreis-netto">${formatNumber(netPurchase)} €</td>`;
    html += `<td rowspan="5">${formatNumber(blk.equityPct)} %</td>`;
    html += `<td class="col-sep" style="white-space: nowrap;">${formatNumber(equityAbs)}&nbsp;€</td>`;
    html += `<td>${formatNumber(grunderwerb)} €</td>`;
    html += `<td>${formatNumber(grundbuch)} €</td>`;
    html += `<td>${formatNumber(hypothek)} €</td>`;
    html += `<td>${formatNumber(makler)} €</td>`;
    html += `<td>${formatNumber(notar)} €</td>`;
    html += `<td>${formatNumber(sonstige)} €</td>`;
    html += `<td>${formatNumber(gesamtNebenkosten)} €</td>`;
    html += `<td class="col-sep">${formatNumber(nebKostenPct)} %</td>`;
    html += `<td class="col-sep">${formatNumber(loanAmt + equityAbs)} €</td>`;
    html += `<td>${formatNumber(monthlyOps)} €</td>`;
    html += `<td>${formatNumber(burdenMonthly)} €</td>`;
    html += `<td>${formatNumber(burdenPct)} %</td>`;
    html += `<td rowspan="5">${formatNumber(fixedCostsArr[index])} €</td>`;
    html += `<td>${formatNumber(totalWithFix)} €</td>`;
    html += `<td>${formatNumber(accumulatedCosts)} €</td>`;
    html += `<td class="col-sep">${formatNumber(nebKostenAnteilPct)} %</td>`;
    html += `<td>${formatNumber(totalOpsOverTerm)} €</td>`;
    html += `<td class="col-sep">${formatNumber(totalBurdenOverTerm)} €</td>`;
    html += `<td>${formatNumber(totalCosts)} €</td>`;
    html += '</tr>';
    for (let t = 1; t < terms.length; t++) {
      const isLast = (t === terms.length - 1);
      const metricsT = calculateRowMetrics(netIncome, blk, terms[t], fixedCostsArr[index]);
      const {
        loanAmt: loanT,
        interestAmt: interestT,
        netPurchase: netPurchaseT,
        equityAbs: equityAbsT,
        grunderwerb: grunderwerbT,
        grundbuch: grundbuchT,
        hypothek: hypothekT,
        makler: maklerT,
        notar: notarT,
        sonstige: sonstigeT,
        gesamtNebenkosten: gesamtNebenkostenT,
        nebKostenPct: nebKostenPctT,
        monthlyOps: monthlyOpsT,
        burdenMonthly: burdenMonthlyT,
        totalWithFix: totalWithFixT,
        accumulatedCosts: accumulatedCostsT,
        nebKostenAnteilPct: nebKostenAnteilT,
        totalOpsOverTerm: totalOpsOverTermT,
        totalBurdenOverTerm: totalBurdenOverTermT,
        totalCosts: totalCostsT,
        burdenPct: burdenPctT,
        overIncome: overIncomeT
      } = metricsT;
      const rowStyleT = overIncomeT ? ' style="background-color: #fdd;"' : '';
      const trTag = isLast
        ? `<tr class="block-separator"${rowStyleT}>`
        : `<tr${rowStyleT}>`;
      html += trTag;
      html += `<td>${terms[t]} Jahre</td>`;
      // Für Folgelaufzeiten keine Zinssatz- und Rate-Zellen, da rowspan im ersten Block-Zeile
      html += `<td>${formatNumber(loanT)} €</td>`;
      html += `<td>${formatNumber(interestT)} €</td>`;
      html += `<td>${formatNumber((interestT / (loanT + interestT)) * 100)} %</td>`;
      html += `<td class="col-sep">${formatNumber(loanT + interestT)} €</td>`;
      html += `<td class="col-kaufpreis-netto">${formatNumber(netPurchaseT)} €</td>`;
      html += `<td class="col-sep" style="white-space: nowrap;">${formatNumber(equityAbsT)}&nbsp;€</td>`;
      html += `<td>${formatNumber(grunderwerbT)} €</td>`;
      html += `<td>${formatNumber(grundbuchT)} €</td>`;
      html += `<td>${formatNumber(hypothekT)} €</td>`;
      html += `<td>${formatNumber(maklerT)} €</td>`;
      html += `<td>${formatNumber(notarT)} €</td>`;
      html += `<td>${formatNumber(sonstigeT)} €</td>`;
      html += `<td>${formatNumber(gesamtNebenkostenT)} €</td>`;
      html += `<td class="col-sep">${formatNumber(nebKostenPctT)} %</td>`;
      html += `<td class="col-sep">${formatNumber(loanT + equityAbsT)} €</td>`;
      html += `<td>${formatNumber(monthlyOpsT)} €</td>`;
      html += `<td>${formatNumber(burdenMonthlyT)} €</td>`;
      html += `<td>${formatNumber(burdenPctT)} %</td>`;
      html += `<td>${formatNumber(totalWithFixT)} €</td>`;
      html += `<td>${formatNumber(accumulatedCostsT)} €</td>`;
      html += `<td class="col-sep">${formatNumber(nebKostenAnteilT)} %</td>`;
      html += `<td>${formatNumber(totalOpsOverTermT)} €</td>`;
      html += `<td class="col-sep">${formatNumber(totalBurdenOverTermT)} €</td>`;
      html += `<td>${formatNumber(totalCostsT)} €</td>`;
      html += '</tr>';
    }
  });
  html += '</table>';
  return html;
}

/**
 * Fügt die generierte Tabelle in den Container ein.
 * @param {object} inputData - Die Eingabedaten für die Ergebnisberechnung.
 */
function renderResults(inputData) {
  document.getElementById('results-container').innerHTML = calculateResultsFromData(inputData);
}

// Führe renderResults beim Laden der Seite aus:
document.addEventListener('DOMContentLoaded', function() {
  // Nur ausführen, falls das Element existiert (auf ergebnisse.html)
  if (document.getElementById('results-container')) {
    // renderResults wird in ergebnisse.html mit inputData aufgerufen
  }

  // Registrierung von Slider-Events und Nettoeinkommen-Input-Events, unabhängig von calculate-btn

  // Max-Rate-Slider 1
  if (document.getElementById('max-rate1') && document.getElementById('net-income1')) {
    document.getElementById('max-rate1').addEventListener('input', function() {
      updateSliderValue('max-rate1', 'max-rate1-value', 'max-rate1-abs', 'net-income1');
    });
    // Initiale Anzeige
    updateSliderValue('max-rate1', 'max-rate1-value', 'max-rate1-abs', 'net-income1');
  }
  // Max-Rate-Slider 2
  if (document.getElementById('max-rate2') && document.getElementById('net-income2')) {
    document.getElementById('max-rate2').addEventListener('input', function() {
      updateSliderValue('max-rate2', 'max-rate2-value', 'max-rate2-abs', 'net-income2');
    });
    updateSliderValue('max-rate2', 'max-rate2-value', 'max-rate2-abs', 'net-income2');
  }
  // Max-Rate-Slider 3
  if (document.getElementById('max-rate3') && document.getElementById('net-income3')) {
    document.getElementById('max-rate3').addEventListener('input', function() {
      updateSliderValue('max-rate3', 'max-rate3-value', 'max-rate3-abs', 'net-income3');
    });
    updateSliderValue('max-rate3', 'max-rate3-value', 'max-rate3-abs', 'net-income3');
  }

  // Equity-Slider 1
  if (document.getElementById('equity-share1')) {
    document.getElementById('equity-share1').addEventListener('input', function() {
      document.getElementById('equity-share1-value').textContent = this.value;
      updateValues();
    });
  }
  // Equity-Slider 2
  if (document.getElementById('equity-share2')) {
    document.getElementById('equity-share2').addEventListener('input', function() {
      document.getElementById('equity-share2-value').textContent = this.value;
      updateValues();
    });
  }
  // Equity-Slider 3
  if (document.getElementById('equity-share3')) {
    document.getElementById('equity-share3').addEventListener('input', function() {
      document.getElementById('equity-share3-value').textContent = this.value;
      updateValues();
    });
  }

  // Nettoeinkommen-Felder: Live-Aktualisierung der Euro-Beträge beim Eintippen
  if (document.getElementById('net-income1')) {
    document.getElementById('net-income1').addEventListener('input', function() {
      if (document.getElementById('max-rate1')) {
        updateSliderValue('max-rate1', 'max-rate1-value', 'max-rate1-abs', 'net-income1');
      }
    });
  }
  if (document.getElementById('net-income2')) {
    document.getElementById('net-income2').addEventListener('input', function() {
      if (document.getElementById('max-rate2')) {
        updateSliderValue('max-rate2', 'max-rate2-value', 'max-rate2-abs', 'net-income2');
      }
    });
  }
  if (document.getElementById('net-income3')) {
    document.getElementById('net-income3').addEventListener('input', function() {
      if (document.getElementById('max-rate3')) {
        updateSliderValue('max-rate3', 'max-rate3-value', 'max-rate3-abs', 'net-income3');
      }
    });
  }
});