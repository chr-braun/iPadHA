/**
 * iPadHA Konfiguration
 * Zentrale Konfigurationsdatei für alle iPadHA Komponenten
 */

module.exports = {
    // Home Assistant Konfiguration
    homeAssistant: {
        url: process.env.HA_URL || 'http://localhost:8123',
        token: process.env.HA_TOKEN || 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        // WebSocket Fallback für iOS 9.3.5
        useWebSocket: process.env.HA_USE_WS !== 'false',
        // Polling Intervall (ms) für iOS 9.3.5
        pollingInterval: parseInt(process.env.HA_POLLING_INTERVAL) || 5000
    },

    // Dashboard Konfiguration
    dashboard: {
        title: process.env.DASHBOARD_TITLE || 'iPadHA Dashboard',
        theme: process.env.DASHBOARD_THEME || 'glass',
        // Auto-Refresh Intervall (ms)
        autoRefresh: parseInt(process.env.DASHBOARD_REFRESH) || 5000,
        // Touch-Optimierung
        touchOptimized: true,
        // Mindestgröße für Touch-Targets (px)
        minTouchSize: 60,
        // Schieberegler Konfiguration
        sliders: {
            enabled: true,
            step: 1, // Schrittweite für Schieberegler
            min: 0,
            max: 100
        }
    },

    // Server Konfiguration
    server: {
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || '0.0.0.0',
        // CORS Konfiguration
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        },
        // Kompression
        compression: {
            enabled: true,
            level: 6
        },
        // Security Headers
        security: {
            helmet: true,
            csp: false // Für iOS 9.3.5 Kompatibilität deaktiviert
        }
    },

    // iOS 9.3.5 spezifische Einstellungen
    ios9: {
        // JavaScript Optimierungen
        js: {
            // ES5 Kompatibilität
            es5Compatible: true,
            // Event Delegation verwenden
            useEventDelegation: true,
            // Throttling für Touch-Events (ms)
            touchThrottle: 50,
            // Memory Management
            memoryManagement: true,
            // Garbage Collection Intervall (ms)
            gcInterval: 30000
        },
        // CSS Optimierungen
        css: {
            // Hardware-Beschleunigung
            hardwareAcceleration: true,
            // Webkit-Prefixes verwenden
            webkitPrefixes: true,
            // Fallbacks für ältere Browser
            fallbacks: true
        },
        // Touch-Events
        touch: {
            // Touch-Action
            touchAction: 'manipulation',
            // Prevent Zoom
            preventZoom: true,
            // Haptic Feedback
            hapticFeedback: true
        }
    },

    // Glasmorphismus Design
    design: {
        // Farbpalette
        colors: {
            glass: {
                bg: 'rgba(255, 255, 255, 0.1)',
                border: 'rgba(255, 255, 255, 0.2)',
                shadow: 'rgba(0, 0, 0, 0.1)'
            },
            accent: {
                blue: 'rgba(0, 122, 255, 0.8)',
                green: 'rgba(52, 199, 89, 0.8)',
                orange: 'rgba(255, 149, 0, 0.8)',
                red: 'rgba(255, 59, 48, 0.8)',
                purple: 'rgba(175, 82, 222, 0.8)'
            },
            text: {
                primary: 'rgba(255, 255, 255, 0.9)',
                secondary: 'rgba(255, 255, 255, 0.6)',
                muted: 'rgba(255, 255, 255, 0.4)'
            }
        },
        // Blur-Effekte
        blur: {
            intensity: 20, // px
            fallback: 'rgba(255, 255, 255, 0.2)' // Fallback für iOS 9.3.5
        },
        // Border Radius
        borderRadius: {
            small: 8,
            medium: 12,
            large: 16,
            xlarge: 20
        },
        // Schatten
        shadows: {
            small: '0 2px 8px rgba(0, 0, 0, 0.1)',
            medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
            large: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }
    },

    // Entity-Konfiguration
    entities: {
        // Automatische Kategorisierung
        autoCategorize: true,
        // Versteckte Entitäten
        hidden: [
            'sun.sun',
            'sensor.date',
            'sensor.time'
        ],
        // Gruppierung
        groups: {
            lights: {
                title: 'Lichter',
                icon: 'mdi-lightbulb',
                types: ['light']
            },
            switches: {
                title: 'Schalter',
                icon: 'mdi-power',
                types: ['switch']
            },
            sensors: {
                title: 'Sensoren',
                icon: 'mdi-chart-line',
                types: ['sensor', 'binary_sensor']
            },
            media: {
                title: 'Medien',
                icon: 'mdi-music',
                types: ['media_player']
            },
            climate: {
                title: 'Klima',
                icon: 'mdi-thermostat',
                types: ['climate']
            },
            security: {
                title: 'Sicherheit',
                icon: 'mdi-shield',
                types: ['alarm_control_panel', 'lock']
            }
        }
    },

    // HACS Integration
    hacs: {
        enabled: process.env.HACS_ENABLED !== 'false',
        // HACS Repository
        repository: 'chr-braun/iPadHA',
        // Kategorie
        category: 'frontend',
        // Home Assistant Mindestversion
        minHaVersion: '2021.1.0'
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        // Log-Datei
        file: process.env.LOG_FILE || 'logs/ipadha.log',
        // Console Logging
        console: process.env.LOG_CONSOLE !== 'false'
    },

    // Development
    development: {
        // Hot Reload
        hotReload: process.env.NODE_ENV === 'development',
        // Debug Mode
        debug: process.env.DEBUG === 'true',
        // Source Maps
        sourceMaps: process.env.NODE_ENV === 'development'
    }
};
