#!/bin/bash

# iPadHA Terminal Plugin Installation Script
# Einfach und schnell für Home Assistant Terminal Plugin

set -e

echo "🚀 iPadHA Terminal Plugin Installation"
echo "======================================"
echo ""

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Konfiguration
INSTALL_DIR="/config/ipadha"
CONFIG_DIR="/config/ipadha/config"

echo -e "${BLUE}ℹ️  Erstelle Verzeichnisse...${NC}"
mkdir -p "$INSTALL_DIR"
mkdir -p "$CONFIG_DIR"

echo -e "${BLUE}ℹ️  Lade iPadHA herunter...${NC}"
cd /tmp
wget -q "https://github.com/chr-braun/iPadHA/archive/refs/tags/v0.1.0.zip" -O "ipadha.zip"
unzip -q "ipadha.zip"
cp -r "iPadHA-0.1.0"/* "$INSTALL_DIR/"
rm -rf "ipadha.zip" "iPadHA-0.1.0"

echo -e "${BLUE}ℹ️  Installiere Dependencies...${NC}"
cd "$INSTALL_DIR"
npm install --production

echo -e "${BLUE}ℹ️  Erstelle Konfiguration...${NC}"
cat > "$CONFIG_DIR/ipadha.js" << 'EOF'
/**
 * iPadHA Terminal Plugin Konfiguration
 */

module.exports = {
    homeAssistant: {
        url: 'http://localhost:8123',
        token: process.env.HA_TOKEN || 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        pollingInterval: 5000,
        useWebSocket: true,
        reconnectInterval: 10000
    },
    
    dashboard: {
        title: 'iPadHA Dashboard',
        locale: 'de-DE',
        theme: 'glassmorphism',
        defaultPage: 'home',
        autoRefresh: 5000,
        touchOptimized: true,
        
        pages: [
            {
                id: 'home',
                title: 'Home',
                icon: '🏠',
                groups: [
                    {
                        title: 'Wichtige Geräte',
                        entities: ['light.wohnzimmer', 'switch.steckdose_1', 'sensor.temperatur_wohnzimmer']
                    }
                ]
            },
            {
                id: 'lights',
                title: 'Lichter',
                icon: '💡',
                groups: [
                    {
                        title: 'Alle Lichter',
                        entities: ['light.wohnzimmer', 'light.kueche', 'light.schlafzimmer']
                    }
                ]
            }
        ]
    },
    
    ios9: {
        enablePolyfills: true,
        disableAnimations: false,
        forcePolling: false,
    },
    
    design: {
        colors: {
            '--glass-bg': 'rgba(255, 255, 255, 0.1)',
            '--glass-border': 'rgba(255, 255, 255, 0.2)',
            '--accent-blue': 'rgba(0, 122, 255, 0.8)',
            '--accent-green': 'rgba(52, 199, 89, 0.8)',
            '--text-primary': 'rgba(255, 255, 255, 0.9)',
        },
        borderRadius: '16px',
        cardPadding: '20px',
        tileMargin: '16px',
        minTouchTargetSize: '60px',
    }
};
EOF

echo -e "${GREEN}✅ iPadHA Installation abgeschlossen!${NC}"
echo ""
echo "📱 Dashboard URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "📁 Installationsverzeichnis: $INSTALL_DIR"
echo "⚙️  Konfiguration: $CONFIG_DIR/ipadha.js"
echo ""
echo "🚀 Nächste Schritte:"
echo "1. Server starten: cd $INSTALL_DIR && npm start"
echo "2. Dashboard öffnen: http://$(hostname -I | awk '{print $1}'):3000"
echo "3. Entities anpassen: nano $CONFIG_DIR/ipadha.js"
echo ""
echo "📋 Befehle:"
echo "  Start:  cd $INSTALL_DIR && npm start"
echo "  Stop:   Ctrl+C"
echo "  Logs:   cd $INSTALL_DIR && npm start"
