/**
 * iPadHA Konfiguration für HACS
 */

module.exports = {
    homeAssistant: {
        url: process.env.HA_URL || 'http://localhost:8123',
        token: process.env.HA_TOKEN || 'YOUR_LONG_LIVED_ACCESS_TOKEN',
        pollingInterval: 5000
    },
    dashboard: {
        title: process.env.DASHBOARD_TITLE || 'iPadHA Dashboard',
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