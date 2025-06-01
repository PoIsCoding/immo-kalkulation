<html>
<head>
  <title>Ergebnisse</title>
  <script>
    function calculateResultsFromParams() {
      let html = '';
      // Header row
      html += '<tr>'
           + '<th title="Angegebene Laufzeit in Jahren" style="text-align: left; width: 100px; white-space: nowrap;">Laufzeit in Jahren</th>'
           + '<th title="Nominaler Jahreszinssatz in Prozent" style="width: 80px; white-space: nowrap;">Zinssatz</th>'
           + '<th title="Monatliche Rate = Nettoeinkommen × (Max. Rate % ÷ 100)" class="col-sep" style="width: 120px; white-space: nowrap;">Monatliche Rate</th>'
           + '<th title="Darlehenssumme = R × (1 – (1 + i)^(-n)) ÷ i (Annuitätenformel)" style="width: 150px; white-space: nowrap;">Darlehenssumme</th>'
           + '<th title="Gesamtzinsen = Monatsrate × Anzahl Monate – Darlehenssumme" style="width: 150px; white-space: nowrap;">Gesamtzinsen</th>'
           + '<th title="Zinsanteil = Gesamtzinsen ÷ Gesamtbetrag × 100%" style="width: 120px; white-space: nowrap;">Zinsanteil</th>'
           + '<th title="Gesamtzahlung an Bank = Darlehenssumme + Gesamtzinsen" class="col-sep" style="width: 150px; white-space: nowrap;">Rückzahlung an Bank</th>'
           + '<th title="Kaufpreis netto = Darlehenssumme – Gesamte Kaufnebenkosten + Eigenkapital" style="width: 150px; white-space: nowrap;">Kaufpreis netto</th>'
           + '<th title="Eigenkapitalanteil in Prozent" style="width: 100px; white-space: nowrap;">Eigenanteil</th>'
           + '<th title="Eigenkapital in Euro = Kaufpreis × Eigenkapitalanteil" class="col-sep" style="width: 120px; white-space: nowrap;">Eigenanteil (€)</th>'
           + '<th title="Grunderwerbssteuer = Kaufpreis × 3,5%" style="width: 120px; white-space: nowrap;">Grunderwerbssteuer</th>'
           + '<th title="Grundbucheintragung = Kaufpreis × 1,1%" style="width: 120px; white-space: nowrap;">Grundbucheintragung</th>'
           + '<th title="Kredit-/Hypothekeneintragung = Kaufpreis × 1,2%" style="width: 150px; white-space: nowrap;">Kredit-/Hypothekeneintragung</th>'
           + '<th title="Maklerkosten = Kaufpreis × 3,6%" style="width: 120px; white-space: nowrap;">Maklerkosten</th>'
           + '<th title="Notar-/Rechtsanwaltskosten inkl. 20% MwSt. = Kaufpreis × 1,5% × 1,20" style="width: 180px; white-space: nowrap;">Notar-/Rechtsanwalt</th>'
           + '<th title="Sonstige Kosten = Kaufpreis × 1,0% (Bearbeitungsgebühr für Kredit, diverse Gebühren, Versicherungen)" style="width: 150px; white-space: nowrap;">Sonstige Kosten</th>'
           + '<th title="Gesamte Kaufnebenkosten = Summe aller Nebenkosten" style="width: 150px; white-space: nowrap;">Ges. Kaufnebenkosten</th>'
           + '<th title="Kaufnebenkosten-Anteil = Gesamte Kaufnebenkosten ÷ Kaufpreis × 100%" style="width: 150px; white-space: nowrap;">KNK-Anteil %</th>'
           + '<th title="Kaufkosten brutto = Eigenkapital + Darlehenssumme" style="width: 150px; white-space: nowrap;">Kaufkosten Brutto</th>'
           + '<th title="Betriebskosten (monatl.) = Kaufpreis × 2,3% ÷ 12 (Strom 0,5%, Wasser 0,2%, Müllabfuhr 0,1%, Versicherung 0,5%, Instandhaltung 1% p.a.)" style="width: 170px; white-space: nowrap;">Betriebskosten (monatl.)</th>'
           + '<th title="Monatliche Gesamtbelastung = Monatliche Rate + Betriebskosten" style="width: 150px; white-space: nowrap;">Gesamtbelastung (monatl.)</th>'
           + '<th title="Belastung-Anteil = Gesamtbelastung (monatl.) ÷ Nettoeinkommen × 100%" style="width: 150px; white-space: nowrap;">Belastung-Anteil (%)</th>'
           + '<th title="Monatliche Gesamtbelastung inkl. Fixkosten = Gesamtbelastung (monatl.) + Fixkosten" style="width: 180px; white-space: nowrap;">Gesamtbelastung inkl. Fixkosten (monatl.)</th>'
           + '<th title="Aufgelaufene Nebenkosten = Gesamtzinsen + Ges. Kaufnebenkosten" style="width: 170px; white-space: nowrap;">Aufgelaufene Nebenkosten</th>'
           + '<th title="Nebenkosten-Anteil = Aufgelaufene Nebenkosten ÷ Kaufpreis netto × 100%" style="width: 150px; white-space: nowrap;">Nebenkosten-Anteil (%)</th>'
           + '<th title="Betriebskosten gesamt über Laufzeit = Betriebskosten (monatl.) × Laufzeit in Monaten" style="width: 170px; white-space: nowrap;">Betriebskosten gesamt (Laufzeit)</th>'
           + '<th title="Monatliche Gesamtbelastung über Laufzeit = Gesamtbelastung (monatl.) × Laufzeit in Monaten" style="width: 190px; white-space: nowrap;">Gesamtbelastung gesamt (Laufzeit)</th>'
           + '<th title="Totale Gesamtkosten = Gesamtbelastung gesamt (Laufzeit) + Kaufkosten Brutto" style="width: 170px; white-space: nowrap;">Totale Gesamtkosten</th>'
           + '</tr>';

      // First Laufzeit row
      const purchasePrice0 = 250000; // example value
      const grunderwerb0 = purchasePrice0 * 0.035;
      const grundbuch0 = purchasePrice0 * 0.011;
      const hypothek0 = purchasePrice0 * 0.012;
      const blk = {equityPct: 20, interestPct: 3.5}; // example equity percentage and interest rate
      const equityAbs0 = purchasePrice0 * (blk.equityPct / 100);
      const terms = [10, 15, 20]; // example terms
      const R = 1000; // example monthly rate
      const loan0 = 200000; // example loan amount
      const interest0 = 30000; // example interest amount
      const makler0 = purchasePrice0 * 0.036;
      const notar0 = purchasePrice0 * 0.015 * 1.19;
      const sonstige0 = purchasePrice0 * 0.01;
      const gesamtNebenkosten0 = grunderwerb0 + grundbuch0 + hypothek0 + makler0 + notar0 + sonstige0;
      const nebKostenPct0 = (purchasePrice0 > 0) ? (gesamtNebenkosten0 / purchasePrice0) * 100 : 0;
      const betriebskosten0 = purchasePrice0 * 0.023 / 12;
      const netPurchase0 = loan0 - gesamtNebenkosten0 + equityAbs0;
      const netIncome = 3000; // example net income for calculation of Belastung-Anteil

      // Parse monthly fixed costs from URL parameters
      const rawFix = params.get('fixedCosts')?.replace(/\./g, '').replace(/,/g, '.') || '0';
      const fixedCosts = parseFloat(rawFix) || 0;

      function formatNumber(num) {
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }

      html += '<tr>';
      html += `<td>${terms[0]} Jahre</td>`;
      html += `<td rowspan="5">${formatNumber(blk.interestPct)} %</td>`;
      html += `<td class="col-sep" rowspan="5">${formatNumber(R)} €</td>`;
      html += `<td>${formatNumber(loan0)} €</td>`;
      html += `<td>${formatNumber(interest0)} €</td>`;
      html += `<td>${formatNumber((interest0 / (loan0 + interest0)) * 100)} %</td>`;
      html += `<td class="col-sep">${formatNumber(loan0 + interest0)} €</td>`;
      html += `<td>${formatNumber(netPurchase0)} €</td>`;
      html += `<td rowspan="5">${formatNumber(blk.equityPct)} %</td>`;
      html += `<td class="col-sep" style="white-space: nowrap;">${formatNumber(equityAbs0)}&nbsp;€</td>`;
      html += `<td>${formatNumber(grunderwerb0)} €</td>`;
      html += `<td>${formatNumber(grundbuch0)} €</td>`;
      html += `<td>${formatNumber(hypothek0)} €</td>`;
      html += `<td>${formatNumber(makler0)} €</td>`;
      html += `<td>${formatNumber(notar0)} €</td>`;
      html += `<td>${formatNumber(sonstige0)} €</td>`;
      html += `<td>${formatNumber(gesamtNebenkosten0)} €</td>`;
      html += `<td>${formatNumber(nebKostenPct0)} %</td>`;
      html += `<td>${formatNumber(loan0 + equityAbs0)} €</td>`;
      html += `<td>${formatNumber(betriebskosten0)} €</td>`;
      const gesamtBelastung0 = R + betriebskosten0;
      html += `<td>${formatNumber(gesamtBelastung0)} €</td>`;
      const belastungPct0 = netIncome > 0 ? gesamtBelastung0 / netIncome * 100 : 0;
      html += `<td>${formatNumber(belastungPct0)} %</td>`;
      // Add monthly fixed costs
      const totalWithFix0 = gesamtBelastung0 + fixedCosts;
      html += `<td>${formatNumber(totalWithFix0)} €</td>`;
      // Calculate accumulated side costs
      const aufgelaufeneNebenkosten0 = interest0 + gesamtNebenkosten0;
      html += `<td>${formatNumber(aufgelaufeneNebenkosten0)} €</td>`;
      // Calculate percentage of accumulated side costs relative to net purchase cost
      const nebKostenAnteil0 = netPurchase0 > 0 ? (aufgelaufeneNebenkosten0 / netPurchase0) * 100 : 0;
      html += `<td>${formatNumber(nebKostenAnteil0)} %</td>`;
      // Calculate total operating costs over the term (months)
      const betriebskostenGesamt0 = betriebskosten0 * terms[0] * 12;
      html += `<td>${formatNumber(betriebskostenGesamt0)} €</td>`;
      // Calculate total monthly burden over the term (months)
      const gesamtBelastungGesamt0 = gesamtBelastung0 * terms[0] * 12;
      html += `<td>${formatNumber(gesamtBelastungGesamt0)} €</td>`;
      // Calculate total costs = total burden over term + gross purchase cost
      const totaleGesamtkosten0 = gesamtBelastungGesamt0 + (loan0 + equityAbs0);
      html += `<td>${formatNumber(totaleGesamtkosten0)} €</td>`;
      html += '</tr>';

      // Loop for subsequent Laufzeiten
      for (let t = 1; t < terms.length; t++) {
        const purchasePriceT = 250000 + t * 10000; // example calculation
        const grunderwerbT = purchasePriceT * 0.035;
        const grundbuchT = purchasePriceT * 0.011;
        const hypothekT = purchasePriceT * 0.012;
        const maklerT = purchasePriceT * 0.036;
        const notarT = purchasePriceT * 0.015 * 1.19;
        const sonstigeT = purchasePriceT * 0.01;
        const equityAbsT = purchasePriceT * (blk.equityPct / 100);
        const gesamtNebenkostenT = grunderwerbT + grundbuchT + hypothekT + maklerT + notarT + sonstigeT;
        const nebKostenPctT = (purchasePriceT > 0) ? (gesamtNebenkostenT / purchasePriceT) * 100 : 0;
        const betriebskostenT = purchasePriceT * 0.023 / 12;
        const loanAmt = 200000 + t * 10000; // example loan amount for the term
        const netPurchaseT = loanAmt - gesamtNebenkostenT + equityAbsT;

        html += '<tr>';
        html += `<td>${terms[t]} Jahre</td>`;
        // Zinssatz and Monatliche Rate cells are rowspan=5 in first row, so omitted here
        html += `<td>${formatNumber(loanAmt)} €</td>`;
        html += `<td>${formatNumber(interest0)} €</td>`; // Using interest0 as example, could be changed
        html += `<td>${formatNumber((interest0 / (loanAmt + interest0)) * 100)} %</td>`;
        html += `<td class="col-sep">${formatNumber(loanAmt + interest0)} €</td>`;
        html += `<td>${formatNumber(netPurchaseT)} €</td>`;
        html += `<td class="col-sep" style="white-space: nowrap;">${formatNumber(equityAbsT)}&nbsp;€</td>`;
        html += `<td>${formatNumber(grunderwerbT)} €</td>`;
        html += `<td>${formatNumber(grundbuchT)} €</td>`;
        html += `<td>${formatNumber(hypothekT)} €</td>`;
        html += `<td>${formatNumber(maklerT)} €</td>`;
        html += `<td>${formatNumber(notarT)} €</td>`;
        html += `<td>${formatNumber(sonstigeT)} €</td>`;
        html += `<td>${formatNumber(gesamtNebenkostenT)} €</td>`;
        html += `<td>${formatNumber(nebKostenPctT)} %</td>`;
        html += `<td>${formatNumber(loanAmt + equityAbsT)} €</td>`;
        html += `<td>${formatNumber(betriebskostenT)} €</td>`;
        const gesamtBelastungT = R + betriebskostenT;
        html += `<td>${formatNumber(gesamtBelastungT)} €</td>`;
        const belastungPctT = netIncome > 0 ? gesamtBelastungT / netIncome * 100 : 0;
        html += `<td>${formatNumber(belastungPctT)} %</td>`;
        // Add monthly fixed costs
        const totalWithFixT = gesamtBelastungT + fixedCosts;
        html += `<td>${formatNumber(totalWithFixT)} €</td>`;
        // Calculate accumulated side costs
        const interestT = interest0; // define interestT as interest0 since interest0 used in interest column
        const aufgelaufeneNebenkostenT = interestT + gesamtNebenkostenT;
        html += `<td>${formatNumber(aufgelaufeneNebenkostenT)} €</td>`;
        // Calculate percentage of accumulated side costs relative to net purchase cost
        const nebKostenAnteilT = netPurchaseT > 0 ? (aufgelaufeneNebenkostenT / netPurchaseT) * 100 : 0;
        html += `<td>${formatNumber(nebKostenAnteilT)} %</td>`;
        // Calculate total operating costs over the term (months)
        const betriebskostenGesamtT = betriebskostenT * terms[t] * 12;
        html += `<td>${formatNumber(betriebskostenGesamtT)} €</td>`;
        // Calculate total monthly burden over the term (months)
        const gesamtBelastungGesamtT = gesamtBelastungT * terms[t] * 12;
        html += `<td>${formatNumber(gesamtBelastungGesamtT)} €</td>`;
        // Calculate total costs = total burden over term + gross purchase cost
        const totaleGesamtkostenT = gesamtBelastungGesamtT + (loanAmt + equityAbsT);
        html += `<td>${formatNumber(totaleGesamtkostenT)} €</td>`;
        html += '</tr>';
      }

      document.getElementById('results-table-body').innerHTML = html;
    }
  </script>
</head>
<body onload="calculateResultsFromParams()">
  <table id="results-container">
    <thead></thead>
    <tbody id="results-table-body"></tbody>
  </table>
</body>
</html>