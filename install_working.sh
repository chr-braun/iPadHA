#!/bin/bash

# iPadHA Working Installation Script
# Robuste Installation für Home Assistant Terminal Plugin

echo "🚀 iPadHA Installation wird gestartet..."
echo "======================================"
echo ""

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Konfiguration
INSTALL_DIR="/config/ipadha"
CONFIG_DIR="/config/ipadha/config"

# Funktionen
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verzeichnisse erstellen
log_info "Erstelle Verzeichnisse..."
mkdir -p "$INSTALL_DIR" || log_error "Verzeichnis konnte nicht erstellt werden"
mkdir -p "$CONFIG_DIR" || log_error "Config-Verzeichnis konnte nicht erstellt werden"
log_success "Verzeichnisse erstellt"

# iPadHA herunterladen
log_info "Lade iPadHA herunter..."
cd /tmp || log_error "Kann nicht nach /tmp wechseln"

# Lösche alte Dateien
rm -f ipadha.zip
rm -rf iPadHA-0.1.0

# Lade herunter
wget -q "https://github.com/chr-braun/iPadHA/archive/refs/tags/v0.1.0.zip" -O "ipadha.zip" || {
    log_error "Download fehlgeschlagen"
    exit 1
}

# Entpacke
unzip -q "ipadha.zip" || {
    log_error "Entpacken fehlgeschlagen"
    exit 1
}

# Kopiere Dateien
cp -r "iPadHA-0.1.0"/* "$INSTALL_DIR/" || {
    log_error "Kopieren fehlgeschlagen"
    exit 1
}

# Aufräumen
rm -rf "ipadha.zip" "iPadHA-0.1.0"
log_success "iPadHA heruntergeladen"

# Node.js prüfen und installieren
log_info "Prüfe Node.js..."
if ! command -v node &> /dev/null; then
    log_info "Node.js nicht gefunden. Installiere Node.js..."
    
    # Node.js installieren
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - || {
        log_error "Node.js Setup fehlgeschlagen"
        exit 1
    }
    
    apt-get update || {
        log_error "apt-get update fehlgeschlagen"
        exit 1
    }
    
    apt-get install -y nodejs || {
        log_error "Node.js Installation fehlgeschlagen"
        exit 1
    }
    
    log_success "Node.js installiert"
else
    log_success "Node.js bereits installiert: $(node --version)"
fi

# Dependencies installieren
log_info "Installiere Dependencies..."
cd "$INSTALL_DIR" || {
    log_error "Kann nicht nach $INSTALL_DIR wechseln"
    exit 1
}

npm install --production || {
    log_error "npm install fehlgeschlagen"
    log_info "Versuche es manuell: cd $INSTALL_DIR && npm install"
    exit 1
}

log_success "Dependencies installiert"

# Konfiguration erstellen
log_info "Erstelle Konfiguration..."
cat > "$CONFIG_DIR/ipadha.js" << 'EOF'
/**
 * iPadHA Konfiguration
 */

module.exports = {
    homeAssistant: {
        url: 'http://localhost:8123',
        token: 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        pollingInterval: 5000,
        useWebSocket: false,
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
        forcePolling: true,
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

log_success "Konfiguration erstellt"

# Finale Anweisungen
echo ""
log_success "iPadHA Installation abgeschlossen!"
echo ""
echo "📱 Dashboard URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "📁 Installationsverzeichnis: $INSTALL_DIR"
echo "⚙️  Konfiguration: $CONFIG_DIR/ipadha.js"
echo ""
echo "🚀 Nächste Schritte:"
echo "1. Token in Konfiguration eintragen:"
echo "   nano $CONFIG_DIR/ipadha.js"
echo "   Ersetze 'YOUR_LONG_LIVED_ACCESS_TOKEN' mit deinem Token"
echo ""
echo "2. Server starten:"
echo "   cd $INSTALL_DIR"
echo "   npm start"
echo ""
echo "3. Dashboard öffnen:"
echo "   http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📋 Befehle:"
echo "  Start:  cd $INSTALL_DIR && npm start"
echo "  Stop:   Ctrl+C"
echo "  Config: nano $CONFIG_DIR/ipadha.js"
