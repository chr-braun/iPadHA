/**
 * iPadHA Beispiel-Konfiguration
 * Kopiere diese Datei zu config/ipadha.js und passe sie an
 */

module.exports = {
    homeAssistant: {
        url: 'http://localhost:8123',
        token: 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        pollingInterval: 5000
    },
    dashboard: {
        title: 'iPadHA Dashboard',
        theme: 'glass',
        autoRefresh: 5000,
        touchOptimized: true
    },
    ios9: {
        js: {
            es5Compatible: true,
            useEventDelegation: true,
            touchThrottle: 50,
            memoryManagement: true,
            gcInterval: 30000
        },
        css: {
            hardwareAcceleration: true,
            webkitPrefixes: true,
            fallbacks: true
        },
        touch: {
            touchAction: 'manipulation',
            preventZoom: true,
            hapticFeedback: true
        }
    }
};