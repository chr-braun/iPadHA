#!/bin/bash

# iPadHA Docker Installation Script
# Für Home Assistant Docker Container

set -e

echo "🚀 iPadHA Docker Installation wird gestartet..."

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguration
IPADHA_VERSION="0.1.0"
IPADHA_URL="https://github.com/chr-braun/iPadHA/archive/refs/tags/v${IPADHA_VERSION}.zip"
CONFIG_DIR="/config"
INSTALL_DIR="$CONFIG_DIR/ipadha"
DOCKER_COMPOSE_FILE="$CONFIG_DIR/docker-compose.ipadha.yml"

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

# Prüfe ob Docker läuft
check_docker() {
    log_info "Prüfe Docker Status..."
    if ! docker info &> /dev/null; then
        log_error "Docker ist nicht aktiv!"
        exit 1
    fi
    log_success "Docker läuft"
}

# Erstelle Installationsverzeichnis
create_directories() {
    log_info "Erstelle Installationsverzeichnisse..."
    mkdir -p "$INSTALL_DIR"
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

# Erstelle Docker Compose Datei
create_docker_compose() {
    log_info "Erstelle Docker Compose Konfiguration..."
    
    cat > "$DOCKER_COMPOSE_FILE" << 'EOF'
version: '3.8'

services:
  ipadha:
    image: node:18-alpine
    container_name: ipadha
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - /config/ipadha:/app
      - /config/.storage:/config/.storage:ro
    working_dir: /app
    command: >
      sh -c "
        npm install --production &&
        node src/server.js
      "
    environment:
      - NODE_ENV=production
      - HA_TOKEN_FILE=/config/.storage/auth_provider.homeassistant
    networks:
      - homeassistant
    depends_on:
      - homeassistant

  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    container_name: homeassistant
    restart: unless-stopped
    volumes:
      - /config:/config
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "8123:8123"
    environment:
      - TZ=Europe/Berlin
    networks:
      - homeassistant

networks:
  homeassistant:
    driver: bridge
EOF

    log_success "Docker Compose Datei erstellt"
}

# Erstelle Konfigurationsdatei
create_config() {
    log_info "Erstelle Konfigurationsdatei..."
    
    cat > "$INSTALL_DIR/config/ipadha.js" << 'EOF'
/**
 * iPadHA Docker Konfiguration
 * Automatisch generiert von install_docker.sh
 */

const fs = require('fs');

// Lade Home Assistant Token aus Datei
function loadHAToken() {
    try {
        const tokenFile = process.env.HA_TOKEN_FILE || '/config/.storage/auth_provider.homeassistant';
        const data = fs.readFileSync(tokenFile, 'utf8');
        const match = data.match(/"access_token":"([^"]+)"/);
        return match ? match[1] : null;
    } catch (error) {
        console.warn('Could not load HA token from file:', error.message);
        return null;
    }
}

module.exports = {
    // Home Assistant Konfiguration
    homeAssistant: {
        // Home Assistant URL (ohne /api)
        url: 'http://homeassistant:8123',
        
        // Long-lived Access Token (wird automatisch geladen)
        token: loadHAToken() || process.env.HA_TOKEN || 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        
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

# Starte Container
start_containers() {
    log_info "Starte iPadHA Container..."
    cd "$CONFIG_DIR"
    docker-compose -f docker-compose.ipadha.yml up -d
    
    # Warte auf Container
    sleep 10
    
    if docker ps | grep -q ipadha; then
        log_success "iPadHA Container läuft"
    else
        log_error "iPadHA Container konnte nicht gestartet werden"
        docker logs ipadha
        exit 1
    fi
}

# Zeige Status
show_status() {
    log_info "iPadHA Docker Installation abgeschlossen!"
    echo ""
    echo "📱 Dashboard URL: http://$(hostname -I | awk '{print $1}'):3000"
    echo "🔧 Container Status: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep ipadha)"
    echo "📁 Installationsverzeichnis: $INSTALL_DIR"
    echo "⚙️  Konfiguration: $INSTALL_DIR/config/ipadha.js"
    echo ""
    echo "🚀 Nächste Schritte:"
    echo "1. Öffne das Dashboard auf deinem iPad"
    echo "2. Passe die Entities in der Konfiguration an"
    echo "3. Teste die Touch-Funktionen"
    echo ""
    echo "📋 Docker-Befehle:"
    echo "  Status: docker ps | grep ipadha"
    echo "  Logs:   docker logs ipadha -f"
    echo "  Stop:   docker-compose -f $DOCKER_COMPOSE_FILE down"
    echo "  Start:  docker-compose -f $DOCKER_COMPOSE_FILE up -d"
}

# Hauptfunktion
main() {
    echo "🚀 iPadHA Docker Installation"
    echo "============================="
    echo ""
    
    check_docker
    create_directories
    download_ipadha
    create_docker_compose
    create_config
    start_containers
    show_status
}

# Script ausführen
main "$@"
