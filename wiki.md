# Immo-Kalkulation Wiki

Dieses Wiki-Dokument beschreibt die Funktionsweise der Web-App **„Immo-Kalkulation“** und listet alle Formeln sowie Erklärungen der verwendeten Variablen.

---

## 1. Überblick

1. Der Nutzer gibt in jedem **Szenario** (Szenario 1, Szenario 2, Szenario 3) folgende Parameter ein:
   - **Nettoeinkommen** (€/Monat)
   - **Maximale Rate** (% des Nettoeinkommens, Slider 1–40 %)
   - **Eigenkapitalanteil** (% des Kaufpreises, Slider 20–80 %)
   - **Zinssatz** (nominaler Jahreszins in %)
2. Zusätzlich gibt es ein Feld für **monatliche Fixkosten** (€/Monat).
3. Es werden bis zu **5 Laufzeiten** (z. B. 20 Jahre, 25 Jahre, 30 Jahre, 35 Jahre, 40 Jahre) global festgelegt.
4. Beim Klick auf **„Berechnen“** werden alle Eingaben über `js/formHandler.js` in `sessionStorage` gespeichert und der Benutzer zu `ergebnisse.html` weitergeleitet (ohne URL-Parameter).
5. In `ergebnisse.html` liest JavaScript die Eingaben aus `sessionStorage` aus und berechnet für jedes Szenario und jede Laufzeit ein Set von Finanzkennzahlen.
6. Das Ergebnis wird in einer **scrollbaren Tabelle** dargestellt. Spalten und Zeilen enthalten folgende Berechnungen:
   - Annuitätenrechnung (Darlehenssumme & Gesamtzinsen)
   - Netto-Kaufpreis (abzüglich aller Kaufnebenkosten)
   - Aufschlüsselung der Kaufnebenkosten (Einzelbeträge und Summen)
   - Monatliche Betriebskosten, Gesamtbelastung, Nebenkosten-Anteil
   - Totale Kosten über die gesamte Laufzeit
7. **Hervorhebungen**
   - **Grün** → Spalte „Kaufpreis netto“ (Zielwert für den Anschaffungsbudget)
   - **Rot** → komplette Zeile, wenn die monatliche Gesamtbelastung (inkl. Fixkosten) das Nettoeinkommen überschreitet

---

## 2. Ablauf im Detail

### 2.1. Einlese- und Übergabeschritt (`index.html`)

**HTML-Elemente in jedem Szenario-Block**
```html
<div class="form-row">
  <label for="net-income1">Nettoeinkommen 1 (€)</label>
  <input type="text" id="net-income1" name="netIncome1" placeholder="z. B. 1.234,56" />
</div>
<div class="form-row">
  <label for="max-rate1">Max. Rate 1 (%)</label>
  <input type="range" id="max-rate1" name="maxRate1" min="1" max="40" step="1" value="40" />
  <span id="max-rate1-value">40</span>% = <span id="max-rate1-abs">0 €</span>
</div>
<div class="form-row">
  <label for="equity-share1">Eigenkapital 1 (%)</label>
  <input type="range" id="equity-share1" name="equityShare1" min="20" max="80" step="1" value="20" />
  <span id="equity-share1-value">20</span>%
</div>
<div class="form-row">
  <label for="interest-rate1">Zinssatz 1 (%)</label>
  <input type="number" id="interest-rate1" name="interestRate1" step="0.01" value="3" />
</div>
```

**Datenfluss mit `js/formHandler.js` und `sessionStorage`**

Beim Klick auf **„Berechnen“** werden alle Eingaben im Formular über das Skript `js/formHandler.js` gesammelt und als JSON-Objekt unter dem Schlüssel `calcData` im `sessionStorage` gespeichert. Anschließend wird der Benutzer zu `ergebnisse.html` weitergeleitet – es werden keine URL-Parameter verwendet. Die Datenübertragung erfolgt ausschließlich über den `sessionStorage`.

### 2.2. Ergebnis-Generierung (`ergebnisse.html`)

Beim Laden von **`ergebnisse.html`** wird automatisch die Funktion **`renderResults(inputData)`** ausgeführt, die die Werte aus `sessionStorage` ausliest und an `calculateResultsFromData(inputData)` übergibt:

```js
function renderResults(inputData) {
  const container = document.getElementById('results-container');
  container.innerHTML = calculateResultsFromData(inputData);

  // Klick-Listener für Header-Tooltips:
  const headers = container.querySelectorAll('th');
  headers.forEach(th => {
    th.addEventListener('click', () => {
      const infoText = th.getAttribute('data-info')
        || 'Keine zusätzliche Information verfügbar.';
      alert(infoText);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const raw = sessionStorage.getItem('calcData');
  if (!raw) {
    document.getElementById('results-container').innerText = 'Keine Daten gefunden.';
    return;
  }
  const inputData = JSON.parse(raw);
  renderResults(inputData);
});
```

**renderResults(inputData)** liest den DOM-Container mit `id="results-container"` aus.
Über **calculateResultsFromData(inputData)** wird der komplette HTML-String der Ergebnis-Tabelle erzeugt und in den Container eingefügt.
Danach fügt eine Schleife auf allen `<th>-Zellen` einen Klick-Listener hinzu, der beim Klick auf den Spaltentitel das jeweilige data-info-Attribut als Popup anzeigt.

---


## 3. Formeln und Variablen

### 3.1. Variablenübersicht

| Variable              | Typ               | Bedeutung                                                                                                      |
|-----------------------|-------------------|----------------------------------------------------------------------------------------------------------------|
| `netIncomeX`          | Number (€/Monat)  | Monats-Nettoeinkommen für Szenario X (X = 1, 2 oder 3).
| `maxRatePct`          | Number (%)        | Maximale Monatsrate in Prozent des Nettoeinkommens (1–40 %).
| `equityPct`           | Number (%)        | Eigenkapitalanteil am Kaufpreis (20–80 %).
| `interestPct`         | Number (%)        | Nominaler Jahreszinssatz in Prozent (z. B. 3 %, 4 %, 5 %).
| `termY`               | Number (Jahre)    | Laufzeit des Darlehens in Jahren (term1 … term5, z. B. 20, 25, 30, 35, 40).
| `fixedCosts`          | Number (€/Monat)  | Monatliche Fixkosten (z. B. Versicherungen, Abos).
| `bankShare`           | Number (dezimal)  | Anteil der Bankfinanzierung am Netto-Kaufpreis: `bankShare = 1 − (equityPct / 100)`.
| `kbRateSum`           | Number (dezimal)  | Summe der Kaufnebenkosten-Prozentsätze inklusive Notar-MwSt.: `0,035 + 0,011 + 0,012 + 0,036 + (0,015 × 1,20) + 0,01 = 0,122`.
| `R`                   | Number (€/Monat)  | Monatliche Rate: `R = netIncome × (maxRatePct / 100)`.
| `loanAmt`             | Number (€)        | Darlehenssumme über Annuitätenformel: `loanAmt = calcLoan(R, interestPct, termYears)`.
| `interestAmt`         | Number (€)        | Gesamtzinsen über die Laufzeit: `n = termYears × 12; totalPaid = R × n; interestAmt = totalPaid − loanAmt`.
| `netPurchase`         | Number (€)        | Netto-Kaufpreis (ohne Nebenkosten), so dass Bankanteil + Nebenkostenrate gedeckt sind: `netPurchase = loanAmt ÷ (bankShare + kbRateSum)`.
| `purchasePrice`       | Number (€)        | Brutto-Kaufpreis (Netto + Nebenkosten): `purchasePrice = netPurchase + gesamtNebenkosten`.
| `grunderwerb`         | Number (€)        | Grunderwerbssteuer (3,5 % von `netPurchase`): `grunderwerb = netPurchase × 0,035`.
| `grundbuch`           | Number (€)        | Grundbucheintragung (1,1 % von `netPurchase`): `grundbuch = netPurchase × 0,011`.
| `hypothek`            | Number (€)        | Hypothekeneintragung (1,2 % von `netPurchase`): `hypothek = netPurchase × 0,012`.
| `makler`              | Number (€)        | Maklerkosten (3,6 % von `netPurchase`): `makler = netPurchase × 0,036`.
| `notar`               | Number (€)        | Notar-/Rechtsanwaltskosten (1,5 % von `netPurchase` × 1,20 MwSt.): `notar = netPurchase × 0,015 × 1,20`.
| `sonstige`            | Number (€)        | Sonstige Nebenkosten (1 % von `netPurchase`): `sonstige = netPurchase × 0,01`.
| `gesamtNebenkosten`   | Number (€)        | Summe aller Nebenkosten: `gesamtNebenkosten = grunderwerb + grundbuch + hypothek + makler + notar + sonstige`.
| `nebKostenPct`        | Number (%)        | Nebenkosten-Anteil in % relativ zu `netPurchase`: `nebKostenPct = (gesamtNebenkosten ÷ netPurchase) × 100` (für `netPurchase > 0`).
| `equityAbs`           | Number (€)        | Eigenkapital in Euro: `equityAbs = purchasePrice × (equityPct / 100)`.
| `monthlyOps`          | Number (€/Monat)  | Monatliche Betriebskosten (2,3 % p. a. von `netPurchase` ÷ 12): `monthlyOps = netPurchase × 0,023 ÷ 12`.
| `burdenMonthly`       | Number (€/Monat)  | Monatliche Gesamtbelastung: `burdenMonthly = R + monthlyOps`.
| `totalWithFix`        | Number (€/Monat)  | Gesamtbelastung inkl. Fixkosten: `totalWithFix = burdenMonthly + fixedCosts`.
| `burdenPct`           | Number (%)        | Prozentualer Anteil der monatlichen Belastung am Nettoeinkommen: `burdenPct = (burdenMonthly ÷ netIncome) × 100` (für `netIncome > 0`).
| `accumulatedCosts`    | Number (€)        | Aufgelaufene Nebenkosten über Laufzeit: `accumulatedCosts = interestAmt + gesamtNebenkosten`.
| `nebKostenAnteilPct`  | Number (%)        | Prozentualer Anteil der aufgelaufenen Nebenkosten am `netPurchase`: `nebKostenAnteilPct = (accumulatedCosts ÷ netPurchase) × 100` (für `netPurchase > 0`).
| `totalOpsOverTerm`    | Number (€)        | Betriebskosten gesamt über Laufzeit: `totalOpsOverTerm = monthlyOps × (termYears × 12)`.
| `totalBurdenOverTerm` | Number (€)        | Gesamtbelastung gesamt über Laufzeit: `totalBurdenOverTerm = burdenMonthly × (termYears × 12)`.
| `totalCosts`          | Number (€)        | Totale Gesamtkosten: `totalCosts = totalBurdenOverTerm + purchasePrice`.
| `overIncome`          | Boolean           | Wahr (true), wenn `totalWithFix > netIncome` (für rote Zeilen-Markierung).                                     |

---

### 3.2. Zentrale Berechnungsfunktionen (`berechnungen.js`)

```js
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
 * Berechnet alle Kaufnebenkosten zu einem gegebenen Brutto-Kaufpreis.
 * @param {number} purchasePrice - Brutto-Kaufpreis in €
 * @returns {object}
 */
function calculateIncidentalCosts(purchasePrice) {
  const grunderwerb = purchasePrice * 0.035;
  const grundbuch   = purchasePrice * 0.011;
  const hypothek    = purchasePrice * 0.012;
  const makler      = purchasePrice * 0.036;
  const notar       = purchasePrice * 0.015 * 1.20;
  const sonstige    = purchasePrice * 0.01;
  const summe       = grunderwerb + grundbuch + hypothek + makler + notar + sonstige;
  const pct         = purchasePrice > 0 ? (summe / purchasePrice) * 100 : 0;
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
 * Führt alle Teil-Berechnungen für ein Szenario und eine Laufzeit aus.
 * @param {number} netIncome – Netto-Monatseinkommen
 * @param {object} blk – { maxRatePct, equityPct, interestPct }
 * @param {number} termYears – Laufzeit in Jahren
 * @param {number} fixedCosts – Fixkosten (€/Monat)
 * @returns {object} – Objekt mit allen Kennzahlen für die Tabelle
 */
function calculateRowMetrics(netIncome, blk, termYears, fixedCosts) {
  // 1. Monatliche Rate
  const R = netIncome * blk.maxRatePct / 100;

  // 2. Darlehenssumme (Annuitätenformel)
  const loanAmt = calcLoan(R, blk.interestPct, termYears);

  // 3. Bankanteil und Nebenkostenrate
  const bankShare = 1 - (blk.equityPct / 100);
  const kbRateSum = 0.035 + 0.011 + 0.012 + 0.036 + (0.015 * 1.20) + 0.01; // = 0,122

  // 4. Netto-Kaufpreis (ohne Nebenkosten)
  const netPurchase = loanAmt / (bankShare + kbRateSum);

  // 5. Einzelne Kaufnebenkosten (Basis = netPurchase)
  const grunderwerb = netPurchase * 0.035;
  const grundbuch   = netPurchase * 0.011;
  const hypothek    = netPurchase * 0.012;
  const makler      = netPurchase * 0.036;
  const notar       = netPurchase * 0.015 * 1.20;
  const sonstige    = netPurchase * 0.01;

  // 6. Summe + Prozent der Nebenkosten
  const gesamtNebenkosten = grunderwerb + grundbuch + hypothek + makler + notar + sonstige;
  const nebKostenPct = netPurchase > 0 ? (gesamtNebenkosten / netPurchase) * 100 : 0;

  // 7. Brutto-Kaufpreis (Netto + Nebenkosten)
  const purchasePrice = netPurchase + gesamtNebenkosten;

  // 8. Absoluter Eigenkapital-Betrag
  const equityAbs = purchasePrice * (blk.equityPct / 100);

  // 9. Monatliche Betriebskosten (2,3 % p. a. auf netPurchase ÷ 12)
  const monthlyOps = netPurchase * 0.023 / 12;

  // 10. Monatliche Gesamtbelastung (Rate + Betriebskosten)
  const burdenMonthly = R + monthlyOps;

  // 11. Gesamtbelastung inkl. Fixkosten
  const totalWithFix = burdenMonthly + fixedCosts;

  // 12. Prozentualer Anteil der Belastung am Nettoeinkommen
  const burdenPct = netIncome > 0 ? (burdenMonthly / netIncome) * 100 : 0;

  // 13. Aufgelaufene Nebenkosten (Zinsen + Nebenkosten)
  const interestAmt = (R * termYears * 12) - loanAmt;
  const accumulatedCosts = interestAmt + gesamtNebenkosten;
  const nebKostenAnteilPct = netPurchase > 0 ? (accumulatedCosts / netPurchase) * 100 : 0;

  // 14. Betriebskosten gesamt über Laufzeit
  const totalOpsOverTerm = monthlyOps * (termYears * 12);

  // 15. Gesamtbelastung gesamt über Laufzeit
  const totalBurdenOverTerm = burdenMonthly * (termYears * 12);

  // 16. Totale Gesamtkosten
  const totalCosts = totalBurdenOverTerm + purchasePrice;

  // 17. Indikator, ob Belastung das Nettoeinkommen übersteigt
  const overIncome = totalWithFix > netIncome;

  return {
    R,
    loanAmt,
    interestAmt,
    netPurchase,
    grunderwerb,
    grundbuch,
    hypothek,
    makler,
    notar,
    sonstige,
    gesamtNebenkosten,
    nebKostenPct,
    purchasePrice,
    equityAbs,
    monthlyOps,
    burdenMonthly,
    totalWithFix,
    burdenPct,
    accumulatedCosts,
    nebKostenAnteilPct,
    totalOpsOverTerm,
    totalBurdenOverTerm,
    totalCosts,
    overIncome
  };
}
```

## 4. Ergebnis-Tabelle (`functions.js`)

In **`functions.js`** baut die Funktion **`calculateResultsFromData(inputData)`** die gesamte scrollbare HTML-Tabelle auf. Anschließend fügt **`renderResults(inputData)`** die Tabelle in den DOM ein und hängt Klick-Listener an jede Spaltenüberschrift, damit beim Klick ein Popup mit Formel und Erklärung erscheint.

---

### 4.1. `calculateResultsFromData(inputData)`

1. **Eingabedaten aus sessionStorage**
   ```js
   function calculateResultsFromData(inputData) {
     // inputData entspricht dem JSON-Objekt aus sessionStorage (Schlüssel: 'calcData')
     // Beispielstruktur:
     // {
     //   netIncomes: [1234.56, 2345.67, 3456.78],
     //   fixedCosts: 200,
     //   terms: [20, 25, 30, 35, 40],
     //   blocks: [
     //     { maxRatePct: 30, equityPct: 20, interestPct: 3 },
     //     { maxRatePct: 35, equityPct: 30, interestPct: 3.5 },
     //     ...
     //   ]
     // }
     // ... weitere Verarbeitung wie bisher ...
   ```

---
### 4.2. Tabellenkopf (Header) mit title + data-info
Jeder <th>-Eintrag enthält:
* title: kurzer Tooltip (Browser-Standards)
* data-info: ausführliche Formel + Erklärung, die beim Klick per JavaScript als Popup gezeigt wird
```html
  let html = '<table border="1" cellpadding="5" cellspacing="0" style="width: 100%; text-align: right;">';
  html += '<tr>'
       + '<th title="Die Dauer des Darlehens in Jahren" '
       +   'data-info="Formel: Laufzeit in Jahren. Gibt an, über wie viele Jahre das Darlehen läuft." '
       +   'style="text-align: left; width: 100px;">Laufzeit in Jahren</th>'
       + '<th title="Der nominale Jahreszinssatz in Prozent" '
       +   'data-info="Formel: Zinssatz in %. Gibt den jährlichen Zinssatz des Darlehens an." '
       +   'style="width: 80px;">Zinssatz (%)</th>'
       + '<th class="col-sep" title="Die monatliche Rate, basierend auf Nettoeinkommen und Prozentwert" '
       +   'data-info="Formel: Nettoeinkommen × maxRate ÷ 100. Monatliche Rate in €." '
       +   'style="width: 120px;">Monatliche Rate</th>'
       + '<th title="Die aus der Annuitätenformel errechnete Kreditsumme" '
       +   'data-info="Formel: R × (1 − (1 + i)^(-n)) ÷ i. Annuitätenberechnung." '
       +   'style="width: 150px;">Darlehenssumme</th>'
       + '<th title="Summe aller Zinsen über die gesamte Laufzeit" '
       +   'data-info="Formel: (R × n) − Darlehenssumme. Gesamte Zinsen in €." '
       +   'style="width: 150px;">Gesamtzinsen</th>'
       + '<th title="Prozentualer Anteil der Zinsen an der Gesamtrückzahlung" '
       +   'data-info="Formel: Gesamtzinsen ÷ (Darlehenssumme + Gesamtzinsen) × 100 %." '
       +   'style="width: 120px;">Zinsanteil (%)</th>'
       + '<th class="col-sep" title="Summe aus Darlehen und Gesamtzinsen" '
       +   'data-info="Formel: Darlehenssumme + Gesamtzinsen." '
       +   'style="width: 150px;">Rückzahlung an Bank</th>'
       + '<th class="col-kaufpreis-netto" title="Netto‐Kaufpreis nach Abzug aller Kaufnebenkosten" '
       +   'data-info="Formel: Darlehenssumme ÷ (Bankanteil + Nebenkostenrate)." '
       +   'style="width: 150px;">Kaufpreis netto</th>'
       + '<th title="Eigenkapitalanteil in Prozent" '
       +   'data-info="Eigenkapital‐Prozentsatz am Kaufpreis." '
       +   'style="width: 100px;">Eigenanteil (%)</th>'
       + '<th class="col-sep" title="Betrag des Eigenkapitals in Euro" '
       +   'data-info="Formel: Kaufpreis netto × Eigenanteil ÷ 100." '
       +   'style="width: 120px;">Eigenanteil (€)</th>'
       + '<th title="3,5 % des Kaufpreises netto" '
       +   'data-info="Formel: Kaufpreis netto × 0,035." '
       +   'style="width: 120px;">Grunderwerbssteuer</th>'
       + '<th title="1,1 % des Kaufpreises netto" '
       +   'data-info="Formel: Kaufpreis netto × 0,011." '
       +   'style="width: 120px;">Grundbucheintragung</th>'
       + '<th title="1,2 % des Kaufpreises netto" '
       +   'data-info="Formel: Kaufpreis netto × 0,012." '
       +   'style="width: 150px;">Kredit-/Hypothekeneintragung</th>'
       + '<th title="3,6 % des Kaufpreises netto" '
       +   'data-info="Formel: Kaufpreis netto × 0,036." '
       +   'style="width: 120px;">Maklerkosten</th>'
       + '<th title="1,5 % des Kaufpreises netto × 1,20 MwSt." '
       +   'data-info="Formel: Kaufpreis netto × 0,015 × 1,20." '
       +   'style="width: 180px;">Notar-/Rechtsanwalt</th>'
       + '<th title="1 % des Kaufpreises netto (z. B. Versicherungen)" '
       +   'data-info="Formel: Kaufpreis netto × 0,01." '
       +   'style="width: 150px;">Sonstige Kosten</th>'
       + '<th title="Summe aller Kaufnebenkosten" '
       +   'data-info="Formel: Summe aller Nebenkosten‐Beträge." '
       +   'style="width: 150px;">Ges. Kaufnebenkosten</th>'
       + '<th class="col-sep" title="Ges. Kaufnebenkosten ÷ Kaufpreis netto × 100 %" '
       +   'data-info="Formel: Alle Kaufnebenkosten ÷ Kaufpreis netto × 100 %." '
       +   'style="width: 150px;">KNK‐Anteil (%)</th>'
       + '<th class="col-sep" title="Darlehenssumme + Eigenkapitalbetrag" '
       +   'data-info="Formel: Darlehenssumme + Eigenkapital." '
       +   'style="width: 150px;">Kaufkosten Brutto</th>'
       + '<th title="Monatliche Betriebskosten (2,3 % p.a. ÷ 12)" '
       +   'data-info="Formel: Kaufpreis netto × 0,023 ÷ 12." '
       +   'style="width: 170px;">Betriebskosten (monatl.)</th>'
       + '<th title="Monatliche Gesamtbelastung (Rate + Betriebskosten)" '
       +   'data-info="Formel: Monatsrate + Betriebskosten." '
       +   'style="width: 150px;">Gesamtbelastung (monatl.)</th>'
       + '<th title="Prozentualer Anteil der monatlichen Gesamtbelastung am Nettoeinkommen" '
       +   'data-info="Formel: Gesamtbelastung ÷ Nettoeinkommen × 100 %." '
       +   'style="width: 150px;">Belastung-Anteil (%)</th>'
       + '<th title="Monatliche Gesamtbelastung + Fixkosten" '
       +   'data-info="Formel: Gesamtbelastung + Fixkosten." '
       +   'style="width: 180px;">Gesamtbelastung inkl. Fixkosten (monatl.)</th>'
       + '<th title="Zinsen + ges. Kaufnebenkosten über Laufzeit" '
       +   'data-info="Formel: Gesamtzinsen + Ges. Kaufnebenkosten." '
       +   'style="width: 170px;">Aufgelaufene Nebenkosten</th>'
       + '<th class="col-sep" title="Aufgelaufene Nebenkosten ÷ Kaufpreis netto × 100 %" '
       +   'data-info="Formel: Aufgelaufene Nebenkosten ÷ Kaufpreis netto × 100 %." '
       +   'style="width: 150px;">Nebenkosten-Anteil (%)</th>'
       + '<th title="Betriebskosten gesamt über Laufzeit (Monate)" '
       +   'data-info="Formel: Betriebskosten monatl. × Laufzeit (Monate)." '
       +   'style="width: 170px;">Betriebskosten gesamt (Laufzeit)</th>'
       + '<th class="col-sep" title="Monatliche Gesamtbelastung × Laufzeit (Monate)" '
       +   'data-info="Formel: Gesamtbelastung monatl. × Laufzeit × 12." '
       +   'style="width: 190px;">Gesamtbelastung gesamt (Laufzeit)</th>'
       + '<th title="Gesamtbelastung gesamt + Kaufkosten Brutto" '
       +   'data-info="Formel: Gesamtbelastung gesamt + Kaufkosten Brutto." '
       +   'style="width: 170px;">Totale Gesamtkosten</th>'
       + '</tr>';
  // … Weitere Zeilen für jede Laufzeit und jedes Szenario folgen …
  return html;
}
```
---
### 4.2. renderResults(inputData)
```js
function renderResults(inputData) {
  const container = document.getElementById('results-container');
  container.innerHTML = calculateResultsFromData(inputData);

  // ↓ Klick-Listener für alle <th> hinzufügen ↓
  const headers = container.querySelectorAll('th');
  headers.forEach(th => {
    th.addEventListener('click', () => {
      const infoText = th.getAttribute('data-info')
        || 'Keine zusätzliche Information verfügbar.';
      alert(infoText);
    });
  });
}
```
1. Der Nutzer gibt in jedem **Szenario** (Szenario 1, Szenario 2, Szenario 3) folgende Parameter ein:
2. Zusätzlich gibt es ein Feld für **monatliche Fixkosten** (€/Monat).
* Beim Klick liest th.getAttribute('data-info') das hinterlegte Attribut aus und zeigt es per alert() an.
---
### 4.3. Darstellung und CSS-Hinweis
* Die Tabelle ist in einem **scrollbaren Container** eingebunden (z. B. overflow-x: auto;) in styles.css, damit horizontal gescrollt werden kann.
* **Keine Zeilenumbrüche** in den Spaltenüberschriften:
```css
/* Verhindert Zeilenumbruch in <th> */
#results-container table th {
  white-space: nowrap;
}
```
* Rote Hervorhebung ganzer Zeilen, wenn `overIncome === true`:
```html
// Beispiel beim Einfügen einer Tabellenzeile:
const rowStyle = metrics.overIncome ? ' style="background-color: #fdd;"' : '';
html += `<tr${rowStyle}> … </tr>`;
```
---
## 5. Zusammenfassung

- **Eingabe (index.html)**
  - Drei Vergleichsszenarien (Szenario 1–3) mit jeweils eigenem Nettoeinkommen, Maximal-Rate %, Eigenkapital % und Zinssatz %.
  - Fünf Laufzeiten (z. B. 20 Jahre, 25 Jahre, 30 Jahre, 35 Jahre, 40 Jahre).
  - Monatliche Fixkosten (€/Monat).
  - **Alle Eingaben werden über `js/formHandler.js` im `sessionStorage` gespeichert und an `ergebnisse.html` übergeben.**

- **Berechnung (berechnungen.js)**
  - `calcLoan(R, interestPct, termYears)` → Annuitätenformel zur Ermittlung der Darlehenssumme.
  - `calculateIncidentalCosts(purchasePrice)` → Berechnung aller Kaufnebenkosten (Einzelbeträge + Gesamtsumme).
  - `calculateRowMetrics(netIncome, blk, termYears, fixedCosts)` → Kapselt sämtliche Teilrechnungen für ein Szenario und eine Laufzeit in einem Rückgabeobjekt.

- **Ergebnis (functions.js & ergebnisse.html)**
  - `calculateResultsFromData(inputData)` baut die scrollbare HTML-Tabelle auf und formatiert alle Werte über `formatNumber(...)`.
  - Jeder Spaltenkopf (`<th>`) erhält ein `data-info`-Attribut mit Formel und Erklärung.
  - `renderResults(inputData)` fügt die Tabelle in den DOM ein und hängt Klick-Listener an jede `<th>`, sodass beim Klick das zugehörige `data-info`-Popup erscheint.

---

<!--
### PDF-Export
Der PDF-Export ist derzeit nicht verfügbar.
-->