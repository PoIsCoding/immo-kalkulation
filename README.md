# Immo-Rechner | Potenzieller Immobilienkauf

## Projektbeschreibung
„Immo-Rechner" ist eine Webanwendung für Österreich, mit der Nutzer zwei Berechnungsrichtungen durchführen können:

- **Vorwärts-Rechner:** Auf Basis des Nettoeinkommens wird der maximale Kaufpreis berechnet.
- **Rückwärts-Rechner:** Auf Basis eines Wunschkaufpreises wird das benötigte Nettoeinkommen ermittelt.

Beide Modi unterstützen bis zu 3 Szenarien und bis zu 5 Laufzeiten gleichzeitig. Alle österreichischen Kaufnebenkosten (Grunderwerbssteuer, Grundbuch, Hypothek, Makler, Notar, Sonstiges) werden automatisch eingerechnet.

---

## Funktionen

### Startseite (`index.html`)
- Mode-Auswahl: Vorwärts- oder Rückwärts-Rechner wählen
- Weiterleitung auf die jeweilige Eingabeseite

### Vorwärts-Rechner (`index.html`)
- Nettoeinkommen pro Szenario (3 Felder, deutsches Zahlenformat)
- Maximale Monatsrate (Slider, 1–40 % des Nettoeinkommens)
- Eigenkapitalanteil (Slider, 0–80 %)
- Zinssatz frei wählbar (%)
- Monatliche Fixkosten frei wählbar (€)
- 5 Laufzeiten frei eingebbar (Standard: 20 / 25 / 30 / 35 / 40 Jahre)
- Dynamische Eurobetrag-Anzeige bei Slider-Änderungen
- Button „Berechnen" → Weiterleitung auf `ergebnisse.html`

### Vorwärts-Ergebnisse (`ergebnisse.html`)
- Scrollbare Tabelle: eine Zeile pro Szenario × Laufzeit-Kombination
- Berechnete Werte je Zeile: Darlehenssumme, Kaufpreis netto/brutto, Eigenkapital, alle Kaufnebenkosten aufgeschlüsselt, Gesamtzinsen, Monatsrate, Betriebskosten, Gesamtbelastung monatlich und über die Laufzeit, Totale Gesamtkosten
- Grüne Hervorhebung: Spalte „Kaufpreis netto" (Zielkaufpreis)
- Rote Zeilenmarkierung: wenn Gesamtbelastung das Nettoeinkommen übersteigt
- Grüne Trennlinie zwischen Szenarien
- Tooltip-Infos bei Hover über Spaltentitel
- PDF-Export vorbereitet (aktuell `hidden`, kann aktiviert werden)

### Rückwärts-Rechner (`reverse.html`)
- Kaufpreis netto pro Szenario (3 Felder, deutsches Zahlenformat)
- Eigenanteil (Slider, 0–80 % – zeigt absoluten € Betrag live an)
- Zinssatz frei wählbar (%)
- Rate-Anteil des Nettoeinkommens (Slider, 10–40 %)
- 5 Laufzeiten frei eingebbar (Standard: 20 / 25 / 30 / 35 / 40 Jahre)
- Button „Berechnen" → Weiterleitung auf `reverse-ergebnisse.html`

### Rückwärts-Ergebnisse (`reverse-ergebnisse.html`)
- Scrollbare Tabelle: eine Zeile pro Szenario × Laufzeit-Kombination (max. 15 Zeilen)
- Verbundene Zellen (`rowspan`) für alle szenarioidenten Werte: Kaufpreis, Nebenkosten, Eigenkapital, Darlehenssumme, Zinssatz, Rate-Anteil, Betriebskosten mtl.
- Gelbe Hervorhebung: Spalte „→ Monatliche Rate"
- Blaue Hervorhebung: Spalte „→ Benötigtes Nettoeinkommen"
- Grüne Hervorhebung: Spalte „Kaufpreis netto"
- Grüne Trennlinie zwischen Szenarien
- Aufklappbare Spalten-Erklärung (Glossar)
- PDF-Export vorbereitet (aktuell `hidden`, kann aktiviert werden)

---

## Berechnungsgrundlagen (Österreich)

| Kostenpunkt               | Ansatz                        |
|---------------------------|-------------------------------|
| Grunderwerbssteuer        | 3,5 % des Kaufpreises netto   |
| Grundbucheintragung       | 1,1 % des Kaufpreises netto   |
| Hypothekeneintragung      | 1,2 % des Kaufpreises netto   |
| Maklerkosten              | 3,6 % inkl. MwSt.             |
| Notar / Rechtsanwalt      | 1,5 % × 1,20 inkl. MwSt.     |
| Sonstige Kosten           | 1,0 % des Kaufpreises netto   |
| Betriebskosten            | 2,3 % p.a. ÷ 12 Monate       |

Kreditrate: Annuitätenformel `R = D × i / (1 - (1+i)^(-n))`  
Alle Angaben sind Richtwerte mit ± 10 % Varianz ohne Gewähr.

---

## Dateistruktur

```
├── index.html                 # Startseite + Vorwärts-Rechner (Eingabe)
├── ergebnisse.html            # Vorwärts-Rechner (Ergebnisse)
├── reverse.html               # Rückwärts-Rechner (Eingabe)
├── reverse-ergebnisse.html    # Rückwärts-Rechner (Ergebnisse)
├── styles.css                 # Gemeinsames CSS für alle Seiten
├── js/
│   ├── berechnungen.js        # Logger, formatNumber(), calcLoan(), Nebenkostenberechnung
│   ├── formHandler.js         # Formular-Submit & sessionStorage (Vorwärts)
│   ├── functions.js           # Slider-Events, renderResults() (Vorwärts)
│   ├── reverseHandler.js      # Formular-Submit & sessionStorage (Rückwärts)
│   ├── reverseBerechnung.js   # calcReverseMetrics(), renderReverseResults() (Rückwärts)
│   └── pdfExport.js           # PDF-Export via html2pdf.js (vorbereitet)
├── images/
│   └── icon.png               # Favicon und Header-Logo
└── README.md                  # Projektbeschreibung (diese Datei)
```

> `js/save.js` ist ein veraltetes Relikt und kann gelöscht werden.

---

## Technologie

- Reines HTML / CSS / Vanilla JavaScript – keine Frameworks, kein Build-Tool
- Google Fonts: Sora + DM Mono
- PDF-Export: [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) via CDN (vorbereitet)
- Datenweitergabe zwischen Seiten: `sessionStorage`
- Logger: globaler `Logger`-Wrapper (info / debug / warn / error) in `berechnungen.js`

---

## Version

Aktuelle Version: **v2.3.0**  
Changelog: siehe `changelog.md`

---

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Details sind in der Datei `LICENSE` zu finden.