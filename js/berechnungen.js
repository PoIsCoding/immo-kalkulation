// ========== Zentrale Berechnungsfunktionen ==========

/**
 * Formatiert eine Zahl nach deutschem Format (Tausender-Punkt, Dezimalkomma).
 * @param {number|string} value
 * @returns {string}
 */
function formatNumber(value) {
  const num = Number(value) || 0;
  const parts = num.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  let resultInt = '';
  while (intPart.length > 3) {
    resultInt = '.' + intPart.slice(-3) + resultInt;
    intPart = intPart.slice(0, -3);
  }
  return intPart + resultInt + ',' + decPart;
}

/**
 * Berechnet die Darlehenssumme (Annuitätenformel).
 * @param {number} R - monatliche Rate
 * @param {number} annualPct - Zinssatz in Prozent
 * @param {number} years - Laufzeit in Jahren
 * @returns {number}
 */
function calcLoan(R, annualPct, years) {
  const i = annualPct / 100 / 12;
  const n = years * 12;
  if (i === 0 || n === 0) return 0;
  return R * (1 - Math.pow(1 + i, -n)) / i;
}

/**
 * Berechnet alle Kaufnebenkosten und liefert ein Objekt mit Einzelwerten und Summe.
 * @param {number} purchasePrice - Brutto-Kaufpreis
 * @returns {object}
 */
function calculateIncidentalCosts(purchasePrice) {
  const grunderwerb = purchasePrice * 0.035;
  const grundbuch = purchasePrice * 0.011;
  const hypothek = purchasePrice * 0.012;
  const makler = purchasePrice * 0.036;
  const notar = purchasePrice * 0.015 * 1.20;
  const sonstige = purchasePrice * 0.01;
  const summe = grunderwerb + grundbuch + hypothek + makler + notar + sonstige;
  const pct = purchasePrice > 0 ? (summe / purchasePrice) * 100 : 0;
  return {
    grunderwerb,
    grundbuch,
    hypothek,
    makler,
    notar,
    sonstige,
    summeNebenkosten: summe,
    nebKostenPct: pct
  };
}

/**
 * Berechnet alle relevanten Werte für einen Block und einen Laufzeit-Termin.
 * @param {number} netIncome       - Nettoeinkommen des Blocks
 * @param {object} blk             - Block-Objekt mit { maxRatePct, equityPct, interestPct }
 * @param {number} termYears       - Laufzeit in Jahren
 * @param {number} fixedCosts      - monatliche Fixkosten
 * @returns {object}               - enthält alle benötigten Werte zum Einfügen in die Tabelle
 */
function calculateRowMetrics(netIncome, blk, termYears, fixedCosts) {
  // Monatliche Rate
  const R = netIncome * blk.maxRatePct / 100;

  // Darlehenssumme über Annuitätenformel
  const loanAmt = calcLoan(R, blk.interestPct, termYears);

  // Gesamtzahlungsdauer in Monaten
  const n = termYears * 12;

  // Gesamte Zahlung über die Laufzeit
  const totalPaid = R * n;

  // Gesamtzinsen
  const interestAmt = totalPaid - loanAmt;

  // Kaufpreis (brutto) basierend auf Eigenkapitalprozentsatz
  const bankShare = 1 - (blk.equityPct / 100);

  // Berechne Kaufpreis netto basierend auf Darlehenssumme, Bankanteil und Nebenkostenrate
  const kbRateSum = 0.035 + 0.011 + 0.012 + 0.036 + 0.015 * 1.20 + 0.01; // Summe der Prozentsätze
  const netPurchase = loanAmt / (bankShare + kbRateSum);

  // Berechne Kaufnebenkosten auf Basis von netPurchase
  const grunderwerb = netPurchase * 0.035;
  const grundbuch = netPurchase * 0.011;
  const hypothek = netPurchase * 0.012;
  const makler = netPurchase * 0.036;
  const notar = netPurchase * 0.015 * 1.20;
  const sonstige = netPurchase * 0.01;
  const gesamtNebenkosten = grunderwerb + grundbuch + hypothek + makler + notar + sonstige;
  const nebKostenPct = netPurchase > 0 ? (gesamtNebenkosten / netPurchase) * 100 : 0;

  // Brutto-Kaufpreis ergibt sich aus Netto-Kaufpreis + Nebenkosten
  const purchasePrice = netPurchase + gesamtNebenkosten;

  // Absoluter Eigenkapitalbetrag
  const equityAbs = purchasePrice * (blk.equityPct / 100);

  // Monatliche Betriebskosten (2,3% p.a. / 12)
  const monthlyOps = purchasePrice * 0.023 / 12;

  // Monatliche Gesamtbelastung
  const burdenMonthly = R + monthlyOps;

  // Monatliche Gesamtbelastung inkl. Fixkosten
  const totalWithFix = burdenMonthly + fixedCosts;

  // Aufgelaufene Nebenkosten (Zinsen + Nebenkosten)
  const accumulatedCosts = interestAmt + gesamtNebenkosten;

  // Nebenkosten-Anteil am Netto-Kaufpreis (%)
  const nebKostenAnteilPct = netPurchase > 0
    ? (accumulatedCosts / netPurchase) * 100
    : 0;

  // Betriebskosten gesamt über die Laufzeit
  const totalOpsOverTerm = monthlyOps * n;

  // Gesamtbelastung gesamt über die Laufzeit
  const totalBurdenOverTerm = burdenMonthly * n;

  // Totale Gesamtkosten = Gesamtbelastung gesamt + Kaufkosten Brutto
  const totalCosts = totalBurdenOverTerm + (loanAmt + equityAbs);

  // Belastungs-Anteil (%) = monatliche Belastung / Nettoeinkommen
  const burdenPct = netIncome > 0
    ? (burdenMonthly / netIncome) * 100
    : 0;

  // Zeilen-Hintergrundbedingung
  const overIncome = totalWithFix > netIncome;

  return {
    R,
    loanAmt,
    interestAmt,
    purchasePrice,
    grunderwerb,
    grundbuch,
    hypothek,
    makler,
    notar,
    sonstige,
    gesamtNebenkosten,
    nebKostenPct,
    netPurchase,
    equityAbs,
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
  };
}