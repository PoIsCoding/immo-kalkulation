/**
 * reverseHandler.js
 * Verwaltet alle Event-Listener und Slider-Logik auf reverse.html.
 * Liest Formulardaten, speichert sie in sessionStorage und leitet
 * auf reverse-ergebnisse.html weiter.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.2.0
 */

document.addEventListener("DOMContentLoaded", function () {
  Logger.info("reverseHandler.js: DOMContentLoaded");

  // ── Slider-Events für alle 3 Szenarien initialisieren ──
  [1, 2, 3].forEach(function (i) {
    initEquitySlider(i);
    initRatePctSlider(i);
    initPurchasePriceInput(i);
  });

  // ── Berechnen-Button ──
  const calcBtn = document.getElementById("rev-calculate-btn");
  if (!calcBtn) {
    Logger.warn("reverseHandler.js: #rev-calculate-btn nicht gefunden");
    return;
  }

  calcBtn.addEventListener("click", function () {
    Logger.info("reverseHandler.js: Berechnen-Button geklickt");

    // Mindestens ein Szenario muss einen Kaufpreis haben
    const p1 = parsePurchasePrice(1);
    const p2 = parsePurchasePrice(2);
    const p3 = parsePurchasePrice(3);

    if (p1 === 0 && p2 === 0 && p3 === 0) {
      Logger.warn("reverseHandler.js: Kein Kaufpreis eingegeben");
      showError("Bitte gib mindestens einen Kaufpreis ein.");
      return;
    }

    // Alle Formularwerte sammeln
    const data = {
      // Kaufpreise (Textfelder mit deutschem Format)
      purchasePrice1: document.getElementById("purchase-price1")?.value || "0",
      purchasePrice2: document.getElementById("purchase-price2")?.value || "0",
      purchasePrice3: document.getElementById("purchase-price3")?.value || "0",

      // Eigenanteil in % (Slider)
      equityPct1: document.getElementById("equity-pct1")?.value || "20",
      equityPct2: document.getElementById("equity-pct2")?.value || "20",
      equityPct3: document.getElementById("equity-pct3")?.value || "20",

      // Zinssatz in % (Zahlenfeld)
      revInterest1: document.getElementById("rev-interest1")?.value || "0",
      revInterest2: document.getElementById("rev-interest2")?.value || "0",
      revInterest3: document.getElementById("rev-interest3")?.value || "0",

      // Laufzeiten: 5 separate Felder (wie im Vorwärts-Rechner)
      revTerm1: document.getElementById("rev-term1")?.value || "20",
      revTerm2: document.getElementById("rev-term2")?.value || "25",
      revTerm3: document.getElementById("rev-term3")?.value || "30",
      revTerm4: document.getElementById("rev-term4")?.value || "35",
      revTerm5: document.getElementById("rev-term5")?.value || "40",

      // Rate-Anteil in % des Nettoeinkommens (Slider)
      ratePct1: document.getElementById("rate-pct1")?.value || "40",
      ratePct2: document.getElementById("rate-pct2")?.value || "40",
      ratePct3: document.getElementById("rate-pct3")?.value || "40",
    };

    Logger.debug("reverseHandler.js: Gesammelte Daten:", data);

    // In sessionStorage speichern
    try {
      sessionStorage.setItem("reverseCalcData", JSON.stringify(data));
      Logger.info("reverseHandler.js: Daten in sessionStorage gespeichert ✓");
    } catch (err) {
      Logger.error("reverseHandler.js: sessionStorage-Fehler:", err);
      showError("Fehler beim Speichern der Daten. Bitte versuche es erneut.");
      return;
    }

    // Weiterleiten
    Logger.info("reverseHandler.js: Weiterleitung auf reverse-ergebnisse.html");
    window.location.href = "reverse-ergebnisse.html";
  });

  // Help-Popup System starten
  initRevHelpSystem();

  // Progressive Szenario-Anzeige starten
  initRevScenarioToggle();

  Logger.info("reverseHandler.js: Initialisierung abgeschlossen ✓");
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
  const slider = document.getElementById(`equity-pct${i}`);
  const valueEl = document.getElementById(`equity-pct${i}-value`);
  const absEl = document.getElementById(`equity-pct${i}-abs`);
  if (!slider || !valueEl || !absEl) return;

  function update() {
    const pct = parseInt(slider.value) || 0;
    const price = parsePurchasePrice(i);
    const abs = (price * pct) / 100;

    valueEl.textContent = pct;
    absEl.textContent =
      abs.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " €";

    Logger.debug(`Eigenanteil-Slider ${i}: ${pct}% = ${abs.toFixed(2)} €`);
  }

  slider.addEventListener("input", update);
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
  const slider = document.getElementById(`rate-pct${i}`);
  const valueEl = document.getElementById(`rate-pct${i}-value`);
  if (!slider || !valueEl) return;

  slider.addEventListener("input", function () {
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

  input.addEventListener("input", function () {
    // Eigenanteil-Anzeige neu berechnen wenn Kaufpreis geändert wird
    const slider = document.getElementById(`equity-pct${i}`);
    const absEl = document.getElementById(`equity-pct${i}-abs`);
    const valueEl = document.getElementById(`equity-pct${i}-value`);
    if (!slider || !absEl || !valueEl) return;

    const price = parsePurchasePrice(i);
    const pct = parseInt(slider.value) || 0;
    const abs = (price * pct) / 100;

    absEl.textContent =
      abs.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " €";

    Logger.debug(
      `Kaufpreis-Input ${i} geändert: ${price} € → Eigenanteil ${abs.toFixed(2)} €`,
    );
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
  const raw = input.value.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(raw) || 0;
}

/**
 * Zeigt eine Fehlermeldung unterhalb des Berechnen-Buttons an.
 * Verschwindet nach 5 Sekunden automatisch.
 * @param {string} message - Anzuzeigender Text
 */
function showError(message) {
  Logger.warn("reverseHandler.js showError(): " + message);
  const errEl = document.getElementById("rev-form-error");
  if (errEl) {
    errEl.textContent = message;
    setTimeout(function () {
      errEl.textContent = "";
    }, 5000);
  }
}

// ============================================================
// HELP-POPUP SYSTEM (Rückwärts-Rechner)
// ============================================================

/**
 * Hilfetexte für alle Felder des Rückwärts-Rechners.
 */
const REV_HELP_TEXTS = {
  "rev-purchase-price": {
    title: "🏠 Kaufpreis netto",
    body:
      "Der Kaufpreis netto ist der eigentliche Preis der Immobilie, ohne die Kaufnebenkosten. " +
      "Der Rechner berechnet daraus automatisch alle österreichischen Kaufnebenkosten " +
      "(Grunderwerbssteuer, Grundbuch, Notar, Makler etc.) und addiert sie zum Kaufpreis brutto. " +
      'Format: Zahlen mit Punkt als Tausendertrenner, z.B. "350.000".',
  },
  "rev-equity": {
    title: "🏦 Eigenanteil",
    body:
      "Der Eigenanteil ist der Prozentsatz des Kaufpreises (brutto inkl. Nebenkosten), " +
      "den du selbst ohne Kredit aufbringst. " +
      "Österreichische Banken verlangen üblicherweise mindestens 20 % Eigenkapital. " +
      "Je höher der Eigenanteil, desto geringer die Darlehenssumme und damit die monatliche Rate – " +
      "und desto niedrigeres Nettoeinkommen wäre rechnerisch erforderlich.",
  },
  "rev-interest": {
    title: "📈 Zinssatz",
    body:
      "Der nominale Jahreszinssatz deines Kredits in Prozent. " +
      "Tipp: Vergleiche verschiedene Szenarien mit unterschiedlichen Zinssätzen, " +
      "um zu sehen wie stark der Zinssatz das benötigte Einkommen beeinflusst. " +
      "Als Orientierung: Fixzinsen lagen 2024 je nach Laufzeit bei 3–5 %.",
  },
  "rev-rate-pct": {
    title: "📊 Rate-Anteil am Einkommen",
    body:
      "Dieser Wert gibt an, welchen Prozentsatz deines Nettoeinkommens du für die monatliche Kreditrate aufwenden möchtest. " +
      "Banken finanzieren maximal 40 % des Nettoeinkommens als Rate (Maximum dieses Reglers). " +
      "Der Rechner teilt die berechnete Rate durch diesen Prozentsatz und ermittelt so das benötigte Nettoeinkommen: " +
      "z.B. Rate 1.200 € ÷ 40 % = 3.000 € Nettoeinkommen.",
  },
};

/**
 * Initialisiert das Help-Popup-System für den Rückwärts-Rechner.
 * Funktioniert per Event-Delegation – auch für später eingeblendete Szenarien.
 */
function initRevHelpSystem() {
  Logger.info("initRevHelpSystem(): Help-Buttons initialisieren");

  const overlay = document.getElementById("help-overlay");
  const titleEl = document.getElementById("help-title");
  const bodyEl = document.getElementById("help-body");
  const closeBtn = document.getElementById("help-close");

  if (!overlay || !titleEl || !bodyEl || !closeBtn) {
    Logger.warn("initRevHelpSystem(): Help-Elemente nicht gefunden");
    return;
  }

  // Event-Delegation auf body – deckt auch später eingeblendete Szenarien ab
  document.body.addEventListener("click", function (e) {
    const btn = e.target.closest(".help-btn");
    if (!btn) return;

    const key = btn.dataset.help;
    const data = REV_HELP_TEXTS[key];
    if (!data) {
      Logger.warn(`initRevHelpSystem(): Kein Hilfetext für key="${key}"`);
      return;
    }

    Logger.info(`Help-Popup öffnen: key="${key}"`);
    titleEl.textContent = data.title;
    bodyEl.textContent = data.body;
    overlay.classList.add("help-overlay--visible");
    overlay.setAttribute("aria-hidden", "false");
    closeBtn.focus();
    e.stopPropagation();
  });

  // Schließen über Close-Button
  closeBtn.addEventListener("click", closeRevHelp);

  // Schließen per Overlay-Klick
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeRevHelp();
  });

  // Schließen per Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeRevHelp();
  });

  Logger.info("initRevHelpSystem(): Initialisierung abgeschlossen ✓");
}

/** Schließt das Help-Popup. */
function closeRevHelp() {
  const overlay = document.getElementById("help-overlay");
  if (!overlay) return;
  overlay.classList.remove("help-overlay--visible");
  overlay.setAttribute("aria-hidden", "true");
  Logger.debug("Help-Popup geschlossen");
}

// ============================================================
// PROGRESSIVE SZENARIO-ANZEIGE (Rückwärts-Rechner)
// ============================================================

/**
 * Initialisiert das Add/Remove-System für Szenarien 2 und 3.
 * Steuert außerdem die --solo Klasse am Grid für die Zentrierung
 * von Szenario 1 wenn es alleine steht.
 */
function initRevScenarioToggle() {
  Logger.info("initRevScenarioToggle(): Initialisierung");

  const grid = document.getElementById("scenarios-grid");
  const addBtn2 = document.getElementById("rev-add-scenario-2");
  const addBtn3 = document.getElementById("rev-add-scenario-3");
  const card2 = document.getElementById("rev-scenario-card-2");
  const card3 = document.getElementById("rev-scenario-card-3");

  if (!grid || !addBtn2 || !addBtn3 || !card2 || !card3) {
    Logger.warn("initRevScenarioToggle(): Elemente nicht gefunden");
    return;
  }

  // ── Szenario 2 einblenden ──
  function activateScenario2() {
    Logger.info("Rev-Szenario 2 einblenden");
    card2.classList.remove("scenario-card--hidden");
    card2.classList.add("scenario-card--visible");
    addBtn2.classList.add("scenario-add-btn--hidden");
    addBtn3.classList.remove("scenario-add-btn--hidden");
    grid.classList.remove("scenarios-grid--solo"); // Zentrierung aufheben
    Logger.info("Rev-Szenario 2 eingeblendet ✓");
  }

  // ── Szenario 2 ausblenden (+ ggf. 3) ──
  function deactivateScenario2() {
    Logger.info("Rev-Szenario 2 (und ggf. 3) ausblenden");
    deactivateScenario3(true);
    card2.classList.remove("scenario-card--visible");
    card2.classList.add("scenario-card--hidden");
    addBtn2.classList.remove("scenario-add-btn--hidden");
    addBtn3.classList.add("scenario-add-btn--hidden");
    clearRevScenarioFields(2);
    grid.classList.add("scenarios-grid--solo"); // Szenario 1 wieder zentrieren
    Logger.info("Rev-Szenario 2 ausgeblendet ✓");
  }

  // ── Szenario 3 einblenden ──
  function activateScenario3() {
    Logger.info("Rev-Szenario 3 einblenden");
    card3.classList.remove("scenario-card--hidden");
    card3.classList.add("scenario-card--visible");
    addBtn3.classList.add("scenario-add-btn--hidden");
    Logger.info("Rev-Szenario 3 eingeblendet ✓");
  }

  // ── Szenario 3 ausblenden ──
  function deactivateScenario3(silent) {
    if (!silent) Logger.info("Rev-Szenario 3 ausblenden");
    card3.classList.remove("scenario-card--visible");
    card3.classList.add("scenario-card--hidden");
    addBtn3.classList.remove("scenario-add-btn--hidden");
    clearRevScenarioFields(3);
    if (!silent) Logger.info("Rev-Szenario 3 ausgeblendet ✓");
  }

  // Add-Button Events
  addBtn2.addEventListener("click", activateScenario2);
  addBtn3.addEventListener("click", activateScenario3);
  addBtn2.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") activateScenario2();
  });
  addBtn3.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") activateScenario3();
  });

  // Remove-Button per Event-Delegation
  document.body.addEventListener("click", function (e) {
    const btn = e.target.closest(".card-remove-btn");
    if (!btn) return;
    const val = btn.dataset.removes;
    if (val === "rev-2") deactivateScenario2();
    if (val === "rev-3") deactivateScenario3(false);
  });

  Logger.info("initRevScenarioToggle(): Initialisierung abgeschlossen ✓");
}

/**
 * Leert alle Eingabefelder eines Rückwärts-Szenarios.
 * @param {number} idx - Szenario-Index (2 oder 3)
 */
function clearRevScenarioFields(idx) {
  Logger.debug(`clearRevScenarioFields(${idx}): Felder leeren`);
  ["purchase-price", "rev-interest"].forEach(function (base) {
    const el = document.getElementById(`${base}${idx}`);
    if (el) el.value = "";
  });
  // Equity-Slider zurücksetzen
  const eqSlider = document.getElementById(`equity-pct${idx}`);
  const eqValue = document.getElementById(`equity-pct${idx}-value`);
  const eqAbs = document.getElementById(`equity-pct${idx}-abs`);
  if (eqSlider) eqSlider.value = "20";
  if (eqValue) eqValue.textContent = "20";
  if (eqAbs) eqAbs.textContent = "0,00 €";
  // Rate-Slider zurücksetzen
  const rateSlider = document.getElementById(`rate-pct${idx}`);
  const rateValue = document.getElementById(`rate-pct${idx}-value`);
  if (rateSlider) rateSlider.value = "40";
  if (rateValue) rateValue.textContent = "40";
  Logger.debug(`clearRevScenarioFields(${idx}) ✓`);
}
