# Weather App

Wetter-Forecast für Europa (und weltweit), basierend auf Open-Meteo (kostenlos, kein API-Key nötig).

## Struktur

- `src/App.jsx` – Container für gespeicherte Orte und Hinweistexte
- `src/components/` – Presentational-Komponenten für Suche, Listen und Forecast-Ansicht
- `src/services/` – API- und localStorage-Zugriffe
- `src/hooks/` – wiederverwendbare UI-Logik wie Debouncing
- `src/utils/` – reine Formatierungsfunktionen
- `style.css` – globales Styling
- `server.js` – Express-Server für den gebauten React-Output

## Lokal starten

### Entwicklung

```bash
npm install
npm run dev
```

Dann im Browser: http://localhost:5173

### Produktions-Server

```bash
npm start
```

Dann im Browser: http://localhost:3000

## Funktionsweise

1. Suche → ruft Open-Meteo Geocoding API auf (`/v1/search`), zeigt Treffer als Dropdown.
2. Klick auf Treffer → fügt Ort zur Liste hinzu (max. 10), speichert in `localStorage`.
3. Pro Ort wird die Forecast API (`/v1/forecast`) mit 10 Tagen Tagesdaten abgerufen:
   Wettercode, Min/Max-Temp, Regenmenge, max. Windgeschwindigkeit.
4. Beim Neuladen der Seite werden gespeicherte Orte automatisch aus `localStorage` geladen.

## Architektur

- Single Responsibility: Suche, Locations-Liste und Forecast-Tabelle sind getrennte Komponenten.
- State Colocation: Suchzustand lebt in der Suchkomponente, Forecast-Zustand pro Karte direkt in der Kartenkomponente.
- Unidirectional Data Flow: `App` besitzt die gespeicherten Orte und gibt Callbacks nach unten weiter.
- Separation of Concerns: API- und Storage-Zugriffe liegen in `src/services`, UI in `src/components`.
- Immutability: Listen werden nur über neue Arrays aktualisiert.
- Stable Keys: Orte und Forecast-Zellen verwenden stabile, datenbasierte Keys.

## Deployment

Pull-basiert, damit kein GitHub-Job auf dem Server läuft:

1. Jeder Push auf `main` baut nach Lint und Tests ein fertiges Bundle (`dist/`, Server, Produktions-Dependencies) und veröffentlicht es als Release `production`.
2. Auf dem Server prüft ein systemd-Timer alle 5 Minuten mit `deploy/update.sh`, ob es ein neues Bundle gibt.
3. Das Skript prüft die Checksumme, entpackt in ein eigenes Release-Verzeichnis, startet die App per pm2 neu und rollt zurück, falls der Health-Check fehlschlägt.

Units: `deploy/systemd/`. Secrets liegen nur auf dem Server in `~/weather-compare/shared/.env`.

## Nächste Schritte / Ideen

- Stündliche Auflösung statt nur Tageswerte (wie im Screenshot-Vorbild) → `hourly` Parameter nutzen.
- Drag & Drop zum Sortieren der Locations.
- Caching im Backend (z.B. Redis), falls viele Nutzer gleichzeitig zugreifen.
- Deployment: Vercel/Netlify (statisch) oder Render/Railway (mit Node-Server).
