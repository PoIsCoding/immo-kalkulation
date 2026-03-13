/**
 * reverseHandler.js
 * Verwaltet alle Event-Listener und Slider-Logik auf reverse.html.
 * Liest Formulardaten, speichert sie in sessionStorage und leitet
 * auf reverse-ergebnisse.html weiter.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.2.0
 */

document.addEventListener('DOMContentLoaded', function () {
  Logger.info('reverseHandler.js: DOMContentLoaded');

  // ── Slider-Events für alle 3 Szenarien initialisieren ──
  [1, 2, 3].forEach(function (i) {
    initEquitySlider(i);
    initRatePctSlider(i);
    initPurchasePriceInput(i);
  });

  // ── Berechnen-Button ──
  const calcBtn = document.getElementById('rev-calculate-btn');
  if (!calcBtn) {
    Logger.warn('reverseHandler.js: #rev-calculate-btn nicht gefunden');
    return;
  }

  calcBtn.addEventListener('click', function () {
    Logger.info('reverseHandler.js: Berechnen-Button geklickt');

    // Mindestens ein Szenario muss einen Kaufpreis haben
    const p1 = parsePurchasePrice(1);
    const p2 = parsePurchasePrice(2);
    const p3 = parsePurchasePrice(3);

    if (p1 === 0 && p2 === 0 && p3 === 0) {
      Logger.warn('reverseHandler.js: Kein Kaufpreis eingegeben');
      showError('Bitte gib mindestens einen Kaufpreis ein.');
      return;
    }

    // Alle Formularwerte sammeln
    const data = {
      // Kaufpreise (Textfelder mit deutschem Format)
      purchasePrice1: document.getElementById('purchase-price1')?.value || '0',
      purchasePrice2: document.getElementById('purchase-price2')?.value || '0',
      purchasePrice3: document.getElementById('purchase-price3')?.value || '0',

      // Eigenanteil in % (Slider)
      equityPct1: document.getElementById('equity-pct1')?.value || '20',
      equityPct2: document.getElementById('equity-pct2')?.value || '20',
      equityPct3: document.getElementById('equity-pct3')?.value || '20',

      // Zinssatz in % (Zahlenfeld)
      revInterest1: document.getElementById('rev-interest1')?.value || '0',
      revInterest2: document.getElementById('rev-interest2')?.value || '0',
      revInterest3: document.getElementById('rev-interest3')?.value || '0',

      // Laufzeiten: 5 separate Felder (wie im Vorwärts-Rechner)
      revTerm1: document.getElementById('rev-term1')?.value || '20',
      revTerm2: document.getElementById('rev-term2')?.value || '25',
      revTerm3: document.getElementById('rev-term3')?.value || '30',
      revTerm4: document.getElementById('rev-term4')?.value || '35',
      revTerm5: document.getElementById('rev-term5')?.value || '40',

      // Rate-Anteil in % des Nettoeinkommens (Slider)
      ratePct1: document.getElementById('rate-pct1')?.value || '40',
      ratePct2: document.getElementById('rate-pct2')?.value || '40',
      ratePct3: document.getElementById('rate-pct3')?.value || '40'
    };

    Logger.debug('reverseHandler.js: Gesammelte Daten:', data);

    // In sessionStorage speichern
    try {
      sessionStorage.setItem('reverseCalcData', JSON.stringify(data));
      Logger.info('reverseHandler.js: Daten in sessionStorage gespeichert ✓');
    } catch (err) {
      Logger.error('reverseHandler.js: sessionStorage-Fehler:', err);
      showError('Fehler beim Speichern der Daten. Bitte versuche es erneut.');
      return;
    }

    // Weiterleiten
    Logger.info('reverseHandler.js: Weiterleitung auf reverse-ergebnisse.html');
    window.location.href = 'reverse-ergebnisse.html';
  });

  Logger.info('reverseHandler.js: Initialisierung abgeschlossen ✓');
});

// ============================================================
// Slider-Initialisierungen
// ============================================================

/**
 * Initialisiert den Eigenanteil-Slider für einen Block.
 * Zeigt Prozent + absoluten € Betrag basierend auf dem Kaufpreis-Input.
 * @param {number} i - Block-Index (1, 2, 3)
 */
function initEquitySlider(i) {
  const slider   = document.getElementById(`equity-pct${i}`);
  const valueEl  = document.getElementById(`equity-pct${i}-value`);
  const absEl    = document.getElementById(`equity-pct${i}-abs`);
  if (!slider || !valueEl || !absEl) return;

  function update() {
    const pct   = parseInt(slider.value) || 0;
    const price = parsePurchasePrice(i);
    const abs   = price * pct / 100;

    valueEl.textContent = pct;
    absEl.textContent   = abs.toLocaleString('de-DE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }) + ' €';

    Logger.debug(`Eigenanteil-Slider ${i}: ${pct}% = ${abs.toFixed(2)} €`);
  }

  slider.addEventListener('input', update);
  update(); // Initiale Anzeige
  Logger.debug(`reverseHandler.js: Eigenanteil-Slider ${i} registriert`);
}

/**
 * Initialisiert den Rate-Anteil-Slider für einen Block.
 * Max. 40% – entspricht der Bankgrenze für die monatliche Rate.
 * Zeigt nur den Prozentwert an.
 * @param {number} i - Block-Index (1, 2, 3)
 */
function initRatePctSlider(i) {
  const slider  = document.getElementById(`rate-pct${i}`);
  const valueEl = document.getElementById(`rate-pct${i}-value`);
  if (!slider || !valueEl) return;

  slider.addEventListener('input', function () {
    valueEl.textContent = slider.value;
    Logger.debug(`Rate-Anteil-Slider ${i}: ${slider.value}%`);
  });

  Logger.debug(`reverseHandler.js: Rate-Anteil-Slider ${i} registriert`);
}

/**
 * Registriert den Input-Event auf dem Kaufpreis-Textfeld:
 * Aktualisiert bei jeder Eingabe den Eigenanteil-€-Wert.
 * @param {number} i - Block-Index (1, 2, 3)
 */
function initPurchasePriceInput(i) {
  const input = document.getElementById(`purchase-price${i}`);
  if (!input) return;

  input.addEventListener('input', function () {
    // Eigenanteil-Anzeige neu berechnen wenn Kaufpreis geändert wird
    const slider  = document.getElementById(`equity-pct${i}`);
    const absEl   = document.getElementById(`equity-pct${i}-abs`);
    const valueEl = document.getElementById(`equity-pct${i}-value`);
    if (!slider || !absEl || !valueEl) return;

    const price = parsePurchasePrice(i);
    const pct   = parseInt(slider.value) || 0;
    const abs   = price * pct / 100;

    absEl.textContent = abs.toLocaleString('de-DE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }) + ' €';

    Logger.debug(`Kaufpreis-Input ${i} geändert: ${price} € → Eigenanteil ${abs.toFixed(2)} €`);
  });

  Logger.debug(`reverseHandler.js: Kaufpreis-Input ${i} registriert`);
}

// ============================================================
// Hilfsfunktionen
// ============================================================

/**
 * Liest den Kaufpreis aus einem Textfeld und gibt ihn als Zahl zurück.
 * Unterstützt Formate: "350000", "350.000", "350.000,00", "350000.00"
 * @param {number} i - Block-Index
 * @returns {number}
 */
function parsePurchasePrice(i) {
  const input = document.getElementById(`purchase-price${i}`);
  if (!input || !input.value) return 0;
  // Punkte als Tausender entfernen, Komma → Punkt
  const raw = input.value.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(raw) || 0;
}

/**
 * Zeigt eine Fehlermeldung unterhalb des Berechnen-Buttons an.
 * Verschwindet nach 5 Sekunden automatisch.
 * @param {string} message - Anzuzeigender Text
 */
function showError(message) {
  Logger.warn('reverseHandler.js showError(): ' + message);
  const errEl = document.getElementById('rev-form-error');
  if (errEl) {
    errEl.textContent = message;
    setTimeout(function () { errEl.textContent = ''; }, 5000);
  }
}
