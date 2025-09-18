# iPadHA v0.1.0 Release

## iPadHA v0.1.0 - Initial Release

**Release Date:** 18.9.2025  
**Build Info:** Node.js v24.3.0 on darwin-x64

## 📦 Assets

### Source Code
- **ipadha-source-v0.1.0.zip** - Vollständiger Quellcode für Entwicklung

### HACS Integration
- **ipadha-hacs-v0.1.0.zip** - HACS-kompatible Version für Home Assistant

### Standalone Installation
- **ipadha-standalone-v0.1.0.zip** - Standalone-Version für manuelle Installation

## 🚀 Installation

### HACS Installation (Empfohlen)

1. **HACS installieren** (falls noch nicht geschehen)
2. **Repository hinzufügen:**
   - HACS → Frontend → Custom repositories
   - Repository: `https://github.com/chr-braun/iPadHA`
   - Kategorie: frontend
3. **Installieren** und Home Assistant neustarten

### Manuelle Installation

```bash
# 1. Standalone ZIP herunterladen und entpacken
unzip ipadha-standalone-v0.1.0.zip

# 2. Dependencies installieren
npm install

# 3. HACS Build erstellen
npm run build:hacs

# 4. Nach Home Assistant kopieren
cp -r dist-hacs/* /config/www/ipadha/

# 5. Konfiguration anpassen
cp config/config.example.js config/ipadha.js
# config/ipadha.js mit deinen Home Assistant Einstellungen anpassen

# 6. Home Assistant neustarten
```

## ✨ Features

- ✅ **iOS 9.3.5 Compatibility**
- ✅ **Glasmorphism Design**
- ✅ **Touch Optimization**
- ✅ **Home Assistant Integration**
- ✅ **HACS Support**
- ✅ **Slider Controls**
- ✅ **Real-time Updates**
- ✅ **Performance Optimized**

## 🔧 Kompatibilität

- **iOS:** 9.3.5+
- **Home Assistant:** 2021.1.0+
- **HACS:** 1.0.0+
- **Node.js:** 14.0.0+

## 📱 iPad Setup

1. **Safari öffnen** auf dem iPad
2. **URL eingeben**: `http://DEINE_HA_IP:8123/local/ipadha/`
3. **Als Web-App installieren**:
   - Teilen-Button → "Zum Startbildschirm hinzufügen"
4. **Vollbildmodus** aktivieren

## ⚙️ Konfiguration

### Home Assistant Setup

```yaml
# configuration.yaml
homeassistant:
  auth_providers:
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
    token: 'YOUR_LONG_LIVED_ACCESS_TOKEN'
  },
  dashboard: {
    title: 'iPadHA Dashboard',
    theme: 'glass',
    autoRefresh: 5000
  }
};
```

## 🔧 Troubleshooting

### Häufige Probleme

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

**Problem**: Home Assistant Verbindung fehlgeschlagen
```yaml
# Lösung: Trusted Networks konfigurieren
homeassistant:
  auth_providers:
    - type: trusted_networks
      trusted_networks:
        - 192.168.1.0/24
      allow_bypass_login: true
```

## 📞 Support

- **GitHub Issues**: [iPadHA Issues](https://github.com/chr-braun/iPadHA/issues)
- **Home Assistant Community**: [iPadHA Thread](https://community.home-assistant.io/t/ipadha-dashboard)
- **Dokumentation**: [docs/](docs/)

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE)

---

**iPadHA v0.1.0** - Moderne Home Assistant Dashboards für klassische iPads! 🎉

**Entwickelt mit ❤️ für die Home Assistant Community**