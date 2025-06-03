# Changelog


## [1.3.4] – 2025-06-03

### Hinzugefügt
- Datei `js/formHandler.js` implementiert, um Formular-Daten via `sessionStorage` zu speichern und Weiterleitung zu `ergebnisse.html` zu übernehmen.
- Neuer CSV-Export in `js/save.js`: Button "Als CSV speichern" erstellt nun `ergebnisse.csv` mit Semikolon-Trennung.

### Geändert
- `ergebnisse.html` angepasst, um Eingabedaten aus `sessionStorage` mittels `calculateResultsFromData` zu verarbeiten (statt `calculateResultsFromParams`).
- `js/functions.js`:
  - Funktion `renderResults` erhält `inputData`-Parameter und nutzt `calculateResultsFromData`.
  - Neue Funktion `calculateResultsFromData(data)` hinzugefügt, die Berechnungen basierend auf Daten aus `sessionStorage` ausführt.
  - `updateSliderValue` nutzt `toLocaleString('de-DE')` für Tausender-Trennzeichen im Euro-Betrag.
  - Registrierung von Slider- und Nettoeinkommen-Input-Event-Listenern erfolgt unabhängig vom "Berechnen"-Button.
- PDF-Generierung entfernt: CSV-Export ersetzt vorherige PDF-Funktionalität.

## [1.3.3] – 2025-06-03

### Geändert
- CSV-Export-Funktion in `js/save.js` deaktiviert und Button "Als CSV speichern" in `ergebnisse.html` ausgeblendet, da die Funktion derzeit nicht nutzbar ist.

## [1.3.1] – 2025-06-03

- JavaScript-Struktur überarbeitet: Inhalte aus `umschalten.js` wurden entfernt und sinnvoll in `functions.js` und `berechnungen.js` aufgeteilt. `umschalten.js` existiert nicht mehr.

### Geändert
- **Monatl. Fixkosten** in der Ergebnis-Tabelle pro Block-Gruppe in die erste Zeile verschoben und dort mit `rowspan="5"` zusammengefasst. Alle nachfolgenden Zeilen enthalten nun keine eigene Fixkosten-Zelle mehr.
- Fehlende oder falsch platzierte `<td>`-Zellen für „Monatl. Fixkosten“ in den inneren Schleifen entfernt, sodass sich die Spalten ab „Gesamtbelastung inkl. Fixkosten“ nicht mehr verschieben.
- Korrigiertes `style="width: 180px;"` im `<th>`-Tag von **„Gesamtbelastung inkl. Fixkosten (monatl.)“** (vorher hatten falsche Anführungszeichen das Width-Attribut blockiert).
- CSS-Klasse `.wrap` eingeführt und dem betreffenden `<th>` zugewiesen, um gezielt Zeilenumbrüche im Spaltentitel „Gesamtbelastung inkl. Fixkosten“ zu erlauben (statt die globale `white-space: nowrap`-Regel zu überschreiben).
- Textzentrierung für Tabellenüberschriften (`th`) ergänzt:
  ```css
  #results-container table th { text-align: center; }
  ```
- „Zurück“-Button in `ergebnisse.html` in einen `.container`-Wrapper gelegt, um den weißen Bereich nicht mehr über die gesamte Breite anzuzeigen, sondern auf die Seitenbreite der Index-Seite zu begrenzen.
- Diverse Formel- und Berechnungskorrekturen zur Sicherstellung einheitlicher Berechnungsgrundlagen (z. B. Bezug aller Nebenkosten auf Kaufpreis netto).

### Behoben
- Syntaxfehler im Header-HTML (fehlende Anführungszeichen bei `style="width: 180px"`).
- Doppeltes Anzeigen der Fixkosten-Zelle in inneren Zeilen entfernt, was zu einer verschobenen Tabellendarstellung führte.

## [1.3.0] – 2025-06-02

### Geändert
- Nettoeinkommen-Felder pro Block eingefügt: `netIncome1`, `netIncome2`, `netIncome3` in `index.html`.
- Anpassung von `submitForm()` in `index.html`, um drei separate Nettoeinkommen zu übergeben.
- Änderungen in `ergebnisse.html`/`umschalten.js`, sodass pro Szenario-Block das jeweilige Nettoeinkommen verwendet wird.
- Umebennung der Block-Bereiche in passendere Namen.

## [1.2.1] – 2025-06-01

### Hinzugefügt
- Hinzufügen von Mouseover-Beschreibungen und erklärenden Tooltips zu mehreren Spalten in `index.html` und `ergebnisse.html`, um Berechnungsgrundlagen und Annahmen transparenter darzustellen.

## [1.2.0] – 2025-06-01

### Geändert
- Neu strukturierte und aufgeräumte `index.html`:
  - Konsolidierte Inline-JavaScript-Funktionen in gemeinsame Hilfsfunktionen
  - Alle Skripte in einen einzigen `<script>`-Block verschoben
  - Einheitliche Einrückung und klare Abschnittstrennung
- Neu strukturierte und aufgeräumte `ergebnisse.html`:
  - Zusammengefasste CSS-Styles in `<style>`-Block für Tabellenlayout
  - JavaScript-Logik (Berechnungs- und Rendering-Funktionen) in einen `<script>`-Block am Ende verschoben
  - Klare Kommentare und konsistente Einrückung
  - Rowspan für Zinssatz und Rate nur in der ersten Zeile pro Block beibehalten, Struktur wiederhergestellt
- Neu strukturierte und kommentierte `styles.css`:
  - CSS-Regeln nach Abschnitten (Basis, Layout, Form, Buttons, Fehler, Ergebnistabelle) gruppiert
  - Überflüssige Selektoren zusammengeführt und Kommentare hinzugefügt

## [1.1.0] – 2025-06-01

### Hinzugefügt
- Footer in `index.html` mit Autor (Poramet Bahnschulte), Hinweis zur ±10% Abweichung und Link zu Buy Me a Coffee
- Zentrierung der „Berechnen“- und „Zurück“-Buttons in `index.html`
- Dynamische Hintergrundfärbung ganzer Zeilen in `umschalten.js` (hellrot), wenn die monatliche Gesamtbelastung inkl. Fixkosten das Nettoeinkommen übersteigt
- Hervorhebung der Spalte „Kaufpreis netto“ in `ergebnisse.html` (hellgrüner Hintergrund)
- Erweiterung der Tabelle in `ergebnisse.html` um folgende Spalten (Spaltenbeschriftungen und Berechnungen in `umschalten.js`):
  - Aufgelaufene Nebenkosten (Gesamtzinsen + Gesamte Kaufnebenkosten)
  - Nebenkosten-Anteil (%) (bezogen auf Kaufpreis netto)
  - Betriebskosten gesamt über die Laufzeit (monatliche Betriebskosten × Laufzeit in Monaten)
  - Gesamtbelastung gesamt über die Laufzeit (monatliche Gesamtbelastung × Laufzeit in Monaten)
  - Totale Gesamtkosten (Gesamtbelastung gesamt + Kaufkosten Brutto)

### Geändert
- In `index.html` und `umschalten.js` werden monatliche Fixkosten korrekt als Parameter übergeben und bei der Berechnung berücksichtigt
- Formel für Notar-/Rechtsanwaltskosten auf 1,5% × 1,20 (20% MwSt.) korrigiert
- Nebenkosten-Anteil (%) nun bezogen auf Kaufpreis netto statt Kaufkosten Brutto
- Diverse CSS-Anpassungen: Zentrierung, Grid-Layout-Optimierung, Spaltenhintergrundfarben

## [1.0.0] – 2025-06-01

### Hinzugefügt
- Erstes Release mit vollständigem Berechnungstool für Immobilienkauf
- Eingabemaske in `index.html` für Nettoeinkommen, Max.-Rate (Slider), Eigenkapitalanteil (Slider), Zinssatz, Laufzeiten, Kaufnebenkosten und monatliche Fixkosten
- Dynamische Anzeige der absoluten Beträge bei Änderung der Sliderwerte
- Berechnung von:
  - Darlehenssumme (Annuitätenformel) und zugehörige Gesamtzinsen
  - Kaufnebenkosten (Grunderwerbssteuer, Grundbucheintragung, Kredit-/Hypothekeneintragung, Maklerkosten, Notar-/Rechtsanwaltskosten inkl. MwSt., Sonstige Kosten) sowie Summe der Kaufnebenkosten
  - Kaufpreis netto
  - Anteil der Kaufnebenkosten am Kaufpreis netto (%)
  - Gesamtkosten Brutto (Darlehenssumme + Eigenkapital)
  - Betriebskosten (monatlich) basierend auf angenommenen Prozentwerten (Strom, Wasser, Müll, Versicherung, Instandhaltung)
  - Monatliche Gesamtbelastung (Monatsrate + Betriebskosten) und Anteil am Nettoeinkommen (%)
  - Monatliche Gesamtbelastung inkl. Fixkosten
  - Aufgelaufene Nebenkosten (Gesamtzinsen + Kaufnebenkosten) und Anteil an Kaufpreis netto (%)
  - Betriebskosten gesamt über die gewählte Laufzeit
  - Gesamtbelastung gesamt über die Laufzeit
  - Totale Gesamtkosten (Gesamtbelastung gesamt + Kaufkosten Brutto)
- Ergebnisseite `ergebnisse.html` mit scrollbarer Tabelle und Tooltip-Informationen per Mouseover
- Nutzung von `umschalten.js` für die dynamische Generierung der Ergebnisse