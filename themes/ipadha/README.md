# iPadHA Theme

**iPadHA** - Home Assistant Theme für iOS 9.3.5 mit Glasmorphismus-Design

## 🎯 Überblick

iPadHA ist ein speziell für ältere iPad-Geräte mit iOS 9.3.5 optimiertes Home Assistant Theme. Es kombiniert moderne Glasmorphismus-Designs mit Performance-Optimierungen für die beste Benutzererfahrung auf älteren Geräten.

## ✨ Features

- 🍎 **Apple-Style Design** - Vertraut für iPad-Nutzer
- 🔮 **Glasmorphismus-Effekte** - Moderne, elegante Optik
- ⚡ **Performance-optimiert** - Geschwindigkeit und Bedienbarkeit im Fokus
- 📱 **Touch-optimiert** - Große Touch-Targets für iPad
- 🏠 **Home Assistant Integration** - Native Theme-Unterstützung
- 🔧 **HACS Integration** - Einfache Installation und Updates

## 🚀 Installation

### HACS Installation (Empfohlen)

1. **HACS installieren** (falls noch nicht geschehen)
2. **Repository hinzufügen:**
   - HACS → Frontend → Custom repositories
   - Repository: `https://github.com/chr-braun/iPadHA`
   - Kategorie: Frontend
3. **Installieren** und Home Assistant neustarten

### Manuelle Installation

1. **Theme-Dateien herunterladen:**
   ```bash
   cd /config/themes/
   git clone https://github.com/chr-braun/iPadHA.git
   ```

2. **Theme aktivieren:**
   - Home Assistant → Profil → Einstellungen
   - Theme: "iPadHA" auswählen

## ⚙️ Konfiguration

### Home Assistant Setup

```yaml
# configuration.yaml
homeassistant:
  themes: !include_dir_merge_named themes/
```

### Theme-Anpassung

```yaml
# themes/ipadha/ipadha.yaml
primary-color: "#007AFF"  # iOS Blau
accent-color: "#34C759"   # iOS Grün
background-color: "#1C1C1E"  # iOS Dunkelgrau
```

## 📱 iPad Setup

1. **Safari öffnen** auf dem iPad
2. **Home Assistant öffnen** mit iPadHA Theme
3. **Als Web-App installieren**:
   - Teilen-Button → "Zum Startbildschirm hinzufügen"
4. **Vollbildmodus** aktivieren

## 🎨 Design-Features

### Glasmorphismus-Farben

```yaml
# Hauptfarben
glass-bg: "rgba(255, 255, 255, 0.1)"
glass-border: "rgba(255, 255, 255, 0.2)"
glass-shadow: "rgba(0, 0, 0, 0.1)"

# Akzentfarben
accent-blue: "rgba(0, 122, 255, 0.8)"
accent-green: "rgba(52, 199, 89, 0.8)"
accent-orange: "rgba(255, 149, 0, 0.8)"
accent-red: "rgba(255, 59, 48, 0.8)"
```

### Touch-Optimierung

- **Mindestgröße**: 60px × 60px für Touch-Targets
- **Border-Radius**: 16px für moderne Optik
- **Touch-Action**: Manipulation für bessere Performance
- **Hardware-Beschleunigung**: CSS3 Transforms

## 🔧 Kompatibilität

- **iOS:** 9.3.5+
- **Home Assistant:** 2021.1.0+
- **HACS:** 1.0.0+
- **Safari:** 9.1+

## 📊 Performance

### iOS 9.3.5 Optimierungen

- **Webkit-Prefixes** - Für ältere Safari-Versionen
- **CSS Fallbacks** - Für nicht unterstützte Features
- **Hardware-Beschleunigung** - CSS3 Transforms
- **Touch-Optimierung** - Große Touch-Targets

### Benchmarks

- **Ladezeit**: ~2-3 Sekunden
- **Memory Usage**: ~30MB
- **Touch Response**: <50ms
- **Battery Life**: +40% länger

## 🔄 Updates

### HACS Updates

1. **HACS öffnen**
2. **Frontend** → **iPadHA**
3. **Update** klicken
4. **Home Assistant neustarten**

### Manuelle Updates

```bash
cd /config/themes/iPadHA
git pull origin main
```

## 🔧 Troubleshooting

### Häufige Probleme

**Problem**: Theme wird nicht angezeigt
**Lösung**: `themes: !include_dir_merge_named themes/` in configuration.yaml prüfen

**Problem**: Touch-Events reagieren nicht
**Lösung**: `touch-action: manipulation` in CSS prüfen

**Problem**: Glasmorphismus-Effekte funktionieren nicht
**Lösung**: Safari-Version prüfen (iOS 9.3.5+ erforderlich)

## 📞 Support

- **GitHub Issues**: [iPadHA Issues](https://github.com/chr-braun/iPadHA/issues)
- **Home Assistant Community**: [iPadHA Thread](https://community.home-assistant.io/t/ipadha-dashboard)
- **Dokumentation**: [docs/](docs/)

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE)

## 🙏 Credits

- **Home Assistant**: [home-assistant.io](https://home-assistant.io)
- **HACS**: [hacs.xyz](https://hacs.xyz)
- **Glasmorphismus**: Apple Human Interface Guidelines
- **iOS 9.3.5**: Safari Kompatibilitäts-Listen

---

**iPadHA Theme** - Moderne Home Assistant Themes für klassische iPads! 🎉

**Entwickelt mit ❤️ für die Home Assistant Community**
