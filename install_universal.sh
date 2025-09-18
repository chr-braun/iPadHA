#!/bin/bash

# iPadHA Universal Installation Script
# Funktioniert auf allen Linux-Distributionen

echo "🚀 iPadHA Universal Installation"
echo "================================"
echo ""

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# System erkanne
detect_system() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        OS=$(uname -s)
        VER=$(uname -r)
    fi
    
    log_info "System erkannt: $OS $VER"
}

# Node.js installieren
install_nodejs() {
    log_info "Prüfe Node.js..."
    
    if command -v node &> /dev/null; then
        log_success "Node.js bereits installiert: $(node --version)"
        return 0
    fi
    
    log_info "Node.js nicht gefunden. Installiere Node.js..."
    
    # Prüfe welches Paket-Management verfügbar ist
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        log_info "Debian/Ubuntu System erkannt"
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get update
        apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        log_info "CentOS/RHEL System erkannt"
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        yum install -y nodejs
    elif command -v apk &> /dev/null; then
        # Alpine Linux
        log_info "Alpine Linux System erkannt"
        apk add nodejs npm
    elif command -v pacman &> /dev/null; then
        # Arch Linux
        log_info "Arch Linux System erkannt"
        pacman -S nodejs npm
    else
        log_error "Unsupported Linux distribution: $OS"
        log_info "Bitte installiere Node.js manuell:"
        log_info "  Debian/Ubuntu: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"
        log_info "  CentOS/RHEL:   curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - && yum install -y nodejs"
        log_info "  Alpine:        apk add nodejs npm"
        log_info "  Arch:          pacman -S nodejs npm"
        exit 1
    fi
    
    # Prüfe Installation
    if command -v node &> /dev/null; then
        log_success "Node.js installiert: $(node --version)"
    else
        log_error "Node.js Installation fehlgeschlagen"
        exit 1
    fi
}

# Verzeichnisse erstellen
create_directories() {
    log_info "Erstelle Verzeichnisse..."
    mkdir -p "$INSTALL_DIR" || {
        log_error "Verzeichnis konnte nicht erstellt werden"
        exit 1
    }
    mkdir -p "$CONFIG_DIR" || {
        log_error "Config-Verzeichnis konnte nicht erstellt werden"
        exit 1
    }
    log_success "Verzeichnisse erstellt"
}

# iPadHA herunterladen
download_ipadha() {
    log_info "Lade iPadHA herunter..."
    cd /tmp || {
        log_error "Kann nicht nach /tmp wechseln"
        exit 1
    }
    
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
}

# Dependencies installieren
install_dependencies() {
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
}

# Konfiguration erstellen
create_config() {
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
}

# Hauptfunktion
main() {
    detect_system
    create_directories
    download_ipadha
    install_nodejs
    install_dependencies
    create_config
    
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
}

# Script ausführen
main "$@"
