#!/bin/bash

# iPadHA Home Assistant Installation Script
# Dieses Script installiert iPadHA direkt in Home Assistant

set -e

echo "🚀 iPadHA Home Assistant Installation wird gestartet..."

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguration
IPADHA_VERSION="0.1.0"
IPADHA_URL="https://github.com/chr-braun/iPadHA/archive/refs/tags/v${IPADHA_VERSION}.zip"
INSTALL_DIR="/config/ipadha"
CONFIG_DIR="/config/ipadha/config"
SERVICE_NAME="ipadha"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

# Funktionen
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Home Assistant läuft bereits (Terminal Plugin)
# Keine Prüfung erforderlich

# Prüfe ob Node.js installiert ist
check_nodejs() {
    log_info "Prüfe Node.js Installation..."
    if ! command -v node &> /dev/null; then
        log_warning "Node.js nicht gefunden. Installiere Node.js..."
        
        # Node.js installieren (für verschiedene Linux-Distributionen)
        if command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            yum install -y nodejs
        elif command -v apk &> /dev/null; then
            # Alpine Linux
            apk add nodejs npm
        else
            log_error "Unsupported Linux distribution. Bitte installiere Node.js manuell."
            exit 1
        fi
    fi
    
    # Prüfe Node.js Version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 14 ]; then
        log_error "Node.js Version 14+ erforderlich. Aktuelle Version: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js $(node --version) gefunden"
}

# Erstelle Installationsverzeichnis
create_directories() {
    log_info "Erstelle Installationsverzeichnisse..."
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$CONFIG_DIR"
    log_success "Verzeichnisse erstellt"
}

# Lade iPadHA herunter
download_ipadha() {
    log_info "Lade iPadHA v${IPADHA_VERSION} herunter..."
    cd /tmp
    wget -q "$IPADHA_URL" -O "ipadha-${IPADHA_VERSION}.zip"
    unzip -q "ipadha-${IPADHA_VERSION}.zip"
    cp -r "iPadHA-${IPADHA_VERSION}"/* "$INSTALL_DIR/"
    rm -rf "ipadha-${IPADHA_VERSION}.zip" "iPadHA-${IPADHA_VERSION}"
    log_success "iPadHA heruntergeladen"
}

# Installiere Dependencies
install_dependencies() {
    log_info "Installiere Dependencies..."
    cd "$INSTALL_DIR"
    npm install --production
    log_success "Dependencies installiert"
}

# Erstelle Konfigurationsdatei
create_config() {
    log_info "Erstelle Konfigurationsdatei..."
    
    cat > "$CONFIG_DIR/ipadha.js" << 'EOF'
/**
 * iPadHA Home Assistant Konfiguration
 * Automatisch generiert von install_homeassistant.sh
 */

module.exports = {
    // Home Assistant Konfiguration
    homeAssistant: {
        // Home Assistant URL (ohne /api)
        url: 'http://localhost:8123',
        
        // Long-lived Access Token (wird automatisch erstellt)
        token: process.env.HA_TOKEN || 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        
        // Polling-Intervall in Millisekunden (falls WebSocket nicht funktioniert)
        pollingInterval: 5000,
        
        // WebSocket verwenden (true) oder Polling (false)
        useWebSocket: true,
        
        // WebSocket Reconnect-Intervall in Millisekunden
        reconnectInterval: 10000
    },
    
    // Dashboard Konfiguration
    dashboard: {
        // Dashboard-Titel
        title: 'iPadHA Dashboard',
        
        // Locale für Datum/Zeit
        locale: 'de-DE',
        
        // Design-Theme
        theme: 'glassmorphism',
        
        // Standard-Seite
        defaultPage: 'home',
        
        // Auto-Refresh Intervall in Millisekunden
        autoRefresh: 5000,
        
        // Touch-Optimierung aktivieren
        touchOptimized: true,
        
        // Dashboard-Seiten definieren
        pages: [
            {
                id: 'home',
                title: 'Home',
                icon: '🏠',
                groups: [
                    {
                        title: 'Wichtige Geräte',
                        entities: ['light.wohnzimmer', 'switch.steckdose_1', 'sensor.temperatur_wohnzimmer']
                    },
                    {
                        title: 'Klima',
                        entities: ['climate.thermostat_wohnzimmer']
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
            },
            {
                id: 'sensors',
                title: 'Sensoren',
                icon: '📊',
                groups: [
                    {
                        title: 'Umwelt',
                        entities: ['sensor.temperatur_wohnzimmer', 'sensor.luftfeuchtigkeit_wohnzimmer']
                    },
                    {
                        title: 'Sicherheit',
                        entities: ['binary_sensor.tuer_eingang', 'alarm_control_panel.home_alarm']
                    }
                ]
            }
        ]
    },
    
    // iOS 9.3.5 spezifische Optimierungen
    ios9: {
        enablePolyfills: true,
        disableAnimations: false,
        forcePolling: false,
    },
    
    // Design-Konfiguration
    design: {
        colors: {
            '--glass-bg': 'rgba(255, 255, 255, 0.1)',
            '--glass-border': 'rgba(255, 255, 255, 0.2)',
            '--glass-shadow': 'rgba(0, 0, 0, 0.1)',
            '--accent-blue': 'rgba(0, 122, 255, 0.8)',
            '--accent-green': 'rgba(52, 199, 89, 0.8)',
            '--accent-orange': 'rgba(255, 149, 0, 0.8)',
            '--accent-red': 'rgba(255, 59, 48, 0.8)',
            '--text-primary': 'rgba(255, 255, 255, 0.9)',
            '--text-secondary': 'rgba(255, 255, 255, 0.6)',
            '--text-muted': 'rgba(255, 255, 255, 0.4)',
        },
        borderRadius: '16px',
        cardPadding: '20px',
        tileMargin: '16px',
        minTouchTargetSize: '60px',
    },
    
    // HACS Integration
    hacs: {
        enabled: true,
        repository: 'chr-braun/iPadHA',
        category: 'frontend',
        minHaVersion: '2021.1.0'
    }
};
EOF

    log_success "Konfigurationsdatei erstellt"
}

# Erstelle Systemd Service
create_service() {
    log_info "Erstelle Systemd Service..."
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=iPadHA Dashboard Server
After=home-assistant@homeassistant.service
Wants=home-assistant@homeassistant.service

[Service]
Type=simple
User=homeassistant
Group=homeassistant
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=HA_TOKEN=\$(cat /config/.storage/auth_provider.homeassistant 2>/dev/null | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4 | head -1)

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    log_success "Systemd Service erstellt"
}

# Starte Service
start_service() {
    log_info "Starte iPadHA Service..."
    systemctl start "$SERVICE_NAME"
    sleep 5
    
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "iPadHA Service läuft"
    else
        log_error "iPadHA Service konnte nicht gestartet werden"
        systemctl status "$SERVICE_NAME"
        exit 1
    fi
}

# Erstelle Nginx Konfiguration
create_nginx_config() {
    log_info "Erstelle Nginx Konfiguration..."
    
    cat > "/etc/nginx/sites-available/ipadha" << 'EOF'
server {
    listen 3000;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket Support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

    # Aktiviere Site
    ln -sf "/etc/nginx/sites-available/ipadha" "/etc/nginx/sites-enabled/"
    nginx -t && systemctl reload nginx
    log_success "Nginx Konfiguration erstellt"
}

# Erstelle Home Assistant Konfiguration
create_ha_config() {
    log_info "Erstelle Home Assistant Konfiguration..."
    
    # Füge Trusted Networks hinzu
    if ! grep -q "trusted_networks" /config/configuration.yaml; then
        echo "" >> /config/configuration.yaml
        echo "# iPadHA Trusted Networks" >> /config/configuration.yaml
        echo "homeassistant:" >> /config/configuration.yaml
        echo "  trusted_networks:" >> /config/configuration.yaml
        echo "    - 127.0.0.1" >> /config/configuration.yaml
        echo "    - 192.168.0.0/16" >> /config/configuration.yaml
        echo "    - 10.0.0.0/8" >> /config/configuration.yaml
        echo "    - 172.16.0.0/12" >> /config/configuration.yaml
    fi
    
    log_success "Home Assistant Konfiguration aktualisiert"
}

# Zeige Status
show_status() {
    log_info "iPadHA Installation abgeschlossen!"
    echo ""
    echo "📱 Dashboard URL: http://$(hostname -I | awk '{print $1}'):3000"
    echo "🔧 Service Status: $(systemctl is-active $SERVICE_NAME)"
    echo "📁 Installationsverzeichnis: $INSTALL_DIR"
    echo "⚙️  Konfiguration: $CONFIG_DIR/ipadha.js"
    echo ""
    echo "🚀 Nächste Schritte:"
    echo "1. Öffne das Dashboard auf deinem iPad"
    echo "2. Passe die Entities in der Konfiguration an"
    echo "3. Teste die Touch-Funktionen"
    echo ""
    echo "📋 Service-Befehle:"
    echo "  Status: systemctl status $SERVICE_NAME"
    echo "  Start:  systemctl start $SERVICE_NAME"
    echo "  Stop:   systemctl stop $SERVICE_NAME"
    echo "  Logs:   journalctl -u $SERVICE_NAME -f"
}

# Hauptfunktion
main() {
    echo "🚀 iPadHA Home Assistant Installation"
    echo "======================================"
    echo ""
    
    check_nodejs
    create_directories
    download_ipadha
    install_dependencies
    create_config
    create_service
    create_nginx_config
    create_ha_config
    start_service
    show_status
}

# Script ausführen
main "$@"
