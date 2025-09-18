/**
 * iPadHA Beispiel-Konfiguration
 * Kopiere diese Datei zu config/ipadha.js und passe sie an
 */

module.exports = {
    // Home Assistant Konfiguration
    homeAssistant: {
        // Home Assistant URL (ohne /api)
        url: 'http://localhost:8123',
        
        // Long-lived Access Token (erstellen unter HA Profil)
        token: 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        
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
        theme: 'glassmorphism', // 'glassmorphism', 'minimal', 'apple-style'
        
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
                        entities: [
                            'light.wohnzimmer',
                            'switch.steckdose_1',
                            'sensor.temperatur_wohnzimmer'
                        ]
                    },
                    {
                        title: 'Klima',
                        entities: [
                            'climate.thermostat_wohnzimmer'
                        ]
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
                        entities: [
                            'light.wohnzimmer',
                            'light.kueche',
                            'light.schlafzimmer'
                        ]
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
                        entities: [
                            'sensor.temperatur_wohnzimmer',
                            'sensor.luftfeuchtigkeit_wohnzimmer'
                        ]
                    },
                    {
                        title: 'Sicherheit',
                        entities: [
                            'binary_sensor.tuer_eingang',
                            'alarm_control_panel.home_alarm'
                        ]
                    }
                ]
            }
        ],
        
        // Entity-Rendering-Konfiguration
        entityConfig: {
            // Lichter
            'light.': {
                type: 'slider', // 'slider' oder 'toggle'
                icon: '💡',
                name: (state) => state.attributes.friendly_name || state.entity_id.split('.')[1],
                stateText: (state) => state.state === 'on' ? 
                    `${state.attributes.brightness ? Math.round(state.attributes.brightness / 2.55) + '%' : 'ON'}` : 'OFF',
                action: 'light.turn_on',
                secondaryAction: 'light.turn_off',
            },
            
            // Schalter
            'switch.': {
                type: 'toggle',
                icon: '🔌',
                name: (state) => state.attributes.friendly_name || state.entity_id.split('.')[1],
                stateText: (state) => state.state.toUpperCase(),
                action: 'homeassistant.toggle',
            },
            
            // Sensoren
            'sensor.': {
                type: 'info',
                icon: '📊',
                name: (state) => state.attributes.friendly_name || state.entity_id.split('.')[1],
                stateText: (state) => `${state.state} ${state.attributes.unit_of_measurement || ''}`,
            },
            
            // Binary Sensoren
            'binary_sensor.': {
                type: 'info',
                icon: '🚪',
                name: (state) => state.attributes.friendly_name || state.entity_id.split('.')[1],
                stateText: (state) => state.state.toUpperCase(),
            },
            
            // Klima
            'climate.': {
                type: 'info', // Kann zu custom climate control erweitert werden
                icon: '🌡️',
                name: (state) => state.attributes.friendly_name || state.entity_id.split('.')[1],
                stateText: (state) => `${state.attributes.current_temperature}°C / ${state.attributes.temperature}°C`,
            },
            
            // Media Player
            'media_player.': {
                type: 'toggle', // Kann zu media controls erweitert werden
                icon: '📺',
                name: (state) => state.attributes.friendly_name || state.entity_id.split('.')[1],
                stateText: (state) => state.state.toUpperCase(),
            }
        }
    },
    
    // iOS 9.3.5 spezifische Optimierungen
    ios9: {
        // JavaScript-Optimierungen
        js: {
            // ES5-Kompatibilität aktivieren
            es5Compatible: true,
            
            // Event Delegation verwenden
            useEventDelegation: true,
            
            // Touch-Event Throttling in Millisekunden
            touchThrottle: 50,
            
            // Memory Management aktivieren
            memoryManagement: true,
            
            // Garbage Collection Intervall in Millisekunden
            gcInterval: 30000
        },
        
        // CSS-Optimierungen
        css: {
            // Hardware-Beschleunigung aktivieren
            hardwareAcceleration: true,
            
            // Webkit-Prefixes hinzufügen
            webkitPrefixes: true,
            
            // Fallbacks für nicht unterstützte Features
            fallbacks: true
        },
        
        // Touch-Optimierungen
        touch: {
            // Touch-Action CSS-Eigenschaft
            touchAction: 'manipulation',
            
            // Zoom verhindern
            preventZoom: true,
            
            // Haptic Feedback simulieren
            hapticFeedback: true
        }
    },
    
    // Design-Konfiguration
    design: {
        // Glasmorphismus-Farbpalette
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
        
        // Design-Parameter
        borderRadius: '16px',
        cardPadding: '20px',
        tileMargin: '16px',
        minTouchTargetSize: '60px',
    },
    
    // Server-Konfiguration
    server: {
        // Port für den iPadHA Server
        port: process.env.PORT || 3000,
        
        // Host (normalerweise localhost)
        host: '0.0.0.0'
    }
};
