/**
 * iPadHA Server
 * Express.js Server für Home Assistant Dashboard auf iOS 9.3.5
 * 
 * Features:
 * - Server-seitiges Rendering für iOS 9.3.5 Kompatibilität
 * - Home Assistant API Integration
 * - WebSocket Fallback auf Polling
 * - Performance-optimiert für ältere Geräte
 * - HACS Integration
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const axios = require('axios');
const WebSocket = require('ws');

// Konfiguration laden
const config = require('../config/ipadha');

// Express App erstellen
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Für iOS 9.3.5 Kompatibilität
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Template Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Home Assistant API Client
class HomeAssistantAPI {
    constructor(baseURL, token) {
        this.baseURL = baseURL;
        this.token = token;
        this.headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // REST API Call
    async callAPI(endpoint, method = 'GET', data = null) {
        try {
            const response = await axios({
                method: method,
                url: `${this.baseURL}${endpoint}`,
                headers: this.headers,
                data: data,
                timeout: 5000
            });
            return response.data;
        } catch (error) {
            console.error('Home Assistant API Error:', error.message);
            throw error;
        }
    }

    // Alle Entitäten abrufen
    async getStates() {
        return await this.callAPI('/api/states');
    }

    // Service aufrufen
    async callService(domain, service, data = {}) {
        return await this.callAPI(`/api/services/${domain}/${service}`, 'POST', data);
    }

    // Entitäten nach Typ filtern
    async getEntitiesByType(type) {
        const states = await this.getStates();
        return states.filter(entity => entity.entity_id.startsWith(type + '.'));
    }

    // Dashboard-Entitäten generieren
    async generateDashboardEntities() {
        const states = await this.getStates();
        const dashboard = {
            lights: states.filter(e => e.entity_id.startsWith('light.')),
            switches: states.filter(e => e.entity_id.startsWith('switch.')),
            sensors: states.filter(e => e.entity_id.startsWith('sensor.')),
            media_players: states.filter(e => e.entity_id.startsWith('media_player.')),
            climates: states.filter(e => e.entity_id.startsWith('climate.')),
            covers: states.filter(e => e.entity_id.startsWith('cover.')),
            locks: states.filter(e => e.entity_id.startsWith('lock.')),
            alarms: states.filter(e => e.entity_id.startsWith('alarm_control_panel.'))
        };
        return dashboard;
    }
}

// Home Assistant API Instanz
const haAPI = new HomeAssistantAPI(config.homeAssistant.url, config.homeAssistant.token);

// WebSocket Fallback für iOS 9.3.5
class WebSocketFallback {
    constructor(api) {
        this.api = api;
        this.connected = false;
        this.reconnectInterval = 5000;
        this.pollInterval = null;
    }

    // Polling starten (iOS 9.3.5 Fallback)
    startPolling() {
        console.log('Starting polling fallback for iOS 9.3.5');
        this.pollInterval = setInterval(async () => {
            try {
                const states = await this.api.getStates();
                this.broadcastUpdate(states);
            } catch (error) {
                console.error('Polling error:', error.message);
            }
        }, config.dashboard.autoRefresh);
    }

    // WebSocket Verbindung versuchen
    async connectWebSocket() {
        try {
            const wsUrl = config.homeAssistant.url.replace('http', 'ws') + '/api/websocket';
            this.ws = new WebSocket(wsUrl);
            
            this.ws.on('open', () => {
                console.log('WebSocket connected');
                this.connected = true;
                this.authenticate();
            });

            this.ws.on('message', (data) => {
                const message = JSON.parse(data);
                this.handleMessage(message);
            });

            this.ws.on('close', () => {
                console.log('WebSocket disconnected, starting polling fallback');
                this.connected = false;
                this.startPolling();
            });

            this.ws.on('error', (error) => {
                console.error('WebSocket error:', error.message);
                this.startPolling();
            });

        } catch (error) {
            console.error('WebSocket connection failed:', error.message);
            this.startPolling();
        }
    }

    // WebSocket Authentifizierung
    authenticate() {
        const authMessage = {
            type: 'auth',
            access_token: config.homeAssistant.token
        };
        this.ws.send(JSON.stringify(authMessage));
    }

    // Nachrichten verarbeiten
    handleMessage(message) {
        if (message.type === 'auth_ok') {
            console.log('WebSocket authenticated');
            this.subscribeToStates();
        } else if (message.type === 'event' && message.event.type === 'state_changed') {
            this.broadcastUpdate([message.event.data.new_state]);
        }
    }

    // State Updates abonnieren
    subscribeToStates() {
        const subscribeMessage = {
            id: 1,
            type: 'subscribe_events',
            event_type: 'state_changed'
        };
        this.ws.send(JSON.stringify(subscribeMessage));
    }

    // Updates an Clients senden
    broadcastUpdate(states) {
        // Hier würde normalerweise WebSocket an Clients gesendet werden
        // Für iOS 9.3.5 verwenden wir Polling
        console.log('Broadcasting update for', states.length, 'entities');
    }
}

// WebSocket Fallback starten
const wsFallback = new WebSocketFallback(haAPI);
wsFallback.connectWebSocket();

// Routes

// Haupt-Dashboard
app.get('/', async (req, res) => {
    try {
        const entities = await haAPI.generateDashboardEntities();
        res.render('dashboard', {
            title: config.dashboard.title,
            theme: config.dashboard.theme,
            entities: entities,
            config: config
        });
    } catch (error) {
        console.error('Dashboard error:', error.message);
        res.status(500).render('error', {
            title: 'Fehler',
            message: 'Dashboard konnte nicht geladen werden',
            error: error.message
        });
    }
});

// API Routes

// Alle Entitäten
app.get('/api/entities', async (req, res) => {
    try {
        const entities = await haAPI.generateDashboardEntities();
        res.json(entities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Service aufrufen
app.post('/api/service/:domain/:service', async (req, res) => {
    try {
        const { domain, service } = req.params;
        const result = await haAPI.callService(domain, service, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Entität Status
app.get('/api/entity/:entityId', async (req, res) => {
    try {
        const states = await haAPI.getStates();
        const entity = states.find(e => e.entity_id === req.params.entityId);
        if (entity) {
            res.json(entity);
        } else {
            res.status(404).json({ error: 'Entity not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: require('../package.json').version
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Nicht gefunden',
        message: 'Die angeforderte Seite wurde nicht gefunden',
        error: null
    });
});

// Error Handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).render('error', {
        title: 'Server Fehler',
        message: 'Ein unerwarteter Fehler ist aufgetreten',
        error: error.message
    });
});

// Server starten
app.listen(PORT, () => {
    console.log(`iPadHA Server läuft auf Port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Home Assistant: ${config.homeAssistant.url}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
