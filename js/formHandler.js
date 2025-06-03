

document.addEventListener('DOMContentLoaded', function() {
  const calcBtn = document.getElementById('calculate-btn');
  if (!calcBtn) return;

  calcBtn.addEventListener('click', function() {
    // 1) Alle Formular-Werte auslesen
    const data = {
      netIncome1: document.getElementById('net-income1').value,
      netIncome2: document.getElementById('net-income2').value,
      netIncome3: document.getElementById('net-income3').value,
      maxRate1: document.getElementById('max-rate1').value,
      maxRate2: document.getElementById('max-rate2').value,
      maxRate3: document.getElementById('max-rate3').value,
      equityShare1: document.getElementById('equity-share1').value,
      equityShare2: document.getElementById('equity-share2').value,
      equityShare3: document.getElementById('equity-share3').value,
      interestRate1: document.getElementById('interest-rate1').value,
      interestRate2: document.getElementById('interest-rate2').value,
      interestRate3: document.getElementById('interest-rate3').value,
      fixedCosts1: document.getElementById('fixed-costs1').value,
      fixedCosts2: document.getElementById('fixed-costs2').value,
      fixedCosts3: document.getElementById('fixed-costs3').value,
      term1: document.getElementById('term1').value,
      term2: document.getElementById('term2').value,
      term3: document.getElementById('term3').value,
      term4: document.getElementById('term4').value,
      term5: document.getElementById('term5').value
    };
    // 2) In sessionStorage speichern
    sessionStorage.setItem('calcData', JSON.stringify(data));
    // 3) Auf Ergebnisse-Seite weiterleiten
    window.location.href = 'ergebnisse.html';
  });
});
