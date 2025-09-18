#!/bin/bash

# iPadHA Simple Installation Script
# Ohne npm - nur die wichtigsten Dateien

set -e

echo "🚀 iPadHA Simple Installation"
echo "============================="
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

echo -e "${BLUE}ℹ️  Erstelle einfache Konfiguration...${NC}"
cat > "$CONFIG_DIR/ipadha.js" << 'EOF'
/**
 * iPadHA Simple Konfiguration
 */

module.exports = {
    homeAssistant: {
        url: 'http://localhost:8123',
        token: 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        pollingInterval: 5000,
        useWebSocket: false, // Polling für bessere Kompatibilität
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
            }
        ]
    },
    
    ios9: {
        enablePolyfills: true,
        disableAnimations: false,
        forcePolling: true, // Polling für iOS 9.3.5
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

echo -e "${GREEN}✅ iPadHA Simple Installation abgeschlossen!${NC}"
echo ""
echo "📱 Dashboard URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "📁 Installationsverzeichnis: $INSTALL_DIR"
echo "⚙️  Konfiguration: $CONFIG_DIR/ipadha.js"
echo ""
echo "🚀 Nächste Schritte:"
echo "1. Token in Konfiguration eintragen: nano $CONFIG_DIR/ipadha.js"
echo "2. Node.js installieren: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"
echo "3. Dependencies installieren: cd $INSTALL_DIR && npm install"
echo "4. Server starten: cd $INSTALL_DIR && npm start"
echo ""
echo "📋 Manuelle Installation:"
echo "  Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"
echo "  Dependencies: cd $INSTALL_DIR && npm install"
echo "  Start: cd $INSTALL_DIR && npm start"
