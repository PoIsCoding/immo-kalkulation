/**
 * berechnungen.js
 * Zentrale Berechnungsfunktionen für den Immo-Rechner.
 * Alle mathematischen Kernberechnungen sind hier zusammengefasst.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.0.0
 */

// ========== Logger ==========
/**
 * Einfacher Logger mit Zeitstempel und Level-Unterstützung.
 * Level: 'INFO', 'WARN', 'ERROR', 'DEBUG'
 */
const Logger = {
  _prefix: '[ImmoRechner]',

  log(level, message, data) {
    const ts = new Date().toISOString();
    const out = `${this._prefix} [${level}] ${ts} — ${message}`;
    if (data !== undefined) {
      console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](out, data);
    } else {
      console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](out);
    }
  },

  info:  function(msg, data) { this.log('INFO',  msg, data); },
  warn:  function(msg, data) { this.log('WARN',  msg, data); },
  error: function(msg, data) { this.log('ERROR', msg, data); },
  debug: function(msg, data) { this.log('DEBUG', msg, data); }
};

// ========== Zahlenformatierung ==========

/**
 * Formatiert eine Zahl nach deutschem Format (Tausender-Punkt, Dezimalkomma).
 * Beispiel: 1234567.89 → "1.234.567,89"
 * @param {number|string} value - Der zu formatierende Wert
 * @returns {string} Formatierter String
 */
function formatNumber(value) {
  const num = Number(value) || 0;
  const parts = num.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  let resultInt = '';
  // Tausendergruppen einfügen
  while (intPart.length > 3) {
    resultInt = '.' + intPart.slice(-3) + resultInt;
    intPart = intPart.slice(0, -3);
  }
  return intPart + resultInt + ',' + decPart;
}

// ========== Annuitätenformel ==========

/**
 * Berechnet die maximale Darlehenssumme basierend auf monatlicher Rate,
 * Jahreszinssatz und Laufzeit (Annuitätenformel).
 *
 * Formel: D = R × (1 - (1 + i)^(-n)) / i
 * wobei i = Monatszinssatz, n = Anzahl Monate
 *
 * @param {number} R          - Monatliche Rate in €
 * @param {number} annualPct  - Jahreszinssatz in Prozent (z.B. 3.5)
 * @param {number} years      - Laufzeit in Jahren
 * @returns {number} Darlehenssumme in €
 */
function calcLoan(R, annualPct, years) {
  Logger.debug(`calcLoan() aufgerufen: Rate=${R}, Zins=${annualPct}%, Jahre=${years}`);

  const i = annualPct / 100 / 12; // Monatlicher Zinssatz
  const n = years * 12;            // Gesamtanzahl Monate

  // Sonderfall: Zins oder Laufzeit = 0
  if (i === 0 || n === 0) {
    Logger.warn('calcLoan(): Zinssatz oder Laufzeit = 0, gebe 0 zurück');
    return 0;
  }

  const loan = R * (1 - Math.pow(1 + i, -n)) / i;
  Logger.debug(`calcLoan() Ergebnis: ${loan}`);
  return loan;
}

// ========== Kaufnebenkosten ==========

/**
 * Berechnet alle österreichischen Kaufnebenkosten auf Basis des Kaufpreises.
 * Prozentsätze (ca.):
 *   - Grunderwerbssteuer:        3,5%
 *   - Grundbucheintragung:       1,1%
 *   - Hypothekeneintragung:      1,2%
 *   - Maklerkosten:              3,6%
 *   - Notar/Rechtsanwalt:        1,5% × 1,20 (inkl. MwSt)
 *   - Sonstige:                  1,0%
 *
 * @param {number} purchasePrice - Brutto-Kaufpreis in €
 * @returns {object} Objekt mit Einzelwerten und Gesamtsumme
 */
function calculateIncidentalCosts(purchasePrice) {
  Logger.debug(`calculateIncidentalCosts() aufgerufen: Kaufpreis=${purchasePrice}`);

  const grunderwerb = purchasePrice * 0.035;
  const grundbuch   = purchasePrice * 0.011;
  const hypothek    = purchasePrice * 0.012;
  const makler      = purchasePrice * 0.036;
  const notar       = purchasePrice * 0.015 * 1.20;
  const sonstige    = purchasePrice * 0.01;

  const summe = grunderwerb + grundbuch + hypothek + makler + notar + sonstige;
  const pct   = purchasePrice > 0 ? (summe / purchasePrice) * 100 : 0;

  Logger.debug(`calculateIncidentalCosts() Summe Nebenkosten: ${summe} (${pct.toFixed(2)}%)`);

  return {
    grunderwerb,
    grundbuch,
    hypothek,
    makler,
    notar,
    sonstige,
    summeNebenkosten: summe,
    nebKostenPct:     pct
  };
}

// ========== Hauptberechnungsfunktion ==========

/**
 * Berechnet alle relevanten Werte für ein Szenario und eine Laufzeit.
 * Gibt ein vollständiges Ergebnisobjekt zurück, das direkt in der Tabelle
 * verwendet werden kann.
 *
 * @param {number} netIncome  - Nettoeinkommen in €
 * @param {object} blk        - Block-Objekt { maxRatePct, equityPct, interestPct }
 * @param {number} termYears  - Laufzeit in Jahren
 * @param {number} fixedCosts - Monatliche Fixkosten in €
 * @returns {object} Alle berechneten Kennzahlen
 */
function calculateRowMetrics(netIncome, blk, termYears, fixedCosts) {
  Logger.info(`calculateRowMetrics() → Einkommen=${netIncome} €, Rate=${blk.maxRatePct}%, EK=${blk.equityPct}%, Zins=${blk.interestPct}%, Laufzeit=${termYears}J, Fixkosten=${fixedCosts} €`);

  // --- 1) Monatliche Rate ---
  const R = netIncome * blk.maxRatePct / 100;

  // --- 2) Darlehenssumme ---
  const loanAmt = calcLoan(R, blk.interestPct, termYears);

  // --- 3) Laufzeit in Monaten & Gesamtzahlung ---
  const n         = termYears * 12;
  const totalPaid = R * n;

  // --- 4) Gesamtzinsen ---
  const interestAmt = totalPaid - loanAmt;

  // --- 5) Kaufpreis berechnen ---
  // Bankanteil = 1 - Eigenkapitalanteil
  const bankShare = 1 - (blk.equityPct / 100);

  // Summe aller Nebenkostenprozentsätze
  const kbRateSum = 0.035 + 0.011 + 0.012 + 0.036 + (0.015 * 1.20) + 0.01;

  // Netto-Kaufpreis: Darlehenssumme / (Bankanteil + Nebenkosten)
  const netPurchase = loanAmt / (bankShare + kbRateSum);

  // --- 6) Kaufnebenkosten auf Basis Netto-Kaufpreis ---
  const grunderwerb      = netPurchase * 0.035;
  const grundbuch        = netPurchase * 0.011;
  const hypothek         = netPurchase * 0.012;
  const makler           = netPurchase * 0.036;
  const notar            = netPurchase * 0.015 * 1.20;
  const sonstige         = netPurchase * 0.01;
  const gesamtNebenkosten = grunderwerb + grundbuch + hypothek + makler + notar + sonstige;
  const nebKostenPct     = netPurchase > 0 ? (gesamtNebenkosten / netPurchase) * 100 : 0;

  // --- 7) Brutto-Kaufpreis = Netto + Nebenkosten ---
  const purchasePrice = netPurchase + gesamtNebenkosten;

  // --- 8) Eigenkapital absolut ---
  const equityAbs = purchasePrice * (blk.equityPct / 100);

  // --- 9) Monatliche Betriebskosten (2,3% p.a. / 12) ---
  const monthlyOps = purchasePrice * 0.023 / 12;

  // --- 10) Monatliche Gesamtbelastung ---
  const burdenMonthly = R + monthlyOps;

  // --- 11) Gesamtbelastung inkl. Fixkosten ---
  const totalWithFix = burdenMonthly + fixedCosts;

  // --- 12) Aufgelaufene Nebenkosten (Zinsen + Kaufnebenkosten) ---
  const accumulatedCosts = interestAmt + gesamtNebenkosten;

  // --- 13) Nebenkosten-Anteil am Netto-Kaufpreis ---
  const nebKostenAnteilPct = netPurchase > 0
    ? (accumulatedCosts / netPurchase) * 100
    : 0;

  // --- 14) Kosten über die gesamte Laufzeit ---
  const totalOpsOverTerm    = monthlyOps * n;
  const totalBurdenOverTerm = burdenMonthly * n;

  // --- 15) Totale Gesamtkosten = Belastung + Kaufpreis ---
  const totalCosts = totalBurdenOverTerm + (loanAmt + equityAbs);

  // --- 16) Belastungsquote ---
  const burdenPct = netIncome > 0 ? (burdenMonthly / netIncome) * 100 : 0;

  // --- 17) Rote-Zeile-Flag ---
  const overIncome = totalWithFix > netIncome;

  Logger.info(`calculateRowMetrics() ✓ Kaufpreis netto=${formatNumber(netPurchase)} €, Belastung=${formatNumber(burdenMonthly)} €/Monat, overIncome=${overIncome}`);

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
