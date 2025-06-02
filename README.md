

# Potenzieller Immo-Kauf

## Projektbeschreibung
"Potenzieller Immo-Kauf" ist eine Webanwendung, mit der Nutzer auf Basis ihres Nettoeinkommens, gewünschter Kreditrate, Eigenkapitalanteils, Zinssätze und Laufzeiten verschiedene Finanzierungsszenarien für einen Immobilienkauf vergleichen können. Die Anwendung berechnet alle relevanten Faktoren wie Darlehenssumme, Gesamtzinsen, Kaufnebenkosten, Betriebskosten und Gesamtbelastungen.

## Funktionen
- **Eingabemaske (`index.html`):**
  - Nettoeinkommen pro Szenario (3 Felder, jeweils formatiert)
  - Maximale Monatsrate (Slider, 1–40 %)
  - Eigenkapitalanteil (Slider, 20–80 %)
  - Zinssätze (vorausgefüllt: 3 %, 4 %, 5 %)
  - Laufzeiten (vorausgefüllt: 20 , 25 , 30 , 35 , 40 Jahre)
  - Kaufnebenkosten-Sätze (Grunderwerbssteuer, Grundbucheintragung, Hypothekeneintragung, Maklergebühr, Notar-/Rechtsanwaltskosten inkl. 20 % MwSt., sonstige Kosten)
  - Monatliche Fixkosten (frei wählbar)
  - Dynamische Anzeige des Eurobetrags bei Slider-Änderungen
  - Drei Vergleichsszenarien („Szenario 1“, „Szenario 2“, „Szenario 3“) mit jeweils eigenem Nettoeinkommen sowie Rate, Eigenkapital und Zinssatz
  - Button zum Berechnen der Ergebnisse

- **Ergebnisseite (`ergebnisse.html` & `js/umschalten.js`):**
  - Anzeige einer scrollbaren Tabelle mit allen berechneten Werten:
    - Darlehenssumme (Annuitätenformel) und Gesamtzinsen
    - Rückzahlung an Bank
    - Kaufpreis netto (Darlehenssumme – Nebenkosten + Eigenkapital)
    - Eigenkapital (in Euro und Prozent)
    - Aufgeschlüsselung der Kaufnebenkosten (Grunderwerbssteuer, Grundbuch-Eintragung, Kredit-/Hypothekeneintragung, Maklerkosten, Notar-/Rechtsanwaltskosten inkl. MwSt., sonstige Kosten) inklusive Summen und Prozentsätze
    - Kaufkosten Brutto (Darlehenssumme + Eigenkapital)
    - Betriebskosten monatlich (basierend auf vereinfachten Prozentsätzen: Strom, Wasser, Müll, Versicherung, Instandhaltung)
    - Monatliche Gesamtbelastung (Monatsrate + Betriebskosten) und Anteil am Nettoeinkommen (%)
    - Monatliche Gesamtbelastung inkl. Fixkosten
    - Aufgelaufene Nebenkosten und ihr Anteil am Kaufpreis netto (%)
    - Betriebskosten gesamt über die gewählte Laufzeit
    - Gesamtbelastung gesamt über die Laufzeit
    - Totale Gesamtkosten (Gesamtbelastung gesamt + Kaufkosten Brutto)
  - Hervorhebung von Zeilen in Hellrot, wenn die monatliche Gesamtbelastung inkl. Fixkosten das Nettoeinkommen übersteigt
  - Hellgrüne Hervorhebung der Spalte "Kaufpreis netto"
  - Mouseover-Funktion: Anzeigen der Berechnungsformeln als Tooltip bei Hover über die Spaltentitel
  - Ab Version 1.3.0: Berechnungen berücksichtigen nun drei separate Nettoeinkommen pro Szenario-Block.

- **Stylesheet (`styles.css`):**
  - Einheitliches Layout für Eingabemaske und Ergebnis-Tabelle
  - Grid-System für Formulareingaben
  - Responsives Design mit scrollbaren Tabellen

## Installation & Nutzung
1. Repository von GitHub klonen:
   ```bash
   git clone https://github.com/DEIN_NUTZERNAME/potenzieller-immo-kauf.git
   ```
2. In das Projektverzeichnis wechseln:
   ```bash
   cd potenzieller-immo-kauf
   ```
3. Dateien lokal hosten, z.B. mit einem einfachen HTTP-Server:
   - Python 3:
     ```bash
     python3 -m http.server 8000
     ```
   - Oder VS Code Live Server Extension nutzen.
4. Im Browser `http://localhost:8000/index.html` öffnen.
5. Alle Eingabefelder ausfüllen und auf „Berechnen“ klicken, um zur Ergebnis­seite zu gelangen.

## Dateistruktur
```
├── index.html            # Eingabemaske
├── ergebnisse.html       # Ergebnis-Tabelle
├── styles.css            # CSS-Styling für Eingabe und Ergebnisse
├── js
│   ├── berechnungen.js   # Helferfunktionen für finanzmathematische Berechnungen (optional)
│   └── umschalten.js     # Logik zur Generierung der Ergebnis-Tabelle
├── images
│   └── icon.png          # Icon für die Website
├── changelog.md          # Versions-Historie
└── README.md             # Projektbeschreibung (diese Datei)
```

## Lizenz
Dieses Projekt steht unter der MIT-Lizenz. Details sind in der Datei `LICENSE` zu finden.