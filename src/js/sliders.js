/**
 * Schieberegler-Funktionalität für iPadHA
 * Touch-optimierte Schieberegler für iOS 9.3.5
 * Performance und Bedienbarkeit im Fokus
 */

(function(global) {
    'use strict';

    // Schieberegler Manager
    var SliderManager = {
        sliders: [],
        activeSlider: null,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        startValue: 0,
        currentValue: 0,
        updateThrottle: 50, // ms
        updateTimer: null,

        // Alle Schieberegler initialisieren
        init: function() {
            this.sliders = Array.from(document.querySelectorAll('.tile-slider'));
            this.sliders.forEach(function(slider) {
                SliderManager.initSlider(slider);
            });
            console.log('SliderManager initialized with', this.sliders.length, 'sliders');
        },

        // Einzelnen Schieberegler initialisieren
        initSlider: function(slider) {
            var thumb = slider.querySelector('.slider-thumb');
            var track = slider.querySelector('.slider-track');
            
            if (!thumb || !track) {
                console.warn('Slider missing thumb or track element');
                return;
            }

            // Touch Events
            thumb.addEventListener('touchstart', function(e) {
                SliderManager.handleTouchStart(slider, e);
            }, { passive: false });

            thumb.addEventListener('touchmove', function(e) {
                SliderManager.handleTouchMove(slider, e);
            }, { passive: false });

            thumb.addEventListener('touchend', function(e) {
                SliderManager.handleTouchEnd(slider, e);
            }, { passive: false });

            // Mouse Events für Desktop
            thumb.addEventListener('mousedown', function(e) {
                SliderManager.handleMouseDown(slider, e);
            });

            // Track Click
            track.addEventListener('click', function(e) {
                SliderManager.handleTrackClick(slider, e);
            });

            // Initial Value setzen
            var initialValue = this.getSliderValue(slider);
            this.setSliderValue(slider, initialValue);
        },

        // Touch Start Handler
        handleTouchStart: function(slider, e) {
            e.preventDefault();
            e.stopPropagation();

            var touch = e.touches[0];
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            this.activeSlider = slider;
            this.isDragging = true;
            this.dragStartX = touch.clientX;
            this.dragStartY = touch.clientY;
            this.startValue = this.getSliderValue(slider);
            this.currentValue = this.startValue;

            // Visual Feedback
            slider.classList.add('dragging');
            thumb.classList.add('active');

            // Haptic Feedback
            this.hapticFeedback();

            // Event
            this.triggerEvent(slider, 'sliderStart', {
                value: this.startValue,
                touch: touch
            });
        },

        // Touch Move Handler
        handleTouchMove: function(slider, e) {
            if (!this.isDragging || this.activeSlider !== slider) return;
            
            e.preventDefault();
            e.stopPropagation();

            var touch = e.touches[0];
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            var deltaX = touch.clientX - this.dragStartX;
            var percentage = Math.max(0, Math.min(100, 
                this.startValue + (deltaX / rect.width) * 100));
            
            this.currentValue = percentage;
            this.updateSlider(slider, percentage);

            // Event
            this.triggerEvent(slider, 'sliderMove', {
                value: percentage,
                touch: touch
            });
        },

        // Touch End Handler
        handleTouchEnd: function(slider, e) {
            if (!this.isDragging || this.activeSlider !== slider) return;
            
            e.preventDefault();
            e.stopPropagation();

            this.isDragging = false;
            this.activeSlider = null;

            // Visual Feedback entfernen
            slider.classList.remove('dragging');
            var thumb = slider.querySelector('.slider-thumb');
            if (thumb) {
                thumb.classList.remove('active');
            }

            // Final Value setzen
            this.setSliderValue(slider, this.currentValue);

            // Home Assistant Update
            this.updateHomeAssistant(slider, this.currentValue);

            // Event
            this.triggerEvent(slider, 'sliderEnd', {
                value: this.currentValue
            });
        },

        // Mouse Down Handler
        handleMouseDown: function(slider, e) {
            e.preventDefault();
            e.stopPropagation();

            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            this.activeSlider = slider;
            this.isDragging = true;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.startValue = this.getSliderValue(slider);
            this.currentValue = this.startValue;

            // Visual Feedback
            slider.classList.add('dragging');
            var thumb = slider.querySelector('.slider-thumb');
            if (thumb) {
                thumb.classList.add('active');
            }

            // Mouse Events
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));

            // Event
            this.triggerEvent(slider, 'sliderStart', {
                value: this.startValue,
                mouse: e
            });
        },

        // Mouse Move Handler
        handleMouseMove: function(e) {
            if (!this.isDragging || !this.activeSlider) return;
            
            e.preventDefault();

            var slider = this.activeSlider;
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            var deltaX = e.clientX - this.dragStartX;
            var percentage = Math.max(0, Math.min(100, 
                this.startValue + (deltaX / rect.width) * 100));
            
            this.currentValue = percentage;
            this.updateSlider(slider, percentage);

            // Event
            this.triggerEvent(slider, 'sliderMove', {
                value: percentage,
                mouse: e
            });
        },

        // Mouse Up Handler
        handleMouseUp: function(e) {
            if (!this.isDragging || !this.activeSlider) return;
            
            var slider = this.activeSlider;
            
            this.isDragging = false;
            this.activeSlider = null;

            // Visual Feedback entfernen
            slider.classList.remove('dragging');
            var thumb = slider.querySelector('.slider-thumb');
            if (thumb) {
                thumb.classList.remove('active');
            }

            // Mouse Events entfernen
            document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            document.removeEventListener('mouseup', this.handleMouseUp.bind(this));

            // Final Value setzen
            this.setSliderValue(slider, this.currentValue);

            // Home Assistant Update
            this.updateHomeAssistant(slider, this.currentValue);

            // Event
            this.triggerEvent(slider, 'sliderEnd', {
                value: this.currentValue
            });
        },

        // Track Click Handler
        handleTrackClick: function(slider, e) {
            if (this.isDragging) return;
            
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            var clickX = e.clientX || (e.touches && e.touches[0].clientX);
            
            if (clickX) {
                var percentage = Math.max(0, Math.min(100, 
                    ((clickX - rect.left) / rect.width) * 100));
                
                this.setSliderValue(slider, percentage);
                this.updateHomeAssistant(slider, percentage);

                // Event
                this.triggerEvent(slider, 'sliderClick', {
                    value: percentage
                });
            }
        },

        // Schieberegler-Wert abrufen
        getSliderValue: function(slider) {
            var thumb = slider.querySelector('.slider-thumb');
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            var thumbLeft = parseInt(thumb.style.left) || 0;
            return Math.max(0, Math.min(100, (thumbLeft / rect.width) * 100));
        },

        // Schieberegler-Wert setzen
        setSliderValue: function(slider, value) {
            var thumb = slider.querySelector('.slider-thumb');
            var valueDisplay = slider.querySelector('.slider-value');
            
            if (thumb) {
                thumb.style.left = value + '%';
            }
            if (valueDisplay) {
                valueDisplay.textContent = Math.round(value) + '%';
            }
        },

        // Schieberegler aktualisieren (ohne Home Assistant Update)
        updateSlider: function(slider, value) {
            this.setSliderValue(slider, value);
            
            // Throttled Update
            this.throttledUpdate(slider, value);
        },

        // Throttled Update
        throttledUpdate: function(slider, value) {
            if (this.updateTimer) {
                clearTimeout(this.updateTimer);
            }
            
            this.updateTimer = setTimeout(function() {
                SliderManager.updateHomeAssistant(slider, value);
                SliderManager.updateTimer = null;
            }, this.updateThrottle);
        },

        // Home Assistant Update
        updateHomeAssistant: function(slider, value) {
            var entityId = slider.closest('.tile').getAttribute('data-entity-id');
            if (!entityId) return;

            // Home Assistant API aufrufen
            if (window.iPadHA && window.iPadHA.HomeAssistantAPI) {
                window.iPadHA.HomeAssistantAPI.setBrightness(entityId, value);
            } else {
                // Fallback: Direkter API Call
                this.callHomeAssistantAPI(entityId, value);
            }
        },

        // Fallback Home Assistant API Call
        callHomeAssistantAPI: function(entityId, brightness) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/services/light/turn_on', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('Brightness updated for', entityId, 'to', brightness + '%');
                    } else {
                        console.error('Failed to update brightness:', xhr.status, xhr.statusText);
                    }
                }
            };
            
            xhr.send(JSON.stringify({
                entity_id: entityId,
                brightness_pct: Math.round(brightness)
            }));
        },

        // Event auslösen
        triggerEvent: function(slider, eventName, detail) {
            var event = new CustomEvent('slider' + eventName, {
                detail: detail
            });
            slider.dispatchEvent(event);
        },

        // Haptic Feedback
        hapticFeedback: function() {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        },

        // Schieberegler von außen aktualisieren
        updateSliderFromExternal: function(entityId, value) {
            var slider = document.querySelector('[data-entity-id="' + entityId + '"] .tile-slider');
            if (slider) {
                this.setSliderValue(slider, value);
            }
        },

        // Alle Schieberegler aktualisieren
        updateAllSliders: function(entityStates) {
            var self = this;
            entityStates.forEach(function(state) {
                if (state.attributes && state.attributes.brightness !== undefined) {
                    var percentage = Math.round((state.attributes.brightness / 255) * 100);
                    self.updateSliderFromExternal(state.entity_id, percentage);
                }
            });
        }
    };

    // Schieberegler-Animationen
    var SliderAnimations = {
        // Smooth Animation
        animateToValue: function(slider, targetValue, duration) {
            var startValue = SliderManager.getSliderValue(slider);
            var startTime = Date.now();
            var duration = duration || 300;

            function animate() {
                var elapsed = Date.now() - startTime;
                var progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                var eased = 1 - Math.pow(1 - progress, 3);
                var currentValue = startValue + (targetValue - startValue) * eased;
                
                SliderManager.setSliderValue(slider, currentValue);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            
            requestAnimationFrame(animate);
        },

        // Pulse Animation
        pulse: function(slider) {
            var thumb = slider.querySelector('.slider-thumb');
            if (!thumb) return;
            
            thumb.classList.add('pulse');
            setTimeout(function() {
                thumb.classList.remove('pulse');
            }, 200);
        }
    };

    // Schieberegler-Validierung
    var SliderValidation = {
        // Wert validieren
        validateValue: function(value) {
            return Math.max(0, Math.min(100, parseFloat(value) || 0));
        },

        // Schieberegler-Status prüfen
        isSliderValid: function(slider) {
            var thumb = slider.querySelector('.slider-thumb');
            var track = slider.querySelector('.slider-track');
            var valueDisplay = slider.querySelector('.slider-value');
            
            return !!(thumb && track && valueDisplay);
        },

        // Fehlerbehandlung
        handleError: function(slider, error) {
            console.error('Slider error:', error);
            slider.classList.add('error');
            
            setTimeout(function() {
                slider.classList.remove('error');
            }, 1000);
        }
    };

    // Initialisierung
    function init() {
        // Schieberegler initialisieren
        SliderManager.init();

        // Event Listener für externe Updates
        document.addEventListener('entityStateUpdate', function(e) {
            if (e.detail && e.detail.attributes && e.detail.attributes.brightness !== undefined) {
                var percentage = Math.round((e.detail.attributes.brightness / 255) * 100);
                SliderManager.updateSliderFromExternal(e.detail.entity_id, percentage);
            }
        });

        console.log('Sliders initialized');
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Global verfügbar machen
    global.SliderManager = SliderManager;
    global.SliderAnimations = SliderAnimations;
    global.SliderValidation = SliderValidation;

})(window);
