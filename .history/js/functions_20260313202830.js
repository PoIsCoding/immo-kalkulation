/**
 * functions.js
 * Hilfsfunktionen, Slider-Events und Ergebnis-Rendering für den Immo-Rechner.
 *
 * Autor: ©Poramet "PoIsCoding" Bahnschulte
 * Version: v2.0.0
 */

// Logger steht global aus berechnungen.js zur Verfügung

// ========== Eingabe-Hilfsfunktionen ==========

/**
 * Bereinigt ein Nettoeinkommen-Textfeld: Erlaubt nur Ziffern, Punkt, Komma.
 * @param {string} idx - Index des Feldes (1, 2 oder 3)
 */
function filterNetInput(idx) {
  Logger.debug(`filterNetInput(${idx}) aufgerufen`);
  const input = document.getElementById("net-income" + idx);
  if (!input) return;
  input.value = input.value.replace(/[^\d.,]/g, "");
}

/**
 * Formatiert ein Nettoeinkommen-Feld im deutschen Zahlenformat.
 * Beispiel: "1234.56" → "1.234,56"
 * @param {string} idx - Index des Feldes (1, 2 oder 3)
 */
function formatNetIncome(idx) {
  Logger.debug(`formatNetIncome(${idx}) aufgerufen`);
  const input = document.getElementById("net-income" + idx);
  if (!input) return;

  // Normalisierung: Punkte weg, Komma → Punkt
  let raw = input.value.replace(/\./g, "").replace(/,/g, ".");
  let num = parseFloat(raw) || 0;

  const parts = num.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Tausenderpunkte einfügen
  input.value =
    integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decimalPart;
  Logger.debug(`formatNetIncome(${idx}) → ${input.value}`);
}

/**
 * Liest einen Nettoeinkommen-Wert als Zahl aus dem Textfeld.
 * @param {string} idx - Index des Feldes (1, 2 oder 3)
 * @returns {number} Zahlenwert oder 0
 */
function getNetIncomeValue(idx) {
  const input = document.getElementById("net-income" + idx);
  if (!input) return 0;
  const raw = input.value.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(raw) || 0;
}

// ========== Slider-Aktualisierung ==========

/**
 * Aktualisiert die Anzeige eines Max-Rate-Sliders:
 * Zeigt den Prozentwert und den absoluten Eurobetrag an.
 *
 * @param {string} sliderId     - ID des Sliders
 * @param {string} valueSpanId  - ID des Prozent-Anzeigeelements
 * @param {string} absSpanId    - ID des Euro-Anzeigeelements
 * @param {string} netIncomeId  - ID des Nettoeinkommen-Feldes
 */
function updateSliderValue(sliderId, valueSpanId, absSpanId, netIncomeId) {
  const slider = document.getElementById(sliderId);
  const valueSpan = document.getElementById(valueSpanId);
  const absSpan = document.getElementById(absSpanId);
  if (!slider || !valueSpan || !absSpan) return;

  // Nettoeinkommen aus Textfeld lesen
  const raw =
    document
      .getElementById(netIncomeId)
      ?.value.replace(/\./g, "")
      .replace(/,/g, ".") || "0";
  const net = parseFloat(raw) || 0;

  // Prozentwert anzeigen
  valueSpan.textContent = slider.value;

  // Absoluten Eurobetrag berechnen und anzeigen
  const absValue = parseFloat(((net * slider.value) / 100).toFixed(2));
  const formattedAbs =
    absValue.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €";
  absSpan.textContent = formattedAbs;

  Logger.debug(
    `updateSliderValue(${sliderId}): ${slider.value}% = ${formattedAbs}`,
  );
}

/**
 * Platzhalter für zukünftige Live-Vorschau-Logik.
 */
function updateValues() {
  // Kann für Live-Vorschau erweitert werden
}

// ========== Tabellen-Rendering ==========

/**
 * Hilfsfunktion: Gibt eine formatierte Tabellenzelle zurück.
 * @param {string|number} val  - Wert
 * @param {string}        unit - Einheit (€, %, ...)
 * @param {string}        cls  - Optionale CSS-Klasse
 * @param {number}        rs   - rowspan (optional)
 * @returns {string} <td>...</td>
 */
function td(val, unit, cls, rs) {
  const classAttr = cls ? ` class="${cls}"` : "";
  const rowspanAttr = rs ? ` rowspan="${rs}"` : "";
  return `<td${classAttr}${rowspanAttr}>${val}${unit ? " " + unit : ""}</td>`;
}

/**
 * Baut die komplette HTML-Tabelle für alle Szenarien und Laufzeiten.
 *
 * @param {object} data - Eingabedaten aus sessionStorage
 * @returns {string} HTML-String der fertigen Tabelle
 */
function calculateResultsFromData(data) {
  Logger.info("calculateResultsFromData() → starte Tabellenberechnung");

  // --- Nettoeinkommen einlesen ---
  const incomes = [1, 2, 3].map((i) => {
    const raw = (data["netIncome" + i] || "0")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    return parseFloat(raw) || 0;
  });

  // --- Fixkosten einlesen ---
  const fixedCostsArr = [1, 2, 3].map((i) => {
    const raw = (data["fixedCosts" + i] || "0")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    return parseFloat(raw) || 0;
  });

  // --- Laufzeiten einlesen ---
  const terms = [1, 2, 3, 4, 5].map((i) => parseInt(data["term" + i]) || 0);
  Logger.debug("Laufzeiten:", terms);

  // --- Blöcke (Szenarien) einlesen ---
  const blocks = [1, 2, 3].map((i) => ({
    label: `Szenario ${i}`,
    maxRatePct: parseFloat(data["maxRate" + i]) || 0,
    equityPct: parseFloat(data["equityShare" + i]) || 0,
    interestPct: parseFloat(data["interestRate" + i]) || 0,
  }));
  Logger.debug("Szenarien:", blocks);

  // --- Tabellen-Header ---
  const headers = [
    { label: "Laufzeit<br>in Jahren", title: "Laufzeit in Jahren" },
    { label: "Zinssatz (%)", title: "Nominaler Jahreszinssatz" },
    { label: "Monatliche Rate", title: "Monatliche Tilgungsrate", sep: true },
    {
      label: "Darlehenssumme",
      title: "Maximale Darlehenssumme nach Annuitätenformel",
    },
    { label: "Gesamtzinsen", title: "Gesamte Zinszahlungen über die Laufzeit" },
    {
      label: "Zinsanteil (%)",
      title: "Anteil der Zinsen an der Gesamtrückzahlung",
    },
    {
      label: "Rückzahlung an Bank",
      title: "Gesamte Rückzahlung = Darlehen + Zinsen",
      sep: true,
    },
    {
      label: "Kaufpreis netto",
      title: "Kaufpreis ohne Nebenkosten",
      green: true,
    },
    { label: "Eigenanteil (%)", title: "Prozentualer Eigenkapitalanteil" },
    {
      label: "Eigenanteil (€)",
      title: "Absoluter Eigenkapitalbetrag",
      sep: true,
    },
    { label: "Grunderwerbssteuer", title: "3,5% des Kaufpreises netto" },
    { label: "Grundbucheintragung", title: "1,1% des Kaufpreises netto" },
    { label: "Hypothekeneintragung", title: "1,2% des Kaufpreises netto" },
    { label: "Maklerkosten", title: "3,6% des Kaufpreises netto" },
    { label: "Notar / Rechtsanwalt", title: "1,5% × 1,20 (inkl. MwSt)" },
    { label: "Sonstige Kosten", title: "1,0% des Kaufpreises netto" },
    { label: "Ges. Kaufnebenkosten", title: "Summe aller Kaufnebenkosten" },
    {
      label: "KNK-Anteil (%)",
      title: "Kaufnebenkosten in % vom Kaufpreis netto",
      sep: true,
    },
    {
      label: "Kaufkosten Brutto",
      title: "Eigenkapital + Darlehenssumme",
      sep: true,
    },
    { label: "Betriebskosten (mtl.)", title: "2,3% p.a. ÷ 12 Monate" },
    { label: "Gesamtbelastung (mtl.)", title: "Rate + Betriebskosten" },
    {
      label: "Belastungsquote (%)",
      title: "Gesamtbelastung ÷ Nettoeinkommen × 100",
    },
    { label: "Monatl. Fixkosten", title: "Eingegebene monatliche Fixkosten" },
    {
      label: "Gesamtbelastung<br>inkl. Fixkosten",
      title: "Rate + Betriebskosten + Fixkosten",
    },
    { label: "Aufgelaufene<br>Nebenkosten", title: "Zinsen + Kaufnebenkosten" },
    {
      label: "Nebenkosten-Anteil (%)",
      title: "Aufgelaufene Nebenkosten ÷ Kaufpreis netto × 100",
      sep: true,
    },
    {
      label: "Betriebskosten gesamt<br>(Laufzeit)",
      title: "Monatliche Betriebskosten × Laufzeit in Monaten",
    },
    {
      label: "Gesamtbelastung<br>(Laufzeit)",
      title: "Monatliche Gesamtbelastung × Laufzeit in Monaten",
      sep: true,
    },
    {
      label: "Totale Gesamtkosten",
      title: "Alle Kosten + Kaufpreis inkl. Eigenkapital",
    },
  ];

  let html = "<table>";

  // Thead
  html += "<thead><tr>";
  headers.forEach((h) => {
    const cls = [h.sep ? "col-sep" : "", h.green ? "col-kaufpreis-netto" : ""]
      .filter(Boolean)
      .join(" ");
    html += `<th class="${cls}" title="${h.title}">${h.label}</th>`;
  });
  html += "</tr></thead><tbody>";

  // --- Daten-Zeilen je Block ---
  blocks.forEach((blk, index) => {
    const netIncome = incomes[index];
    const fixedCosts = fixedCostsArr[index];

    // Überspringe leere Szenarien (kein Einkommen oder kein Zinssatz)
    if (netIncome === 0 || blk.interestPct === 0) {
      Logger.warn(
        `Szenario ${index + 1} übersprungen: Einkommen=${netIncome}, Zins=${blk.interestPct}`,
      );
      return;
    }

    Logger.info(`Rendere Szenario ${index + 1}: Einkommen=${netIncome} €`);

    // Erste Zeile des Blocks
    const m0 = calculateRowMetrics(netIncome, blk, terms[0], fixedCosts);
    const overClass0 = m0.overIncome ? ' class="over-income"' : "";

    html += `<tr${overClass0}>`;
    html += td(terms[0] + " Jahre", "", "");
    html += td(formatNumber(blk.interestPct), "%", "", 5); // rowspan=5
    html += td(formatNumber(m0.R), "€", "col-sep", 5); // rowspan=5
    html += td(formatNumber(m0.loanAmt), "€", "");
    html += td(formatNumber(m0.interestAmt), "€", "");
    html += td(
      formatNumber((m0.interestAmt / (m0.loanAmt + m0.interestAmt)) * 100),
      "%",
      "",
    );
    html += td(formatNumber(m0.loanAmt + m0.interestAmt), "€", "col-sep");
    html += td(formatNumber(m0.netPurchase), "€", "col-kaufpreis-netto");
    html += td(formatNumber(blk.equityPct), "%", "", 5); // rowspan=5
    html += td(formatNumber(m0.equityAbs), "€", "col-sep");
    html += td(formatNumber(m0.grunderwerb), "€", "");
    html += td(formatNumber(m0.grundbuch), "€", "");
    html += td(formatNumber(m0.hypothek), "€", "");
    html += td(formatNumber(m0.makler), "€", "");
    html += td(formatNumber(m0.notar), "€", "");
    html += td(formatNumber(m0.sonstige), "€", "");
    html += td(formatNumber(m0.gesamtNebenkosten), "€", "");
    html += td(formatNumber(m0.nebKostenPct), "%", "col-sep");
    html += td(formatNumber(m0.loanAmt + m0.equityAbs), "€", "col-sep");
    html += td(formatNumber(m0.monthlyOps), "€", "");
    html += td(formatNumber(m0.burdenMonthly), "€", "");
    html += td(formatNumber(m0.burdenPct), "%", "");
    html += td(formatNumber(fixedCosts), "€", "", 5); // rowspan=5
    html += td(formatNumber(m0.totalWithFix), "€", "");
    html += td(formatNumber(m0.accumulatedCosts), "€", "");
    html += td(formatNumber(m0.nebKostenAnteilPct), "%", "col-sep");
    html += td(formatNumber(m0.totalOpsOverTerm), "€", "");
    html += td(formatNumber(m0.totalBurdenOverTerm), "€", "col-sep");
    html += td(formatNumber(m0.totalCosts), "€", "");
    html += "</tr>";

    // Folge-Laufzeiten (t=1..4)
    for (let t = 1; t < terms.length; t++) {
      if (!terms[t]) continue; // Laufzeit = 0 überspringen

      const isLast = t === terms.length - 1;
      const mT = calculateRowMetrics(netIncome, blk, terms[t], fixedCosts);
      const rowCls = [
        isLast ? "block-separator" : "",
        mT.overIncome ? "over-income" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const trAttr = rowCls ? ` class="${rowCls}"` : "";

      html += `<tr${trAttr}>`;
      html += td(terms[t] + " Jahre", "", "");
      // Zinssatz & Rate wurden via rowspan bereits gesetzt
      html += td(formatNumber(mT.loanAmt), "€", "");
      html += td(formatNumber(mT.interestAmt), "€", "");
      html += td(
        formatNumber((mT.interestAmt / (mT.loanAmt + mT.interestAmt)) * 100),
        "%",
        "",
      );
      html += td(formatNumber(mT.loanAmt + mT.interestAmt), "€", "col-sep");
      html += td(formatNumber(mT.netPurchase), "€", "col-kaufpreis-netto");
      // Eigenanteil % via rowspan gesetzt
      html += td(formatNumber(mT.equityAbs), "€", "col-sep");
      html += td(formatNumber(mT.grunderwerb), "€", "");
      html += td(formatNumber(mT.grundbuch), "€", "");
      html += td(formatNumber(mT.hypothek), "€", "");
      html += td(formatNumber(mT.makler), "€", "");
      html += td(formatNumber(mT.notar), "€", "");
      html += td(formatNumber(mT.sonstige), "€", "");
      html += td(formatNumber(mT.gesamtNebenkosten), "€", "");
      html += td(formatNumber(mT.nebKostenPct), "%", "col-sep");
      html += td(formatNumber(mT.loanAmt + mT.equityAbs), "€", "col-sep");
      html += td(formatNumber(mT.monthlyOps), "€", "");
      html += td(formatNumber(mT.burdenMonthly), "€", "");
      html += td(formatNumber(mT.burdenPct), "%", "");
      // Fixkosten via rowspan gesetzt
      html += td(formatNumber(mT.totalWithFix), "€", "");
      html += td(formatNumber(mT.accumulatedCosts), "€", "");
      html += td(formatNumber(mT.nebKostenAnteilPct), "%", "col-sep");
      html += td(formatNumber(mT.totalOpsOverTerm), "€", "");
      html += td(formatNumber(mT.totalBurdenOverTerm), "€", "col-sep");
      html += td(formatNumber(mT.totalCosts), "€", "");
      html += "</tr>";
    }

    Logger.info(`Szenario ${index + 1} fertig gerendert.`);
  });

  html += "</tbody></table>";
  Logger.info("calculateResultsFromData() ✓ Tabelle vollständig erstellt");
  return html;
}

/**
 * Fügt die generierte Ergebnistabelle in den results-container ein.
 * @param {object} inputData - Eingabedaten aus sessionStorage
 */
function renderResults(inputData) {
  Logger.info("renderResults() gestartet");
  const container = document.getElementById("results-container");
  if (!container) {
    Logger.error("renderResults(): #results-container nicht gefunden!");
    return;
  }
  try {
    container.innerHTML = calculateResultsFromData(inputData);
    Logger.info("renderResults() ✓ Tabelle wurde eingefügt");
  } catch (err) {
    Logger.error("renderResults() Fehler:", err);
    container.innerText =
      "Fehler beim Berechnen der Ergebnisse. Bitte gehe zurück und überprüfe deine Eingaben.";
  }
}

// ========== Event-Registrierung ==========

document.addEventListener("DOMContentLoaded", function () {
  Logger.info("DOMContentLoaded → functions.js initialisiert");

  // Hilfsfunktion: Slider-Events für einen Block registrieren
  function initBlock(i) {
    const maxRateSlider = document.getElementById(`max-rate${i}`);
    const equitySlider = document.getElementById(`equity-share${i}`);
    const netIncomeInput = document.getElementById(`net-income${i}`);
    const equityValue = document.getElementById(`equity-share${i}-value`);

    if (maxRateSlider && netIncomeInput) {
      Logger.debug(`Block ${i}: Max-Rate-Slider registriert`);

      // Slider-Event
      maxRateSlider.addEventListener("input", function () {
        updateSliderValue(
          `max-rate${i}`,
          `max-rate${i}-value`,
          `max-rate${i}-abs`,
          `net-income${i}`,
        );
      });

      // Nettoeinkommen-Input: Live-Aktualisierung
      netIncomeInput.addEventListener("input", function () {
        updateSliderValue(
          `max-rate${i}`,
          `max-rate${i}-value`,
          `max-rate${i}-abs`,
          `net-income${i}`,
        );
      });

      // Initiale Anzeige
      updateSliderValue(
        `max-rate${i}`,
        `max-rate${i}-value`,
        `max-rate${i}-abs`,
        `net-income${i}`,
      );
    }

    if (equitySlider && equityValue) {
      Logger.debug(`Block ${i}: Eigenkapital-Slider registriert`);
      equitySlider.addEventListener("input", function () {
        equityValue.textContent = this.value;
        updateValues();
      });
    }
  }

  // Alle drei Blöcke initialisieren
  [1, 2, 3].forEach((i) => initBlock(i));

  // Help-Popup System starten
  initHelpSystem();

  // Progressive Szenario-Anzeige starten
  initScenarioToggle();

  Logger.info("functions.js: Alle Event-Listener registriert ✓");
});

// ============================================================
// HELP-POPUP SYSTEM
// ============================================================

/**
 * Hilfetexte für alle Felder.
 * key entspricht dem data-help Attribut des Buttons.
 */
const HELP_TEXTS = {
  "net-income": {
    title: "💶 Nettoeinkommen",
    body:
      "Dein monatliches Nettoeinkommen ist dein Gehalt nach Abzug von Steuern und Sozialabgaben – also das, was tatsächlich auf deinem Konto landet. " +
      "Gibst du mehrere Szenarien ein, kannst du z.B. dein aktuelles, ein optimistisches und ein konservatives Einkommen vergleichen. " +
      'Format: Zahlen mit Punkt als Tausendertrenner, z.B. "3.500,00".',
  },
  "max-rate": {
    title: "📊 Maximale Monatsrate",
    body:
      "Dieser Wert legt fest, wie viel Prozent deines Nettoeinkommens du maximal als monatliche Kreditrate aufwenden möchtest. " +
      "Banken in Österreich finanzieren in der Regel maximal 40 % des Nettoeinkommens – das entspricht dem Maximum dieses Reglers. " +
      "Ein konservativerer Wert (z.B. 30 %) lässt dir mehr finanziellen Spielraum für unvorhergesehene Ausgaben.",
  },
  equity: {
    title: "🏦 Eigenkapital",
    body:
      "Eigenkapital ist der Betrag, den du selbst – ohne Kredit – in den Kauf einbringst. " +
      "Österreichische Banken verlangen üblicherweise mindestens 20 % des Kaufpreises als Eigenkapital. " +
      "Je höher dein Eigenkapitalanteil, desto geringer fällt die Darlehenssumme und damit auch die monatliche Rate aus. " +
      "Der Regler zeigt den Anteil am gesamten Kaufpreis (brutto inkl. Nebenkosten).",
  },
  interest: {
    title: "📈 Zinssatz",
    body:
      "Der nominale Jahreszinssatz deines Kredits in Prozent. " +
      "Dieser Wert hängt von der Bonität, der Laufzeit und der aktuellen Marktlage ab. " +
      "Als Orientierung: Variable Zinsen lagen 2024 bei ca. 3,5–4,5 %, Fixzinsbindungen je nach Laufzeit bei 3–5 %. " +
      "Tipp: Vergleiche verschiedene Zinssätze, indem du mehrere Szenarien mit unterschiedlichen Werten einträgst.",
  },
  "fixed-costs": {
    title: "🧾 Monatliche Fixkosten",
    body:
      "Hier gibst du deine sonstigen monatlichen Fixausgaben ein – zum Beispiel bestehende Kredite, Leasing, Versicherungen oder Unterhaltszahlungen. " +
      "Diese werden bei der Berechnung der Gesamtbelastung berücksichtigt: Übersteigt Rate + Betriebskosten + Fixkosten dein Nettoeinkommen, wird die Zeile rot markiert. " +
      "Lasse das Feld leer oder auf 0, wenn du keine nennenswerten Fixkosten hast.",
  },
};

/**
 * Initialisiert alle Help-Buttons auf der Seite.
 * Delegiert Events über den Container (funktioniert auch für
 * später eingeblendete Szenarien ohne Re-Initialisierung).
 */
function initHelpSystem() {
  Logger.info("initHelpSystem(): Help-Buttons initialisieren");

  const overlay = document.getElementById("help-overlay");
  const titleEl = document.getElementById("help-title");
  const bodyEl = document.getElementById("help-body");
  const closeBtn = document.getElementById("help-close");

  if (!overlay || !titleEl || !bodyEl || !closeBtn) {
    Logger.warn("initHelpSystem(): Help-Elemente nicht gefunden");
    return;
  }

  // Event-Delegation: ein Listener auf dem gesamten body
  document.body.addEventListener("click", function (e) {
    const btn = e.target.closest(".help-btn");
    if (!btn) return;

    const key = btn.dataset.help;
    const data = HELP_TEXTS[key];
    if (!data) {
      Logger.warn(`initHelpSystem(): Kein Hilfetext für key="${key}"`);
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
  closeBtn.addEventListener("click", closeHelp);

  // Schließen über Overlay-Klick (außerhalb des Popups)
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeHelp();
  });

  // Schließen über Escape-Taste
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeHelp();
  });

  Logger.info("initHelpSystem(): Initialisierung abgeschlossen ✓");
}

/** Blendet das Help-Popup aus. */
function closeHelp() {
  const overlay = document.getElementById("help-overlay");
  if (!overlay) return;
  overlay.classList.remove("help-overlay--visible");
  overlay.setAttribute("aria-hidden", "true");
  Logger.debug("Help-Popup geschlossen");
}

// ============================================================
// PROGRESSIVE SZENARIO-ANZEIGE
// ============================================================

/**
 * Initialisiert das Add/Remove-System für Szenarien 2 und 3.
 *
 * Logik:
 *  - Start: Szenario 1 sichtbar, Add-Button-2 sichtbar
 *  - Klick Add-Button-2: Szenario 2 einblenden, Add-Button-2 ausblenden,
 *    Add-Button-3 einblenden
 *  - Klick Add-Button-3: Szenario 3 einblenden, Add-Button-3 ausblenden
 *  - ✕ auf Szenario 3: Szenario 3 ausblenden, Add-Button-3 wieder einblenden
 *  - ✕ auf Szenario 2: Szenario 2+3 ausblenden, Add-Button-2 wieder einblenden,
 *    Add-Button-3 ausblenden
 */
function initScenarioToggle() {
  Logger.info("initScenarioToggle(): Initialisierung");

  const addBtn2 = document.getElementById("add-scenario-2");
  const addBtn3 = document.getElementById("add-scenario-3");
  const card2 = document.getElementById("scenario-card-2");
  const card3 = document.getElementById("scenario-card-3");

  if (!addBtn2 || !addBtn3 || !card2 || !card3) {
    Logger.warn("initScenarioToggle(): Elemente nicht gefunden");
    return;
  }

  // ── Add-Button 2: Szenario 2 einblenden ──
  function activateScenario2() {
    Logger.info("Szenario 2 wird eingeblendet");
    card2.classList.remove("scenario-card--hidden");
    card2.classList.add("scenario-card--visible");
    addBtn2.classList.add("scenario-add-btn--hidden");
    addBtn3.classList.remove("scenario-add-btn--hidden");

    // Slider neu initialisieren (war vorher hidden → Wert ggf. nicht korrekt)
    updateSliderValue(
      "max-rate2",
      "max-rate2-value",
      "max-rate2-abs",
      "net-income2",
    );
    Logger.info("Szenario 2 eingeblendet ✓");
  }

  // ── Remove-Button Szenario 2: Szenarien 2+3 ausblenden ──
  function deactivateScenario2() {
    Logger.info("Szenario 2 (und ggf. 3) wird ausgeblendet");

    // Szenario 3 zuerst zurücksetzen
    deactivateScenario3(true); // silent=true, kein Log-Spam

    card2.classList.remove("scenario-card--visible");
    card2.classList.add("scenario-card--hidden");
    addBtn2.classList.remove("scenario-add-btn--hidden");
    addBtn3.classList.add("scenario-add-btn--hidden");

    // Felder leeren damit alte Werte nicht in Berechnung fließen
    clearScenarioFields(2);
    Logger.info("Szenario 2 ausgeblendet ✓");
  }

  // ── Add-Button 3: Szenario 3 einblenden ──
  function activateScenario3() {
    Logger.info("Szenario 3 wird eingeblendet");
    card3.classList.remove("scenario-card--hidden");
    card3.classList.add("scenario-card--visible");
    addBtn3.classList.add("scenario-add-btn--hidden");

    updateSliderValue(
      "max-rate3",
      "max-rate3-value",
      "max-rate3-abs",
      "net-income3",
    );
    Logger.info("Szenario 3 eingeblendet ✓");
  }

  // ── Remove-Button Szenario 3 ──
  function deactivateScenario3(silent) {
    if (!silent) Logger.info("Szenario 3 wird ausgeblendet");
    card3.classList.remove("scenario-card--visible");
    card3.classList.add("scenario-card--hidden");
    addBtn3.classList.remove("scenario-add-btn--hidden");
    clearScenarioFields(3);
    if (!silent) Logger.info("Szenario 3 ausgeblendet ✓");
  }

  // Event-Listener Add-Buttons
  addBtn2.addEventListener("click", activateScenario2);
  addBtn3.addEventListener("click", activateScenario3);
  addBtn2.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") activateScenario2();
  });
  addBtn3.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") activateScenario3();
  });

  // Event-Delegation für Remove-Buttons (✕)
  document.body.addEventListener("click", function (e) {
    const btn = e.target.closest(".card-remove-btn");
    if (!btn) return;
    const idx = parseInt(btn.dataset.removes);
    Logger.info(`Remove-Button geklickt: Szenario ${idx}`);
    if (idx === 2) deactivateScenario2();
    if (idx === 3) deactivateScenario3(false);
  });

  Logger.info("initScenarioToggle(): Initialisierung abgeschlossen ✓");
}

/**
 * Leert alle Eingabefelder eines Szenarios (damit alte Werte
 * nicht versehentlich in die Berechnung einfließen).
 * @param {number} idx - Szenario-Index (2 oder 3)
 */
function clearScenarioFields(idx) {
  Logger.debug(`clearScenarioFields(${idx}): Felder werden geleert`);
  const ids = [`net-income${idx}`, `interest-rate${idx}`, `fixed-costs${idx}`];
  ids.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  // Slider auf Standardwert zurücksetzen
  const rateSlider = document.getElementById(`max-rate${idx}`);
  const equitySlider = document.getElementById(`equity-share${idx}`);
  if (rateSlider) {
    rateSlider.value = "40";
    updateSliderValue(
      `max-rate${idx}`,
      `max-rate${idx}-value`,
      `max-rate${idx}-abs`,
      `net-income${idx}`,
    );
  }
  if (equitySlider) {
    equitySlider.value = "20";
    document.getElementById(`equity-share${idx}-value`).textContent = "20";
  }
}
