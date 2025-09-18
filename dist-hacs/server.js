/**
 * iPadHA Server für HACS
 * Vereinfachte Version für Home Assistant Integration
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());

// Template Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Konfiguration laden
let config = {};
try {
    config = require('./config/ipadha');
} catch (e) {
    console.warn('Config not found, using defaults');
    config = {
        homeAssistant: {
            url: process.env.HA_URL || 'http://localhost:8123',
            token: process.env.HA_TOKEN || 'YOUR_LONG_LIVED_ACCESS_TOKEN'
        },
        dashboard: {
            title: 'iPadHA Dashboard',
            autoRefresh: 5000
        }
    };
}

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

    async callAPI(endpoint, method = 'GET', data = null) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: method,
                headers: this.headers,
                body: data ? JSON.stringify(data) : undefined
            });
            return await response.json();
        } catch (error) {
            console.error('Home Assistant API Error:', error.message);
            throw error;
        }
    }

    async getStates() {
        return await this.callAPI('/api/states');
    }

    async callService(domain, service, data = {}) {
        return await this.callAPI(`/api/services/${domain}/${service}`, 'POST', data);
    }

    async generateDashboardEntities() {
        const states = await this.getStates();
        return {
            lights: states.filter(e => e.entity_id.startsWith('light.')),
            switches: states.filter(e => e.entity_id.startsWith('switch.')),
            sensors: states.filter(e => e.entity_id.startsWith('sensor.')),
            media_players: states.filter(e => e.entity_id.startsWith('media_player.')),
            climates: states.filter(e => e.entity_id.startsWith('climate.')),
            covers: states.filter(e => e.entity_id.startsWith('cover.')),
            locks: states.filter(e => e.entity_id.startsWith('lock.')),
            alarms: states.filter(e => e.entity_id.startsWith('alarm_control_panel.'))
        };
    }
}

// Home Assistant API Instanz
const haAPI = new HomeAssistantAPI(config.homeAssistant.url, config.homeAssistant.token);

// Routes

// Haupt-Dashboard
app.get('/', async (req, res) => {
    try {
        const entities = await haAPI.generateDashboardEntities();
        res.render('dashboard', {
            title: config.dashboard.title,
            theme: 'glass',
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
app.get('/api/entities', async (req, res) => {
    try {
        const entities = await haAPI.generateDashboardEntities();
        res.json(entities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/service/:domain/:service', async (req, res) => {
    try {
        const { domain, service } = req.params;
        const result = await haAPI.callService(domain, service, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Server starten
app.listen(PORT, () => {
    console.log(`iPadHA Server läuft auf Port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}`);
    console.log(`Home Assistant: ${config.homeAssistant.url}`);
});

module.exports = app;