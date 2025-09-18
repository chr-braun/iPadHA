/**
 * iPadHA Haupt-JavaScript
 * Touch-optimierte Events für iOS 9.3.5 Safari
 * Performance und Bedienbarkeit im Fokus
 */

(function(global) {
    'use strict';

    // iPadHA Namespace
    var iPadHA = {
        version: '1.0.0',
        config: {},
        entities: {},
        eventListeners: [],
        isInitialized: false,
        isIOS9: false,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        currentValue: 0,
        startValue: 0
    };

    // iOS 9.3.5 Detection
    function detectIOS9() {
        var userAgent = navigator.userAgent;
        var iOS = /iPad|iPhone|iPod/.test(userAgent);
        var version = userAgent.match(/OS (\d+)_(\d+)/);
        return iOS && version && parseInt(version[1]) === 9 && parseInt(version[2]) <= 3;
    }

    // Utility Functions
    var Utils = {
        // Debounce für Performance
        debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },

        // Throttle für Touch-Events
        throttle: function(func, limit) {
            var inThrottle;
            return function() {
                var args = arguments;
                var context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(function() {
                        inThrottle = false;
                    }, limit);
                }
            };
        },

        // Element in Viewport prüfen
        isElementInViewport: function(el) {
            var rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        // Haptic Feedback Simulation
        hapticFeedback: function() {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        },

        // Memory Management
        cleanup: function() {
            iPadHA.eventListeners.forEach(function(listener) {
                listener.element.removeEventListener(listener.event, listener.handler);
            });
            iPadHA.eventListeners = [];
        },

        // Garbage Collection
        forceGC: function() {
            if (window.gc) {
                window.gc();
            }
        }
    };

    // Event Delegation für Performance
    var EventDelegation = {
        // Click Events
        initClickEvents: function() {
            document.addEventListener('click', function(e) {
                var tile = e.target.closest('.tile');
                if (tile) {
                    EventDelegation.handleTileClick(tile, e);
                }

                var navTab = e.target.closest('.nav-tab');
                if (navTab) {
                    EventDelegation.handleNavTabClick(navTab, e);
                }

                var button = e.target.closest('.touch-button');
                if (button) {
                    EventDelegation.handleButtonClick(button, e);
                }
            });
        },

        // Touch Events
        initTouchEvents: function() {
            document.addEventListener('touchstart', function(e) {
                var tile = e.target.closest('.tile');
                if (tile) {
                    EventDelegation.handleTouchStart(tile, e);
                }

                var slider = e.target.closest('.tile-slider');
                if (slider) {
                    EventDelegation.handleSliderTouchStart(slider, e);
                }
            }, { passive: false });

            document.addEventListener('touchmove', function(e) {
                if (iPadHA.isDragging) {
                    EventDelegation.handleTouchMove(e);
                }
            }, { passive: false });

            document.addEventListener('touchend', function(e) {
                if (iPadHA.isDragging) {
                    EventDelegation.handleTouchEnd(e);
                }
            }, { passive: false });
        },

        // Tile Click Handler
        handleTileClick: function(tile, e) {
            e.preventDefault();
            e.stopPropagation();

            var entityId = tile.getAttribute('data-entity-id');
            if (!entityId) return;

            Utils.hapticFeedback();
            tile.classList.add('touch-feedback');
            
            setTimeout(function() {
                tile.classList.remove('touch-feedback');
            }, 150);

            // Home Assistant Service aufrufen
            HomeAssistantAPI.toggleEntity(entityId);
        },

        // Navigation Tab Handler
        handleNavTabClick: function(tab, e) {
            e.preventDefault();
            e.stopPropagation();

            var tabId = tab.getAttribute('data-tab');
            if (!tabId) return;

            Utils.hapticFeedback();
            Navigation.switchTab(tabId);
        },

        // Button Click Handler
        handleButtonClick: function(button, e) {
            e.preventDefault();
            e.stopPropagation();

            Utils.hapticFeedback();
            button.classList.add('touch-feedback');
            
            setTimeout(function() {
                button.classList.remove('touch-feedback');
            }, 150);

            // Button-spezifische Aktionen
            var action = button.getAttribute('data-action');
            if (action) {
                Actions.execute(action, button);
            }
        },

        // Touch Start Handler
        handleTouchStart: function(tile, e) {
            e.preventDefault();
            tile.classList.add('touch-highlight');
        },

        // Slider Touch Start
        handleSliderTouchStart: function(slider, e) {
            e.preventDefault();
            iPadHA.isDragging = true;
            
            var touch = e.touches[0];
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            iPadHA.dragStartX = touch.clientX;
            iPadHA.dragStartY = touch.clientY;
            iPadHA.currentValue = Slider.getCurrentValue(slider);
            iPadHA.startValue = iPadHA.currentValue;

            Utils.hapticFeedback();
        },

        // Touch Move Handler
        handleTouchMove: function(e) {
            if (!iPadHA.isDragging) return;
            
            e.preventDefault();
            var touch = e.touches[0];
            var deltaX = touch.clientX - iPadHA.dragStartX;
            
            // Schieberegler finden
            var slider = document.querySelector('.tile-slider.dragging');
            if (slider) {
                Slider.updatePosition(slider, deltaX);
            }
        },

        // Touch End Handler
        handleTouchEnd: function(e) {
            if (!iPadHA.isDragging) return;
            
            e.preventDefault();
            iPadHA.isDragging = false;
            
            var slider = document.querySelector('.tile-slider.dragging');
            if (slider) {
                Slider.finishDrag(slider);
            }

            // Touch-Highlight entfernen
            var highlightedTiles = document.querySelectorAll('.touch-highlight');
            highlightedTiles.forEach(function(tile) {
                tile.classList.remove('touch-highlight');
            });
        }
    };

    // Schieberegler-Funktionalität
    var Slider = {
        // Aktuellen Wert abrufen
        getCurrentValue: function(slider) {
            var thumb = slider.querySelector('.slider-thumb');
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            var thumbLeft = parseInt(thumb.style.left) || 0;
            return Math.max(0, Math.min(100, (thumbLeft / rect.width) * 100));
        },

        // Position aktualisieren
        updatePosition: function(slider, deltaX) {
            var thumb = slider.querySelector('.slider-thumb');
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            var percentage = Math.max(0, Math.min(100, 
                iPadHA.startValue + (deltaX / rect.width) * 100));
            
            iPadHA.currentValue = percentage;
            thumb.style.left = percentage + '%';
            
            // Wert anzeigen
            var valueDisplay = slider.querySelector('.slider-value');
            if (valueDisplay) {
                valueDisplay.textContent = Math.round(percentage) + '%';
            }

            // Throttled Update an Home Assistant
            Slider.throttledUpdate(slider, percentage);
        },

        // Throttled Update
        throttledUpdate: Utils.throttle(function(slider, value) {
            var entityId = slider.closest('.tile').getAttribute('data-entity-id');
            if (entityId) {
                HomeAssistantAPI.setBrightness(entityId, value);
            }
        }, 50),

        // Drag beenden
        finishDrag: function(slider) {
            slider.classList.remove('dragging');
            var entityId = slider.closest('.tile').getAttribute('data-entity-id');
            if (entityId) {
                HomeAssistantAPI.setBrightness(entityId, iPadHA.currentValue);
            }
        }
    };

    // Navigation
    var Navigation = {
        // Tab wechseln
        switchTab: function(tabId) {
            // Alle Tabs deaktivieren
            var tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(function(tab) {
                tab.classList.remove('active');
            });

            // Alle Panels verstecken
            var panels = document.querySelectorAll('.tab-panel');
            panels.forEach(function(panel) {
                panel.classList.remove('active');
            });

            // Aktiven Tab aktivieren
            var activeTab = document.querySelector('[data-tab="' + tabId + '"]');
            if (activeTab) {
                activeTab.classList.add('active');
            }

            // Aktives Panel anzeigen
            var activePanel = document.getElementById(tabId);
            if (activePanel) {
                activePanel.classList.add('active');
            }

            // Analytics
            if (window.gtag) {
                gtag('event', 'tab_switch', {
                    'tab_id': tabId
                });
            }
        }
    };

    // Home Assistant API
    var HomeAssistantAPI = {
        baseURL: '',
        token: '',

        // API initialisieren
        init: function(config) {
            this.baseURL = config.homeAssistant.url;
            this.token = config.homeAssistant.token;
        },

        // REST API Call
        callAPI: function(endpoint, method, data) {
            var xhr = new XMLHttpRequest();
            xhr.open(method || 'GET', this.baseURL + endpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            if (this.token) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
            }

            return new Promise(function(resolve, reject) {
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var response = JSON.parse(xhr.responseText);
                                resolve(response);
                            } catch (e) {
                                resolve(xhr.responseText);
                            }
                        } else {
                            reject(new Error('API Error: ' + xhr.status + ' ' + xhr.statusText));
                        }
                    }
                };

                if (data) {
                    xhr.send(JSON.stringify(data));
                } else {
                    xhr.send();
                }
            });
        },

        // Entität umschalten
        toggleEntity: function(entityId) {
            var domain = entityId.split('.')[0];
            var service = domain === 'light' ? 'toggle' : 'toggle';
            
            return this.callAPI('/api/services/' + domain + '/' + service, 'POST', {
                entity_id: entityId
            });
        },

        // Helligkeit setzen
        setBrightness: function(entityId, brightness) {
            return this.callAPI('/api/services/light/turn_on', 'POST', {
                entity_id: entityId,
                brightness_pct: Math.round(brightness)
            });
        },

        // Entität Status abrufen
        getEntityState: function(entityId) {
            return this.callAPI('/api/states/' + entityId);
        },

        // Alle Entitäten abrufen
        getAllStates: function() {
            return this.callAPI('/api/states');
        }
    };

    // Actions
    var Actions = {
        // Aktion ausführen
        execute: function(action, element) {
            switch (action) {
                case 'refresh':
                    this.refresh();
                    break;
                case 'settings':
                    this.openSettings();
                    break;
                case 'fullscreen':
                    this.toggleFullscreen();
                    break;
                default:
                    console.log('Unknown action:', action);
            }
        },

        // Dashboard aktualisieren
        refresh: function() {
            location.reload();
        },

        // Einstellungen öffnen
        openSettings: function() {
            // Settings Modal öffnen
            console.log('Opening settings...');
        },

        // Vollbild umschalten
        toggleFullscreen: function() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
        }
    };

    // Dashboard initialisieren
    iPadHA.init = function(config) {
        if (this.isInitialized) {
            console.warn('iPadHA already initialized');
            return;
        }

        this.config = config || {};
        this.isIOS9 = detectIOS9();

        // iOS 9.3.5 Optimierungen aktivieren
        if (this.isIOS9) {
            document.body.classList.add('ios9-optimized');
            console.log('iOS 9.3.5 Optimierungen aktiv');
        }

        // Home Assistant API initialisieren
        if (config && config.homeAssistant) {
            HomeAssistantAPI.init(config.homeAssistant);
        }

        // Event Listeners initialisieren
        EventDelegation.initClickEvents();
        EventDelegation.initTouchEvents();

        // Auto-Refresh starten
        if (config && config.dashboard && config.dashboard.autoRefresh) {
            this.startAutoRefresh(config.dashboard.autoRefresh);
        }

        // Memory Management starten
        this.startMemoryManagement();

        // Zeit aktualisieren
        this.updateTime();
        setInterval(this.updateTime.bind(this), 1000);

        this.isInitialized = true;
        console.log('iPadHA initialized successfully');
    };

    // Auto-Refresh
    iPadHA.startAutoRefresh = function(interval) {
        setInterval(function() {
            HomeAssistantAPI.getAllStates().then(function(states) {
                iPadHA.updateEntityStates(states);
            }).catch(function(error) {
                console.error('Auto-refresh error:', error);
            });
        }, interval);
    };

    // Entity States aktualisieren
    iPadHA.updateEntityStates = function(states) {
        states.forEach(function(state) {
            var tile = document.querySelector('[data-entity-id="' + state.entity_id + '"]');
            if (tile) {
                iPadHA.updateTileState(tile, state);
            }
        });
    };

    // Tile State aktualisieren
    iPadHA.updateTileState = function(tile, state) {
        // Status-Indikator aktualisieren
        var indicator = tile.querySelector('.status-indicator');
        if (indicator) {
            indicator.className = 'status-indicator ' + state.state;
        }

        // Status-Text aktualisieren
        var statusText = tile.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = state.state === 'on' ? 'AN' : 'AUS';
        }

        // Helligkeit aktualisieren
        if (state.attributes && state.attributes.brightness !== undefined) {
            var slider = tile.querySelector('.tile-slider');
            if (slider) {
                var percentage = Math.round((state.attributes.brightness / 255) * 100);
                var thumb = slider.querySelector('.slider-thumb');
                var valueDisplay = slider.querySelector('.slider-value');
                
                if (thumb) {
                    thumb.style.left = percentage + '%';
                }
                if (valueDisplay) {
                    valueDisplay.textContent = percentage + '%';
                }
            }
        }

        // Sensor-Werte aktualisieren
        if (state.attributes && state.attributes.unit_of_measurement) {
            var value = tile.querySelector('.value');
            var unit = tile.querySelector('.unit');
            
            if (value) {
                value.textContent = state.state;
            }
            if (unit) {
                unit.textContent = state.attributes.unit_of_measurement;
            }
        }
    };

    // Zeit aktualisieren
    iPadHA.updateTime = function() {
        var timeElement = document.getElementById('current-time');
        if (timeElement) {
            var now = new Date();
            var timeString = now.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    };

    // Memory Management
    iPadHA.startMemoryManagement = function() {
        // Alle 30 Sekunden Garbage Collection
        setInterval(function() {
            Utils.forceGC();
        }, 30000);

        // Event Listener Cleanup bei Visibility Change
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                Utils.cleanup();
            }
        });
    };

    // Cleanup beim Verlassen der Seite
    window.addEventListener('beforeunload', function() {
        Utils.cleanup();
    });

    // Global verfügbar machen
    global.iPadHA = iPadHA;

})(window);
