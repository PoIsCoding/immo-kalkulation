# Changelog

## [1.0.0] - 2025-06-01
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

## [1.1.0] - 2025-06-01
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

## [1.2.0] - 2025-06-01
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

## [1.2.1] - 2025-06-01
### Hinzugefügt
- Hinzufügen von Mouseover-Beschreibungen und erklärenden Tooltips zu mehreren Spalten in `index.html` und `ergebnisse.html`, um Berechnungsgrundlagen und Annahmen transparenter darzustellen.
