# GitHub Release Guide - iPadHA v0.1.0

## 🚀 Release erstellen

### Option 1: GitHub CLI (Empfohlen)

1. **GitHub CLI installieren:**
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   
   # Windows
   winget install GitHub.cli
   ```

2. **GitHub CLI authentifizieren:**
   ```bash
   gh auth login
   ```

3. **Release erstellen:**
   ```bash
   cd /Users/christianbraun/ipad_old_interface/iPadHA
   npm run release:github
   ```

4. **Release veröffentlichen:**
   ```bash
   npm run release:publish
   ```

### Option 2: GitHub Web Interface

1. **GitHub Repository öffnen:**
   - Gehe zu: https://github.com/chr-braun/iPadHA

2. **Release erstellen:**
   - Klicke auf "Releases" → "Create a new release"
   - Tag: `v0.1.0`
   - Title: `iPadHA v0.1.0 - Initial Release`
   - Description: Kopiere den Inhalt aus `RELEASE_NOTES.md`

3. **Assets hochladen:**
   - Lade die folgenden Dateien aus `dist-release/` hoch:
     - `ipadha-source-v0.1.0.zip`
     - `ipadha-hacs-v0.1.0.zip`
     - `ipadha-standalone-v0.1.0.zip`

4. **Release veröffentlichen:**
   - Klicke auf "Publish release"

## 📦 Release Assets

### ipadha-source-v0.1.0.zip
- **Größe:** ~105 KB
- **Inhalt:** Vollständiger Quellcode für Entwicklung
- **Zielgruppe:** Entwickler, die iPadHA erweitern möchten

### ipadha-hacs-v0.1.0.zip
- **Größe:** ~58 KB
- **Inhalt:** HACS-kompatible Version für Home Assistant
- **Zielgruppe:** Home Assistant Nutzer mit HACS

### ipadha-standalone-v0.1.0.zip
- **Größe:** ~69 KB
- **Inhalt:** Standalone-Version für manuelle Installation
- **Zielgruppe:** Nutzer ohne HACS oder für Custom-Installation

## 📝 Release Notes

### Titel
```
iPadHA v0.1.0 - Initial Release
```

### Beschreibung
```markdown
## 🎉 Initial Release

**iPadHA v0.1.0** ist die erste offizielle Version eines speziell für ältere iPad-Geräte mit iOS 9.3.5 optimierten Home Assistant Dashboards.

### ✨ New Features

- 🍎 **Apple-Style Design** - Vertraut für iPad-Nutzer
- 🔮 **Glasmorphismus-Effekte** - Moderne, elegante Optik
- ⚡ **Performance-optimiert** - Geschwindigkeit und Bedienbarkeit im Fokus
- 📱 **Touch-optimiert** - Große Touch-Targets für iPad
- 🔄 **Schieberegler** - Für dimmbare Lichter
- 🏠 **Home Assistant Integration** - Direkte API-Anbindung
- 🔧 **HACS Integration** - Einfache Installation und Updates
- 📊 **Dynamische Dashboards** - Automatisch generiert aus Entitäten

### 🚀 Installation

#### HACS Installation (Empfohlen)
1. HACS → Frontend → Custom repositories
2. Repository: `https://github.com/chr-braun/iPadHA`
3. Kategorie: Frontend
4. Installieren und Home Assistant neustarten

#### Manuelle Installation
```bash
cd /config/www/
git clone https://github.com/chr-braun/iPadHA.git ipadha
cd ipadha
npm install
npm run build:hacs
```

### 📱 iPad Setup

1. **Safari öffnen** auf dem iPad
2. **URL eingeben**: `http://DEINE_HA_IP:8123/local/ipadha/`
3. **Als Web-App installieren**:
   - Teilen-Button → "Zum Startbildschirm hinzufügen"
4. **Vollbildmodus** aktivieren

### 🔧 Kompatibilität

- **iOS:** 9.3.5+
- **Home Assistant:** 2021.1.0+
- **HACS:** 1.0.0+
- **Node.js:** 14.0.0+

### 📞 Support

- **GitHub Issues**: [iPadHA Issues](https://github.com/chr-braun/iPadHA/issues)
- **Home Assistant Community**: [iPadHA Thread](https://community.home-assistant.io/t/ipadha-dashboard)
- **Dokumentation**: [docs/](docs/)

---

**iPadHA v0.1.0** - Moderne Home Assistant Dashboards für klassische iPads! 🎉

**Entwickelt mit ❤️ für die Home Assistant Community**
```

## 🔧 Release-Scripts

### Verfügbare Scripts

```bash
# Release Build erstellen
npm run build:release

# GitHub Release erstellen (Draft)
npm run release:github

# GitHub Release veröffentlichen
npm run release:publish

# Release Status prüfen
node scripts/create-github-release.js --status

# Dry Run (nur anzeigen, nicht ausführen)
node scripts/create-github-release.js --dry-run
```

### Release-Verzeichnis

```
dist-release/
├── ipadha-source-v0.1.0.zip      # Source Code
├── ipadha-hacs-v0.1.0.zip        # HACS Version
├── ipadha-standalone-v0.1.0.zip  # Standalone Version
├── release-info.json              # Release Metadaten
└── README-RELEASE.md              # Release README
```

## 📊 Release-Statistiken

### Build-Informationen
- **Node.js Version:** 14.0.0+
- **Build-Zeit:** ~30 Sekunden
- **Gesamtgröße:** ~232 KB
- **Dateien:** 3 ZIP-Archive + Metadaten

### Asset-Details
| Asset | Größe | Inhalt | Zielgruppe |
|-------|-------|--------|------------|
| Source | 105 KB | Vollständiger Code | Entwickler |
| HACS | 58 KB | HACS-kompatibel | HA + HACS |
| Standalone | 69 KB | Manuelle Installation | Alle Nutzer |

## 🚨 Wichtige Hinweise

### Vor dem Release
- [ ] Alle Tests durchgeführt
- [ ] Dokumentation aktualisiert
- [ ] Versionsnummern korrekt
- [ ] Release Notes vollständig
- [ ] Assets getestet

### Nach dem Release
- [ ] Release auf GitHub veröffentlicht
- [ ] HACS Store aktualisiert
- [ ] Community benachrichtigt
- [ ] Dokumentation aktualisiert
- [ ] Issues geschlossen

## 🔄 Rollback

Falls ein Problem mit dem Release auftritt:

1. **Release auf GitHub deaktivieren:**
   - Gehe zu GitHub Releases
   - Klicke auf "Edit release"
   - Deaktiviere "Set as the latest release"

2. **Neue Version erstellen:**
   - Erstelle einen Hotfix (v0.1.1)
   - Behebe das Problem
   - Erstelle neuen Release

3. **Community informieren:**
   - GitHub Issue erstellen
   - Home Assistant Community Thread aktualisieren

---

**iPadHA v0.1.0 Release Guide** - Erfolgreiche Veröffentlichung! 🚀
