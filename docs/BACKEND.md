# iPadHA Backend Dokumentation

## Übersicht

Das iPadHA Backend ist ein Express.js-basierter Server, der speziell für iOS 9.3.5 Safari optimiert ist. Es bietet server-seitiges Rendering, Home Assistant API Integration und Performance-Optimierungen für ältere Geräte.

## Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   iPad Safari   │    │  iPadHA Server  │    │ Home Assistant  │
│   (iOS 9.3.5)   │◄──►│   (Express.js)  │◄──►│      API        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Komponenten

1. **Express Server** - Web-Server mit Middleware
2. **Home Assistant API Client** - REST API Integration
3. **WebSocket Fallback** - Polling für iOS 9.3.5
4. **EJS Templates** - Server-seitiges Rendering
5. **Entity Manager** - Automatische Dashboard-Generierung

## Server Setup

### Installation

```bash
# Dependencies installieren
npm install

# Konfiguration anpassen
cp config/ipadha.js.example config/ipadha.js

# Server starten
npm start
```

### Konfiguration

```javascript
// config/ipadha.js
module.exports = {
    homeAssistant: {
        url: 'http://localhost:8123',
        token: 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        pollingInterval: 5000
    },
    dashboard: {
        title: 'iPadHA Dashboard',
        autoRefresh: 5000,
        touchOptimized: true
    }
};
```

## API Endpoints

### Dashboard

- **GET /** - Haupt-Dashboard
- **GET /api/health** - Health Check

### Home Assistant Integration

- **GET /api/entities** - Alle Entitäten
- **GET /api/entity/:id** - Spezifische Entität
- **POST /api/service/:domain/:service** - Service aufrufen

### Beispiel-Requests

```javascript
// Alle Entitäten abrufen
fetch('/api/entities')
    .then(response => response.json())
    .then(data => console.log(data));

// Licht einschalten
fetch('/api/service/light/turn_on', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        entity_id: 'light.wohnzimmer',
        brightness_pct: 75
    })
});
```

## Home Assistant API Client

### Klasse: HomeAssistantAPI

```javascript
const haAPI = new HomeAssistantAPI(baseURL, token);

// Alle Entitäten
const states = await haAPI.getStates();

// Service aufrufen
await haAPI.callService('light', 'turn_on', {
    entity_id: 'light.wohnzimmer',
    brightness_pct: 75
});

// Entitäten nach Typ filtern
const lights = await haAPI.getEntitiesByType('light');

// Dashboard-Entitäten generieren
const dashboard = await haAPI.generateDashboardEntities();
```

### Methoden

| Methode | Beschreibung | Parameter |
|---------|--------------|-----------|
| `getStates()` | Alle Entitäten abrufen | - |
| `callService(domain, service, data)` | Service aufrufen | domain, service, data |
| `getEntitiesByType(type)` | Entitäten nach Typ filtern | type |
| `generateDashboardEntities()` | Dashboard-Entitäten generieren | - |

## WebSocket Fallback

### iOS 9.3.5 Kompatibilität

Da iOS 9.3.5 Safari keine WebSockets unterstützt, verwendet iPadHA ein Polling-System:

```javascript
class WebSocketFallback {
    // WebSocket Verbindung versuchen
    async connectWebSocket() {
        try {
            // WebSocket Verbindung
        } catch (error) {
            // Fallback auf Polling
            this.startPolling();
        }
    }
    
    // Polling starten
    startPolling() {
        setInterval(async () => {
            const states = await this.api.getStates();
            this.broadcastUpdate(states);
        }, this.pollInterval);
    }
}
```

### Polling-Intervall

- **Standard**: 5000ms (5 Sekunden)
- **Konfigurierbar**: Über `config.homeAssistant.pollingInterval`
- **Performance**: Optimiert für iOS 9.3.5

## Entity Management

### Automatische Kategorisierung

```javascript
const dashboard = {
    lights: states.filter(e => e.entity_id.startsWith('light.')),
    switches: states.filter(e => e.entity_id.startsWith('switch.')),
    sensors: states.filter(e => e.entity_id.startsWith('sensor.')),
    media_players: states.filter(e => e.entity_id.startsWith('media_player.')),
    climates: states.filter(e => e.entity_id.startsWith('climate.')),
    covers: states.filter(e => e.entity_id.startsWith('cover.')),
    locks: states.filter(e => e.entity_id.startsWith('lock.')),
    alarms: states.filter(e => e.entity_id.startsWith('alarm_control_panel.'))
};
```

### Entity-Gruppen

| Gruppe | Typen | Icon | Beschreibung |
|--------|-------|------|--------------|
| lights | light | 💡 | Dimmbare und einfache Lichter |
| switches | switch | 🔌 | Schalter und Steckdosen |
| sensors | sensor, binary_sensor | 📊 | Temperatur, Bewegung, etc. |
| media | media_player | 🎵 | Musik, TV, etc. |
| climate | climate | 🌡️ | Heizung, Klimaanlage |
| security | alarm_control_panel, lock | 🔒 | Alarmanlage, Schlösser |

## Performance-Optimierungen

### Server-seitiges Rendering

- **EJS Templates** - HTML wird auf dem Server generiert
- **Entity-Caching** - Entitäten werden zwischengespeichert
- **Minimale JavaScript** - Wenig Client-seitiger Code

### iOS 9.3.5 spezifische Optimierungen

```javascript
// Event Delegation
document.addEventListener('click', function(e) {
    const tile = e.target.closest('.tile');
    if (tile) {
        handleTileClick(tile);
    }
});

// Throttling für Touch-Events
const throttledUpdate = throttle(function(value) {
    updateHomeAssistant(entityId, value);
}, 50);
```

### Memory Management

```javascript
// Event Listener Cleanup
function cleanup() {
    eventListeners.forEach(listener => {
        listener.element.removeEventListener(listener.event, listener.handler);
    });
    eventListeners = [];
}

// Garbage Collection
setInterval(() => {
    if (window.gc) {
        window.gc();
    }
}, 30000);
```

## Error Handling

### Server-Errors

```javascript
// 404 Handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Nicht gefunden',
        message: 'Die angeforderte Seite wurde nicht gefunden'
    });
});

// Error Handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).render('error', {
        title: 'Server Fehler',
        message: 'Ein unerwarteter Fehler ist aufgetreten',
        error: error.message
    });
});
```

### Home Assistant API Errors

```javascript
try {
    const states = await haAPI.getStates();
} catch (error) {
    console.error('Home Assistant API Error:', error.message);
    // Fallback-Verhalten
}
```

## Logging

### Log-Level

- **error** - Nur Fehler
- **warn** - Warnungen und Fehler
- **info** - Informationen, Warnungen und Fehler
- **debug** - Alle Logs

### Log-Ausgabe

```javascript
// Console Logging
console.log('iPadHA Server läuft auf Port', PORT);

// File Logging (optional)
const fs = require('fs');
fs.appendFileSync('logs/ipadha.log', logMessage);
```

## Deployment

### Development

```bash
# Mit Nodemon (Hot Reload)
npm run dev

# Mit Debug-Modus
DEBUG=true npm start
```

### Production

```bash
# Build erstellen
npm run build

# Server starten
NODE_ENV=production npm start
```

### Docker

```dockerfile
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### HACS Integration

```bash
# HACS Build
npm run build:hacs

# HACS Installation
python3 scripts/install-hacs.py
```

## Monitoring

### Health Check

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
    "status": "ok",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
}
```

### Performance-Metriken

- **Response Time** - Server-Antwortzeit
- **Memory Usage** - Speicherverbrauch
- **Entity Count** - Anzahl der Entitäten
- **Error Rate** - Fehlerrate

## Troubleshooting

### Häufige Probleme

**Problem**: Home Assistant Verbindung fehlgeschlagen
```bash
# Lösung: Token und URL prüfen
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8123/api/
```

**Problem**: Dashboard lädt langsam
```javascript
// Lösung: Polling-Intervall erhöhen
pollingInterval: 10000 // 10 Sekunden
```

**Problem**: Memory Leaks
```javascript
// Lösung: Event Listener Cleanup
setInterval(cleanup, 60000); // Alle 60 Sekunden
```

### Debug-Modus

```bash
# Debug-Logging aktivieren
DEBUG=true npm start

# Spezifische Module debuggen
DEBUG=ipadha:api npm start
```

## Sicherheit

### CORS Konfiguration

```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
```

### Security Headers

```javascript
app.use(helmet({
    contentSecurityPolicy: false, // Für iOS 9.3.5
    crossOriginEmbedderPolicy: false
}));
```

### Home Assistant Token

- **Long-lived Access Token** verwenden
- **Token regelmäßig erneuern**
- **Token sicher speichern**

## Erweiterungen

### Custom Middleware

```javascript
// Custom Middleware hinzufügen
app.use('/api', customMiddleware);
```

### Custom Routes

```javascript
// Custom API Route
app.get('/api/custom', (req, res) => {
    res.json({ message: 'Custom endpoint' });
});
```

### Custom Entity Handler

```javascript
// Custom Entity Handler
class CustomEntityHandler {
    handleCustomEntity(entity) {
        // Custom Logic
    }
}
```

---

**iPadHA Backend** - Performance-optimiert für iOS 9.3.5! 🚀
