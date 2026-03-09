/**
 * formHandler.js
 * Verarbeitet das Formular auf index.html:
 * Liest alle Eingaben, speichert sie in sessionStorage
 * und leitet auf ergebnisse.html weiter.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.0.0
 */

document.addEventListener('DOMContentLoaded', function () {
  Logger.info('formHandler.js: DOMContentLoaded');

  // Berechnen-Button holen
  const calcBtn = document.getElementById('calculate-btn');
  if (!calcBtn) {
    Logger.warn('formHandler.js: #calculate-btn nicht gefunden – kein Event registriert');
    return;
  }

  calcBtn.addEventListener('click', function () {
    Logger.info('formHandler.js: Berechnen-Button geklickt → Daten werden gesammelt');

    // --- Validierung: Mindestens ein Szenario muss ausgefüllt sein ---
    const income1 = document.getElementById('net-income1')?.value || '';
    const income2 = document.getElementById('net-income2')?.value || '';
    const income3 = document.getElementById('net-income3')?.value || '';

    if (!income1 && !income2 && !income3) {
      Logger.warn('formHandler.js: Kein Nettoeinkommen eingegeben');
      showFormError('Bitte gib mindestens ein Nettoeinkommen ein.');
      return;
    }

    // --- Alle Formularwerte auslesen ---
    const data = {
      // Nettoeinkommen (Textfelder mit deutschem Format)
      netIncome1: income1,
      netIncome2: income2,
      netIncome3: income3,

      // Max-Rate-Slider (in %)
      maxRate1: document.getElementById('max-rate1')?.value || '40',
      maxRate2: document.getElementById('max-rate2')?.value || '40',
      maxRate3: document.getElementById('max-rate3')?.value || '40',

      // Eigenkapital-Slider (in %)
      equityShare1: document.getElementById('equity-share1')?.value || '20',
      equityShare2: document.getElementById('equity-share2')?.value || '20',
      equityShare3: document.getElementById('equity-share3')?.value || '20',

      // Zinssatz (Dezimalzahl)
      interestRate1: document.getElementById('interest-rate1')?.value || '0',
      interestRate2: document.getElementById('interest-rate2')?.value || '0',
      interestRate3: document.getElementById('interest-rate3')?.value || '0',

      // Monatliche Fixkosten
      fixedCosts1: document.getElementById('fixed-costs1')?.value || '0',
      fixedCosts2: document.getElementById('fixed-costs2')?.value || '0',
      fixedCosts3: document.getElementById('fixed-costs3')?.value || '0',

      // Laufzeiten in Jahren
      term1: document.getElementById('term1')?.value || '20',
      term2: document.getElementById('term2')?.value || '25',
      term3: document.getElementById('term3')?.value || '30',
      term4: document.getElementById('term4')?.value || '35',
      term5: document.getElementById('term5')?.value || '40'
    };

    Logger.debug('formHandler.js: Gesammelte Daten:', data);

    // --- Daten in sessionStorage speichern ---
    try {
      sessionStorage.setItem('calcData', JSON.stringify(data));
      Logger.info('formHandler.js: Daten in sessionStorage gespeichert ✓');
    } catch (err) {
      Logger.error('formHandler.js: sessionStorage konnte nicht geschrieben werden:', err);
      showFormError('Fehler beim Speichern der Daten. Bitte versuche es erneut.');
      return;
    }

    // --- Auf Ergebnisseite weiterleiten ---
    Logger.info('formHandler.js: Weiterleitung auf ergebnisse.html');
    window.location.href = 'ergebnisse.html';
  });

  Logger.info('formHandler.js: Event-Listener für Berechnen-Button registriert ✓');
});

/**
 * Zeigt eine Fehlermeldung unterhalb des Buttons an.
 * @param {string} message - Anzuzeigender Fehlertext
 */
function showFormError(message) {
  Logger.warn('showFormError(): ' + message);
  let errEl = document.getElementById('form-error');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.id = 'form-error';
    errEl.style.cssText = 'color: #e53e3e; font-weight: 600; margin-top: 10px; text-align: center;';
    const calcBtn = document.getElementById('calculate-btn');
    calcBtn?.parentNode.appendChild(errEl);
  }
  errEl.textContent = message;
  // Fehlermeldung nach 5 Sekunden wieder entfernen
  setTimeout(() => { if (errEl) errEl.textContent = ''; }, 5000);
}
