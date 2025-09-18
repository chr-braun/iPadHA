# iPadHA HACS Integration Dokumentation

## Übersicht

Die HACS Integration ermöglicht es, iPadHA direkt über den Home Assistant Community Store zu installieren und zu verwalten. Dies vereinfacht die Installation, Updates und Konfiguration erheblich.

## HACS-Architektur

```
HACS Store
├── Repository: chr-braun/iPadHA
├── Kategorie: Frontend
├── Installation: /config/www/ipadha/
└── Konfiguration: /config/www/ipadha/config/
```

## HACS-Dateien

### hacs.json

```json
{
  "name": "iPadHA",
  "content_in_root": false,
  "filename": "ipadha",
  "render_readme": true,
  "domains": ["frontend"],
  "homeassistant": "2021.1.0",
  "iot_class": "Local Push",
  "requirements": [],
  "dependencies": [],
  "codeowners": ["@christianbraun"],
  "version": "1.0.0",
  "description": "iPadHA - Home Assistant Dashboard für iOS 9.3.5",
  "category": "frontend",
  "tags": [
    "ipad",
    "ios9",
    "dashboard",
    "glasmorphism",
    "touch-optimized",
    "home-assistant"
  ]
}
```

### info.md

Die `info.md` Datei wird von HACS verwendet, um das Dashboard im Store anzuzeigen. Sie enthält:

- **Beschreibung** - Was ist iPadHA
- **Features** - Hauptfunktionen
- **Installation** - Setup-Anleitung
- **Konfiguration** - Einstellungen
- **Troubleshooting** - Häufige Probleme

## Installation

### Über HACS Store

1. **HACS installieren** (falls noch nicht geschehen)
2. **Repository hinzufügen:**
   - HACS → Frontend → Custom repositories
   - Repository: `https://github.com/chr-braun/iPadHA`
   - Kategorie: Frontend
3. **Installieren:**
   - "iPadHA" suchen und installieren
4. **Home Assistant neustarten**

### Automatische Installation

```bash
# 1. Repository klonen
git clone https://github.com/chr-braun/iPadHA.git
cd iPadHA

# 2. HACS Build erstellen
npm install
npm run build:hacs

# 3. Automatische Installation
python3 scripts/install-hacs.py
```

## Build-Prozess

### HACS Build Script

```javascript
// scripts/build-hacs.js
function buildHACS() {
    // 1. CSS kompilieren
    buildCSS();
    
    // 2. JavaScript kompilieren
    buildJavaScript();
    
    // 3. Templates kopieren
    copyTemplates();
    
    // 4. Statische Dateien kopieren
    copyStaticFiles();
    
    // 5. HACS-spezifische Dateien erstellen
    createHACSFiles();
    
    // 6. Server-Dateien erstellen
    createServerFiles();
    
    // 7. Konfigurationsdateien erstellen
    createConfigFiles();
    
    // 8. Dokumentation kopieren
    copyDocumentation();
}
```

### Build-Ausgabe

```
dist-hacs/
├── css/                    # Kompilierte CSS-Dateien
├── js/                     # Kompilierte JavaScript-Dateien
├── templates/              # EJS Templates
├── static/                 # Statische Dateien (Icons, Images)
├── config/                 # Konfigurationsdateien
├── docs/                   # Dokumentation
├── hacs.json              # HACS Manifest
├── info.md                # HACS Store Info
├── README.md              # Projekt-Dokumentation
├── server.js              # Express Server
└── package.json           # Node.js Dependencies
```

## Konfiguration

### Home Assistant Setup

```yaml
# configuration.yaml
homeassistant:
  auth_providers:
    - type: homeassistant
    - type: trusted_networks
      trusted_networks:
        - 192.168.1.0/24
      allow_bypass_login: true

api:
  use_ssl: false
```

### iPadHA Konfiguration

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
    theme: 'glass',
    autoRefresh: 5000,
    touchOptimized: true
  },
  ios9: {
    js: {
      es5Compatible: true,
      useEventDelegation: true,
      touchThrottle: 50,
      memoryManagement: true,
      gcInterval: 30000
    },
    css: {
      hardwareAcceleration: true,
      webkitPrefixes: true,
      fallbacks: true
    },
    touch: {
      touchAction: 'manipulation',
      preventZoom: true,
      hapticFeedback: true
    }
  }
};
```

## Server-Integration

### Express Server

```javascript
// server.js für HACS
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());

// Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Routes
app.get('/', async (req, res) => {
    const entities = await haAPI.generateDashboardEntities();
    res.render('dashboard', {
        title: config.dashboard.title,
        theme: 'glass',
        entities: entities,
        config: config
    });
});

app.listen(PORT, () => {
    console.log(`iPadHA Server läuft auf Port ${PORT}`);
});
```

### Home Assistant API Integration

```javascript
class HomeAssistantAPI {
    constructor(baseURL, token) {
        this.baseURL = baseURL;
        this.token = token;
        this.headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async callAPI(endpoint, method = 'GET', data = null) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: method,
            headers: this.headers,
            body: data ? JSON.stringify(data) : undefined
        });
        return await response.json();
    }

    async getStates() {
        return await this.callAPI('/api/states');
    }

    async callService(domain, service, data = {}) {
        return await this.callAPI(`/api/services/${domain}/${service}`, 'POST', data);
    }
}
```

## Updates

### HACS Update-Prozess

1. **HACS öffnen**
2. **Frontend** → **iPadHA**
3. **Update** klicken
4. **Home Assistant neustarten**

### Automatische Updates

```yaml
# automation.yaml
- alias: ipadha_auto_update
  trigger:
    platform: time
    at: "02:00:00"
  action:
    - service: hacs.update
      data:
        repository: "chr-braun/iPadHA"
```

### Update-Benachrichtigungen

```yaml
# automation.yaml
- alias: ipadha_update_notification
  trigger:
    platform: event
    event_type: hacs/repository
    event_data:
      action: "update"
      repository: "christianbraun/iPadHA"
  action:
    - service: notify.mobile_app_iphone
      data:
        title: "iPadHA Update verfügbar"
        message: "Ein neues Update für iPadHA ist verfügbar"
```

## Troubleshooting

### Häufige Probleme

**Problem**: HACS Installation fehlgeschlagen
```bash
# Lösung: Manuelle Installation
cd /config/www/
git clone https://github.com/chr-braun/iPadHA.git ipadha
cd ipadha
npm install
npm run build:hacs
```

**Problem**: Authentifizierung funktioniert nicht
```yaml
# Lösung: Trusted Networks konfigurieren
homeassistant:
  auth_providers:
    - type: trusted_networks
      trusted_networks:
        - 192.168.1.0/24
      allow_bypass_login: true
```

**Problem**: Dashboard lädt nicht
```bash
# Lösung: Logs prüfen
tail -f /config/home-assistant.log | grep ipadha
```

**Problem**: Touch-Events reagieren nicht
```css
/* Lösung: Touch-Action setzen */
.tile {
    touch-action: manipulation;
    -webkit-touch-callout: none;
}
```

### Debug-Modus

```javascript
// In config/ipadha.js:
dashboard: {
    debug: true,
    autoRefresh: 1000
}
```

### Logs prüfen

```bash
# Home Assistant Logs
tail -f /config/home-assistant.log

# HACS Logs
tail -f /config/.storage/hacs.log

# iPadHA Logs
tail -f /config/www/ipadha/logs/ipadha.log
```

## Performance-Optimierung

### HACS-spezifische Optimierungen

```javascript
// config/ipadha.js
module.exports = {
    dashboard: {
        autoRefresh: 10000,  // 10 Sekunden
        touchOptimized: true,
        minTouchSize: 60
    },
    ios9: {
        js: {
            memoryManagement: true,
            gcInterval: 30000
        }
    }
};
```

### Memory Management

```javascript
// Automatische Garbage Collection
setInterval(function() {
    if (window.gc) {
        window.gc();
    }
}, 30000);
```

### Event Delegation

```javascript
// Statt viele Event Listener
document.addEventListener('click', function(e) {
    var tile = e.target.closest('.tile');
    if (tile) {
        handleTileClick(tile);
    }
});
```

## Sicherheit

### HACS-spezifische Sicherheit

```yaml
# configuration.yaml
homeassistant:
  auth_providers:
    - type: homeassistant
    - type: trusted_networks
      trusted_networks:
        - 192.168.1.0/24
      allow_bypass_login: true
      trusted_users:
        192.168.1.100: [USER_ID]
```

### API-Sicherheit

```javascript
// Token-Validierung
function validateToken(token) {
    if (!token || token === 'YOUR_LONG_LIVED_ACCESS_TOKEN') {
        throw new Error('Invalid token');
    }
    return true;
}
```

## Erweiterungen

### Custom HACS-Integration

```javascript
// Custom HACS Handler
class CustomHACSHandler {
    constructor() {
        this.hacs = window.hacs;
    }
    
    install() {
        // Custom Installation Logic
    }
    
    update() {
        // Custom Update Logic
    }
    
    uninstall() {
        // Custom Uninstall Logic
    }
}
```

### HACS-Event-Integration

```yaml
# automation.yaml
- alias: ipadha_hacs_event
  trigger:
    platform: event
    event_type: hacs/repository
    event_data:
      action: "install"
      repository: "christianbraun/iPadHA"
  action:
    - service: ipadha.reload_config
```

## Monitoring

### HACS-Status überwachen

```yaml
# sensor.yaml
- platform: template
  sensors:
    ipadha_hacs_status:
      friendly_name: "iPadHA HACS Status"
      value_template: >
        {% if states('sensor.hacs') == 'ok' %}
          Installed
        {% else %}
          Not Installed
        {% endif %}
```

### Performance-Monitoring

```javascript
// Performance-Metriken sammeln
function collectMetrics() {
    return {
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        touchResponse: Date.now() - lastTouchTime
    };
}
```

## Best Practices

### 1. HACS-Integration

- **Repository** regelmäßig aktualisieren
- **Versionierung** semantisch verwenden
- **Dokumentation** aktuell halten
- **Tests** vor Release durchführen

### 2. Konfiguration

- **Sensible Daten** in Umgebungsvariablen
- **Backup** der Konfiguration
- **Validierung** der Einstellungen
- **Fallbacks** für kritische Werte

### 3. Performance

- **Lazy Loading** für große Datensätze
- **Caching** für häufige Anfragen
- **Debouncing** für Touch-Events
- **Memory Management** für iOS 9.3.5

### 4. Sicherheit

- **Token-Rotation** regelmäßig
- **HTTPS** in Produktion
- **Input-Validierung** für alle Eingaben
- **Error-Handling** für alle API-Calls

---

**iPadHA HACS Integration** - Einfache Installation und Verwaltung! 🔧
