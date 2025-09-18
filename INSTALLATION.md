# 📱 iPadHA Installation für Home Assistant

## 🚀 Schnellstart

### **Option 1: Home Assistant OS / Supervised (Empfohlen)**

```bash
# Script herunterladen und ausführen
curl -fsSL https://raw.githubusercontent.com/chr-braun/iPadHA/main/install_homeassistant.sh | bash
```

### **Option 2: Docker Installation**

```bash
# Script herunterladen und ausführen
curl -fsSL https://raw.githubusercontent.com/chr-braun/iPadHA/main/install_docker.sh | bash
```

### **Option 3: Manuelle Installation**

```bash
# 1. iPadHA herunterladen
wget https://github.com/chr-braun/iPadHA/archive/refs/tags/v0.1.0.zip
unzip v0.1.0.zip
cd iPadHA-0.1.0

# 2. Dependencies installieren
npm install --production

# 3. Konfiguration anpassen
cp config/config.example.js config/ipadha.js
nano config/ipadha.js

# 4. Server starten
npm start
```

## ⚙️ Konfiguration

### **1. Home Assistant URL anpassen**

```javascript
// config/ipadha.js
homeAssistant: {
    url: 'http://192.168.178.29:8123',  // Deine Home Assistant IP
    token: 'dein_long_lived_access_token'
}
```

### **2. Entities anpassen**

```javascript
// config/ipadha.js
pages: [
    {
        id: 'home',
        title: 'Home',
        icon: '🏠',
        groups: [
            {
                title: 'Meine Lichter',
                entities: [
                    'light.wohnzimmer',
                    'light.kueche',
                    'light.schlafzimmer'
                ]
            }
        ]
    }
]
```

### **3. Design anpassen**

```javascript
// config/ipadha.js
design: {
    colors: {
        '--accent-blue': 'rgba(0, 122, 255, 0.8)',
        '--accent-green': 'rgba(52, 199, 89, 0.8)',
        // ... weitere Farben
    }
}
```

## 📱 iPad Setup

### **1. Dashboard öffnen**

- Safari auf dem iPad öffnen
- URL eingeben: `http://192.168.178.29:3000`
- Dashboard sollte automatisch laden

### **2. Als Web-App installieren**

- Teilen-Button (Quadrat mit Pfeil nach oben) antippen
- "Zum Startbildschirm hinzufügen" wählen
- Name: "iPadHA"
- "Hinzufügen" antippen

### **3. Touch-Optimierung testen**

- Lichter ein-/ausschalten
- Schieberegler für Helligkeit
- Swipe-Gesten für Navigation
- Pinch-to-Zoom deaktiviert

## 🔧 Service Management

### **Home Assistant OS / Supervised**

```bash
# Service Status
systemctl status ipadha

# Service starten
systemctl start ipadha

# Service stoppen
systemctl stop ipadha

# Logs anzeigen
journalctl -u ipadha -f
```

### **Docker Installation**

```bash
# Container Status
docker ps | grep ipadha

# Logs anzeigen
docker logs ipadha -f

# Container stoppen
docker-compose -f /config/docker-compose.ipadha.yml down

# Container starten
docker-compose -f /config/docker-compose.ipadha.yml up -d
```

## 🐛 Troubleshooting

### **Problem: Dashboard lädt nicht**

**Lösung:**
1. Prüfe ob der Service läuft: `systemctl status ipadha`
2. Prüfe die Logs: `journalctl -u ipadha -f`
3. Prüfe die URL: `http://deine-ip:3000`

### **Problem: Home Assistant Verbindung fehlgeschlagen**

**Lösung:**
1. Prüfe die URL in `config/ipadha.js`
2. Prüfe den Token in `config/ipadha.js`
3. Teste die Verbindung: `curl http://deine-ip:8123/api/`

### **Problem: Touch-Events funktionieren nicht**

**Lösung:**
1. Prüfe ob `touchOptimized: true` in der Konfiguration
2. Teste mit verschiedenen Touch-Gesten
3. Prüfe die Browser-Konsole auf Fehler

### **Problem: Performance ist langsam**

**Lösung:**
1. Reduziere `autoRefresh` in der Konfiguration
2. Aktiviere `forcePolling: true` für iOS 9.3.5
3. Reduziere die Anzahl der Entities

## 📋 Systemanforderungen

### **Home Assistant**
- Version: 2021.1.0 oder höher
- Zugriff: HTTP API aktiviert
- Token: Long-lived Access Token

### **iPad**
- iOS: 9.3.5 oder höher
- Browser: Safari (empfohlen)
- Netzwerk: Zugriff auf Home Assistant

### **Server**
- Node.js: 14.0.0 oder höher
- RAM: 512 MB (empfohlen)
- Speicher: 100 MB

## 🔄 Updates

### **Automatisches Update (HACS)**

```bash
# HACS Update
hacs update chr-braun/iPadHA
```

### **Manuelles Update**

```bash
# Script erneut ausführen
curl -fsSL https://raw.githubusercontent.com/chr-braun/iPadHA/main/install_homeassistant.sh | bash
```

## 📞 Support

- **GitHub Issues:** [chr-braun/iPadHA/issues](https://github.com/chr-braun/iPadHA/issues)
- **Dokumentation:** [README.md](README.md)
- **Release Notes:** [RELEASE_NOTES.md](RELEASE_NOTES.md)

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.
