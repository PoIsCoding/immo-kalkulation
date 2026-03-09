/**
 * reverseBerechnung.js
 * Kernberechnungen und Tabellen-Rendering für den Rückwärts-Rechner.
 *
 * Berechnungsweg (Rückwärts):
 *  1. Kaufpreis netto (Eingabe) + Kaufnebenkosten → Kaufpreis brutto
 *  2. Darlehenssumme = Kaufpreis brutto × (1 - Eigenanteil%)
 *  3. Monatliche Rate via Annuitätenformel (Darlehen, Zins, Laufzeit)
 *  4. Benötigtes Nettoeinkommen = Rate / (RateAnteil% / 100)
 *
 * Logger steht global aus berechnungen.js zur Verfügung.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.2.0
 */

// ============================================================
// Kernberechnung: Ein Szenario → alle Kennzahlen
// ============================================================

/**
 * Berechnet alle Kennzahlen für ein Rückwärts-Szenario.
 *
 * @param {number} netPurchasePrice - Kaufpreis NETTO (ohne Nebenkosten) in €
 * @param {number} equityPct        - Eigenanteil in % (0–80)
 * @param {number} interestPct      - Jahreszinssatz in % (z.B. 3.5)
 * @param {number} termYears        - Laufzeit in Jahren
 * @param {number} ratePct          - Rate als % des Nettoeinkommens (z.B. 40)
 * @returns {object}                - Alle berechneten Kennzahlen
 */
function calcReverseMetrics(netPurchasePrice, equityPct, interestPct, termYears, ratePct) {
  Logger.info(
    `calcReverseMetrics(): Kaufpreis=${netPurchasePrice} €, EK=${equityPct}%,` +
    ` Zins=${interestPct}%, Laufzeit=${termYears}J, RateAnteil=${ratePct}%`
  );

  // ── 1) Kaufnebenkosten ──
  const grunderwerb      = netPurchasePrice * 0.035;
  const grundbuch        = netPurchasePrice * 0.011;
  const hypothek         = netPurchasePrice * 0.012;
  const makler           = netPurchasePrice * 0.036;
  const notar            = netPurchasePrice * 0.015 * 1.20;
  const sonstige         = netPurchasePrice * 0.01;
  const gesamtNebenkosten = grunderwerb + grundbuch + hypothek + makler + notar + sonstige;
  const nebKostenPct     = netPurchasePrice > 0
    ? (gesamtNebenkosten / netPurchasePrice) * 100
    : 0;

  // ── 2) Kaufpreis brutto = netto + Nebenkosten ──
  const purchasePriceBrutto = netPurchasePrice + gesamtNebenkosten;

  // ── 3) Eigenkapital absolut & Darlehenssumme ──
  const equityAbs  = purchasePriceBrutto * (equityPct / 100);
  const loanAmt    = purchasePriceBrutto - equityAbs;

  // ── 4) Monatliche Rate via Annuitätenformel ──
  //    R = D × i / (1 - (1+i)^(-n))
  //    mit i = Monatszinssatz, n = Anzahl Monate
  const i = interestPct / 100 / 12;
  const n = termYears * 12;
  let monthlyRate;

  if (i === 0 || n === 0 || loanAmt === 0) {
    Logger.warn('calcReverseMetrics(): Zinssatz, Laufzeit oder Darlehenssumme = 0');
    monthlyRate = 0;
  } else {
    monthlyRate = loanAmt * i / (1 - Math.pow(1 + i, -n));
  }

  Logger.debug(`calcReverseMetrics(): Darlehenssumme=${loanAmt.toFixed(2)} €, monatliche Rate=${monthlyRate.toFixed(2)} €`);

  // ── 5) Gesamtzahlung & Zinsen ──
  const totalPaid   = monthlyRate * n;
  const interestAmt = totalPaid - loanAmt;
  const zinsanteilPct = totalPaid > 0 ? (interestAmt / totalPaid) * 100 : 0;

  // ── 6) Benötigtes Nettoeinkommen ──
  //    Nettoeinkommen = monatliche Rate / (RateAnteil / 100)
  const requiredNetIncome = ratePct > 0 ? (monthlyRate / (ratePct / 100)) : 0;

  // ── 7) Monatliche Betriebskosten (2,3% p.a. / 12) ──
  const monthlyOps = purchasePriceBrutto * 0.023 / 12;

  // ── 8) Monatliche Gesamtbelastung (Rate + Betriebskosten) ──
  const burdenMonthly = monthlyRate + monthlyOps;

  // ── 9) Belastungsquote am benötigten Einkommen ──
  const burdenPct = requiredNetIncome > 0
    ? (burdenMonthly / requiredNetIncome) * 100
    : 0;

  // ── 10) Aufgelaufene Nebenkosten (Zinsen + Kaufnebenkosten) ──
  const accumulatedCosts   = interestAmt + gesamtNebenkosten;
  const nebKostenAnteilPct = netPurchasePrice > 0
    ? (accumulatedCosts / netPurchasePrice) * 100
    : 0;

  // ── 11) Kosten über die gesamte Laufzeit ──
  const totalOpsOverTerm    = monthlyOps * n;
  const totalBurdenOverTerm = burdenMonthly * n;

  // ── 12) Totale Gesamtkosten ──
  const totalCosts = totalBurdenOverTerm + purchasePriceBrutto;

  Logger.info(
    `calcReverseMetrics() ✓ → Rate=${formatNumber(monthlyRate)} €/Monat,` +
    ` benötigtes Nettoeinkommen=${formatNumber(requiredNetIncome)} €`
  );

  return {
    // Kaufpreis
    netPurchasePrice,
    purchasePriceBrutto,
    // Nebenkosten
    grunderwerb,
    grundbuch,
    hypothek,
    makler,
    notar,
    sonstige,
    gesamtNebenkosten,
    nebKostenPct,
    // Eigenkapital & Darlehen
    equityAbs,
    loanAmt,
    // Rate & Zinsen
    monthlyRate,
    interestAmt,
    zinsanteilPct,
    totalPaid,
    // Einkommen
    requiredNetIncome,
    ratePct,
    // Betrieb & Belastung
    monthlyOps,
    burdenMonthly,
    burdenPct,
    // Laufzeit-Gesamtkosten
    accumulatedCosts,
    nebKostenAnteilPct,
    totalOpsOverTerm,
    totalBurdenOverTerm,
    totalCosts
  };
}

// ============================================================
// Tabellen-Rendering
// ============================================================

/**
 * Liest Daten aus sessionStorage, berechnet alle Szenarien × Laufzeiten und
 * rendert die Ergebnistabelle in #rev-results-container.
 *
 * Tabellenstruktur: Eine Zeile pro Szenario+Laufzeit-Kombination.
 * Szenarien werden durch block-separator optisch getrennt.
 *
 * @param {object} data - Rohdaten aus sessionStorage
 */
function renderReverseResults(data) {
  Logger.info('renderReverseResults(): Starte Rendering');

  const container = document.getElementById('rev-results-container');
  if (!container) {
    Logger.error('renderReverseResults(): #rev-results-container nicht gefunden!');
    return;
  }

  // ── Szenarien parsen ──
  const scenarios = [1, 2, 3].map(function (i) {
    const rawPrice = (data['purchasePrice' + i] || '0')
      .replace(/\./g, '').replace(/,/g, '.');
    return {
      index:           i,
      netPurchasePrice: parseFloat(rawPrice) || 0,
      equityPct:        parseFloat(data['equityPct'   + i]) || 0,
      interestPct:      parseFloat(data['revInterest' + i]) || 0,
      ratePct:          parseFloat(data['ratePct'     + i]) || 40
    };
  });

  // ── Laufzeiten parsen (5 globale Felder, gültige herausfiltern) ──
  const terms = [1, 2, 3, 4, 5]
    .map(function (j) { return parseInt(data['revTerm' + j]) || 0; })
    .filter(function (t) { return t >= 1; });

  Logger.debug('renderReverseResults(): Szenarien:', scenarios);
  Logger.debug('renderReverseResults(): Laufzeiten (Jahre):', terms);

  // ── Leere Szenarien herausfiltern ──
  // Ein Szenario ist gültig, wenn Kaufpreis > 0 und Zinssatz > 0
  const validScenarios = scenarios.filter(function (s) {
    const valid = s.netPurchasePrice > 0 && s.interestPct > 0;
    if (!valid) Logger.warn(`Szenario ${s.index} übersprungen (Kaufpreis oder Zinssatz fehlt)`);
    return valid;
  });

  if (validScenarios.length === 0 || terms.length === 0) {
    Logger.warn('renderReverseResults(): Keine gültigen Szenarien oder Laufzeiten');
    container.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Keine auswertbaren Daten gefunden.</p>
        <p>Bitte gehe zurück und fülle mindestens ein Szenario (Kaufpreis + Zinssatz) sowie eine Laufzeit aus.</p>
        <button type="button" onclick="window.history.back()" class="btn-primary" style="margin-top:16px;">← Zurück</button>
      </div>`;
    return;
  }

  // ── Tabellen-Header ──
  // "Laufzeit" kommt jetzt als eigene Spalte nach "Szenario"
  const headers = [
    { label: 'Szenario',                         title: 'Bezeichnung des Szenarios' },
    { label: 'Laufzeit',                          title: 'Gewählte Tilgungsdauer in Jahren' },
    { label: 'Kaufpreis netto',                   title: 'Eingegebener Kaufpreis ohne Nebenkosten', green: true },
    { label: 'Eigenanteil (%)',                   title: 'Prozentualer Eigenanteil am Kaufpreis brutto' },
    { label: 'Eigenanteil (€)',                   title: 'Absoluter Eigenkapitalbetrag in Euro' },
    { label: 'Grunderwerbssteuer',                title: '3,5% des Kaufpreises netto' },
    { label: 'Grundbucheintragung',               title: '1,1% des Kaufpreises netto' },
    { label: 'Hypothekeneintragung',              title: '1,2% des Kaufpreises netto' },
    { label: 'Maklerkosten',                      title: '3,6% des Kaufpreises netto' },
    { label: 'Notar / Rechtsanwalt',              title: '1,5% × 1,20 inkl. MwSt' },
    { label: 'Sonstige Kosten',                   title: '1,0% des Kaufpreises netto' },
    { label: 'Ges. Kaufnebenkosten',              title: 'Summe aller Kaufnebenkosten' },
    { label: 'KNK-Anteil (%)',                    title: 'Nebenkosten in % des Kaufpreises netto', sep: true },
    { label: 'Kaufpreis brutto',                  title: 'Kaufpreis netto + alle Kaufnebenkosten' },
    { label: 'Darlehenssumme',                    title: 'Kaufpreis brutto abzüglich Eigenkapital' },
    { label: 'Zinssatz (%)',                      title: 'Nominaler Jahreszinssatz' },
    { label: 'Gesamtzinsen',                      title: 'Alle Zinsen über die gesamte Laufzeit' },
    { label: 'Zinsanteil (%)',                    title: 'Zinsen in % der Gesamtrückzahlung' },
    { label: 'Rückzahlung an Bank',               title: 'Darlehen + Gesamtzinsen', sep: true },
    { label: '→ Monatliche Rate',                 title: 'Berechnete monatliche Tilgungsrate (Annuitätenformel)', highlight: true },
    { label: 'Rate-Anteil Einkommen (%)',          title: 'Die Rate soll X% des Nettoeinkommens ausmachen' },
    { label: '→ Benötigtes Nettoeinkommen',       title: 'Das Nettoeinkommen das du mindestens benötigst', income: true, sep: true },
    { label: 'Betriebskosten (mtl.)',             title: '2,3% p.a. ÷ 12 Monate' },
    { label: 'Gesamtbelastung (mtl.)',            title: 'Monatliche Rate + Betriebskosten' },
    { label: 'Belastungsquote (%)',               title: 'Gesamtbelastung ÷ benötigtes Einkommen × 100', sep: true },
    { label: 'Aufgelaufene Nebenkosten',          title: 'Zinsen + Kaufnebenkosten' },
    { label: 'Nebenkosten-Anteil (%)',            title: 'Aufgelaufene Nebenkosten ÷ Kaufpreis netto × 100' },
    { label: 'Betriebskosten gesamt (Laufzeit)',  title: 'Monatliche BK × Laufzeit in Monaten' },
    { label: 'Gesamtbelastung (Laufzeit)',        title: 'Monatliche Gesamtbelastung × Laufzeit in Monaten', sep: true },
    { label: 'Totale Gesamtkosten',              title: 'Alle Belastungen + Kaufpreis brutto' }
  ];

  // ── HTML aufbauen ──
  let html = '<table>';

  // thead
  html += '<thead><tr>';
  headers.forEach(function (h) {
    const classes = [
      h.sep       ? 'col-sep'             : '',
      h.green     ? 'col-kaufpreis-netto' : '',
      h.highlight ? 'col-rate'            : '',
      h.income    ? 'col-income'          : ''
    ].filter(Boolean).join(' ');
    html += `<th class="${classes}" title="${h.title}">${h.label}</th>`;
  });
  html += '</tr></thead><tbody>';

  // Zeilen: für jedes Szenario alle Laufzeiten, dann block-separator
  validScenarios.forEach(function (s, scenIdx) {
    const isLastScen = (scenIdx === validScenarios.length - 1);

    terms.forEach(function (termYears, termIdx) {
      const isLastTerm = (termIdx === terms.length - 1);
      const m = calcReverseMetrics(
        s.netPurchasePrice, s.equityPct, s.interestPct, termYears, s.ratePct
      );

      // block-separator nur nach der letzten Laufzeit eines Szenarios (außer beim letzten Szenario)
      const rowCls = (!isLastScen && isLastTerm) ? 'block-separator' : '';

      html += `<tr class="${rowCls}">`;
      html += `<td style="text-align:center;font-weight:700;">Szenario ${s.index}</td>`;
      html += `<td style="text-align:center;font-weight:600;">${termYears} J.</td>`;
      html += `<td class="col-kaufpreis-netto">${formatNumber(m.netPurchasePrice)} €</td>`;
      html += `<td>${formatNumber(s.equityPct)} %</td>`;
      html += `<td>${formatNumber(m.equityAbs)} €</td>`;
      html += `<td>${formatNumber(m.grunderwerb)} €</td>`;
      html += `<td>${formatNumber(m.grundbuch)} €</td>`;
      html += `<td>${formatNumber(m.hypothek)} €</td>`;
      html += `<td>${formatNumber(m.makler)} €</td>`;
      html += `<td>${formatNumber(m.notar)} €</td>`;
      html += `<td>${formatNumber(m.sonstige)} €</td>`;
      html += `<td>${formatNumber(m.gesamtNebenkosten)} €</td>`;
      html += `<td class="col-sep">${formatNumber(m.nebKostenPct)} %</td>`;
      html += `<td>${formatNumber(m.purchasePriceBrutto)} €</td>`;
      html += `<td>${formatNumber(m.loanAmt)} €</td>`;
      html += `<td>${formatNumber(s.interestPct)} %</td>`;
      html += `<td>${formatNumber(m.interestAmt)} €</td>`;
      html += `<td>${formatNumber(m.zinsanteilPct)} %</td>`;
      html += `<td class="col-sep">${formatNumber(m.totalPaid)} €</td>`;
      html += `<td class="col-rate">${formatNumber(m.monthlyRate)} €</td>`;
      html += `<td>${formatNumber(s.ratePct)} %</td>`;
      html += `<td class="col-income col-sep">${formatNumber(m.requiredNetIncome)} €</td>`;
      html += `<td>${formatNumber(m.monthlyOps)} €</td>`;
      html += `<td>${formatNumber(m.burdenMonthly)} €</td>`;
      html += `<td class="col-sep">${formatNumber(m.burdenPct)} %</td>`;
      html += `<td>${formatNumber(m.accumulatedCosts)} €</td>`;
      html += `<td>${formatNumber(m.nebKostenAnteilPct)} %</td>`;
      html += `<td>${formatNumber(m.totalOpsOverTerm)} €</td>`;
      html += `<td class="col-sep">${formatNumber(m.totalBurdenOverTerm)} €</td>`;
      html += `<td>${formatNumber(m.totalCosts)} €</td>`;
      html += '</tr>';

      Logger.debug(
        `Szenario ${s.index} / ${termYears}J: ` +
        `Rate=${formatNumber(m.monthlyRate)} € → ` +
        `Nettoeinkommen=${formatNumber(m.requiredNetIncome)} €`
      );
    });
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  Logger.info(
    `renderReverseResults() ✓ – ${validScenarios.length} Szenario(s) × ${terms.length} Laufzeit(en)` +
    ` = ${validScenarios.length * terms.length} Zeilen gerendert`
  );
}
