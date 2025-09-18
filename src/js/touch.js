/**
 * Touch-Event Handler für iPadHA
 * Speziell für iOS 9.3.5 Safari optimiert
 * Performance und Bedienbarkeit im Fokus
 */

(function(global) {
    'use strict';

    // Touch Manager
    var TouchManager = {
        // Touch-Events sammeln
        touches: [],
        touchStartTime: 0,
        touchStartPosition: { x: 0, y: 0 },
        touchEndPosition: { x: 0, y: 0 },
        isDragging: false,
        dragThreshold: 10, // Pixel-Schwellenwert für Drag-Erkennung
        swipeThreshold: 50, // Pixel-Schwellenwert für Swipe-Erkennung
        longPressThreshold: 500, // Millisekunden für Long Press
        longPressTimer: null,

        // Touch Start Handler
        handleTouchStart: function(e) {
            e.preventDefault();
            
            this.touches = Array.from(e.touches);
            this.touchStartTime = Date.now();
            this.touchStartPosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };

            // Long Press Timer starten
            this.startLongPressTimer(e);

            // Touch-Feedback
            this.addTouchFeedback(e.target);
        },

        // Touch Move Handler
        handleTouchMove: function(e) {
            e.preventDefault();
            
            if (this.touches.length === 0) return;

            var currentTouch = e.touches[0];
            var deltaX = currentTouch.clientX - this.touchStartPosition.x;
            var deltaY = currentTouch.clientY - this.touchStartPosition.y;
            var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Drag-Erkennung
            if (distance > this.dragThreshold && !this.isDragging) {
                this.isDragging = true;
                this.startDrag(e);
            }

            // Drag-Update
            if (this.isDragging) {
                this.updateDrag(e);
            }
        },

        // Touch End Handler
        handleTouchEnd: function(e) {
            e.preventDefault();
            
            var touchDuration = Date.now() - this.touchStartTime;
            var deltaX = e.changedTouches[0].clientX - this.touchStartPosition.x;
            var deltaY = e.changedTouches[0].clientY - this.touchStartPosition.y;
            var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Long Press Timer stoppen
            this.stopLongPressTimer();

            // Touch-Feedback entfernen
            this.removeTouchFeedback(e.target);

            // Drag beenden
            if (this.isDragging) {
                this.endDrag(e);
                return;
            }

            // Swipe-Erkennung
            if (distance > this.swipeThreshold && touchDuration < 300) {
                this.handleSwipe(e, deltaX, deltaY);
                return;
            }

            // Tap-Erkennung
            if (distance < this.dragThreshold && touchDuration < 300) {
                this.handleTap(e);
            }
        },

        // Long Press Timer
        startLongPressTimer: function(e) {
            var self = this;
            this.longPressTimer = setTimeout(function() {
                self.handleLongPress(e);
            }, this.longPressThreshold);
        },

        stopLongPressTimer: function() {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        },

        // Long Press Handler
        handleLongPress: function(e) {
            var target = e.target.closest('.tile');
            if (target) {
                this.triggerLongPress(target, e);
            }
        },

        // Tap Handler
        handleTap: function(e) {
            var target = e.target.closest('.tile, .touch-button, .nav-tab');
            if (target) {
                this.triggerTap(target, e);
            }
        },

        // Swipe Handler
        handleSwipe: function(e, deltaX, deltaY) {
            var direction = this.getSwipeDirection(deltaX, deltaY);
            var target = e.target.closest('.swipeable');
            
            if (target) {
                this.triggerSwipe(target, direction, e);
            }
        },

        // Swipe-Richtung ermitteln
        getSwipeDirection: function(deltaX, deltaY) {
            var absX = Math.abs(deltaX);
            var absY = Math.abs(deltaY);
            
            if (absX > absY) {
                return deltaX > 0 ? 'right' : 'left';
            } else {
                return deltaY > 0 ? 'down' : 'up';
            }
        },

        // Drag Start
        startDrag: function(e) {
            var target = e.target.closest('.draggable');
            if (target) {
                target.classList.add('dragging');
                this.triggerDragStart(target, e);
            }
        },

        // Drag Update
        updateDrag: function(e) {
            var target = document.querySelector('.dragging');
            if (target) {
                this.triggerDragUpdate(target, e);
            }
        },

        // Drag End
        endDrag: function(e) {
            var target = document.querySelector('.dragging');
            if (target) {
                target.classList.remove('dragging');
                this.triggerDragEnd(target, e);
            }
            this.isDragging = false;
        },

        // Touch-Feedback hinzufügen
        addTouchFeedback: function(element) {
            var target = element.closest('.touch-target, .tile, .touch-button');
            if (target) {
                target.classList.add('touch-feedback');
            }
        },

        // Touch-Feedback entfernen
        removeTouchFeedback: function(element) {
            var target = element.closest('.touch-target, .tile, .touch-button');
            if (target) {
                setTimeout(function() {
                    target.classList.remove('touch-feedback');
                }, 150);
            }
        },

        // Event Trigger
        triggerTap: function(target, e) {
            var event = new CustomEvent('touchTap', {
                detail: { target: target, originalEvent: e }
            });
            target.dispatchEvent(event);
        },

        triggerLongPress: function(target, e) {
            var event = new CustomEvent('touchLongPress', {
                detail: { target: target, originalEvent: e }
            });
            target.dispatchEvent(event);
        },

        triggerSwipe: function(target, direction, e) {
            var event = new CustomEvent('touchSwipe', {
                detail: { target: target, direction: direction, originalEvent: e }
            });
            target.dispatchEvent(event);
        },

        triggerDragStart: function(target, e) {
            var event = new CustomEvent('touchDragStart', {
                detail: { target: target, originalEvent: e }
            });
            target.dispatchEvent(event);
        },

        triggerDragUpdate: function(target, e) {
            var event = new CustomEvent('touchDragUpdate', {
                detail: { target: target, originalEvent: e }
            });
            target.dispatchEvent(event);
        },

        triggerDragEnd: function(target, e) {
            var event = new CustomEvent('touchDragEnd', {
                detail: { target: target, originalEvent: e }
            });
            target.dispatchEvent(event);
        }
    };

    // Schieberegler Touch-Handler
    var SliderTouchHandler = {
        // Schieberegler initialisieren
        init: function() {
            var sliders = document.querySelectorAll('.tile-slider');
            sliders.forEach(function(slider) {
                SliderTouchHandler.attachEvents(slider);
            });
        },

        // Events anhängen
        attachEvents: function(slider) {
            var thumb = slider.querySelector('.slider-thumb');
            if (!thumb) return;

            // Touch Events
            thumb.addEventListener('touchstart', function(e) {
                SliderTouchHandler.handleTouchStart(slider, e);
            }, { passive: false });

            thumb.addEventListener('touchmove', function(e) {
                SliderTouchHandler.handleTouchMove(slider, e);
            }, { passive: false });

            thumb.addEventListener('touchend', function(e) {
                SliderTouchHandler.handleTouchEnd(slider, e);
            }, { passive: false });

            // Mouse Events für Desktop
            thumb.addEventListener('mousedown', function(e) {
                SliderTouchHandler.handleMouseDown(slider, e);
            });
        },

        // Touch Start
        handleTouchStart: function(slider, e) {
            e.preventDefault();
            e.stopPropagation();

            var touch = e.touches[0];
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            slider.classList.add('dragging');
            slider.startX = touch.clientX;
            slider.startValue = SliderTouchHandler.getCurrentValue(slider);
            slider.rect = rect;

            // Haptic Feedback
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        },

        // Touch Move
        handleTouchMove: function(slider, e) {
            if (!slider.classList.contains('dragging')) return;
            
            e.preventDefault();
            e.stopPropagation();

            var touch = e.touches[0];
            var deltaX = touch.clientX - slider.startX;
            var percentage = Math.max(0, Math.min(100, 
                slider.startValue + (deltaX / slider.rect.width) * 100));
            
            SliderTouchHandler.updateSlider(slider, percentage);
        },

        // Touch End
        handleTouchEnd: function(slider, e) {
            if (!slider.classList.contains('dragging')) return;
            
            e.preventDefault();
            e.stopPropagation();

            slider.classList.remove('dragging');
            var finalValue = SliderTouchHandler.getCurrentValue(slider);
            SliderTouchHandler.finishSlider(slider, finalValue);
        },

        // Mouse Down
        handleMouseDown: function(slider, e) {
            e.preventDefault();
            e.stopPropagation();

            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            
            slider.classList.add('dragging');
            slider.startX = e.clientX;
            slider.startValue = SliderTouchHandler.getCurrentValue(slider);
            slider.rect = rect;

            // Mouse Events
            document.addEventListener('mousemove', function mouseMove(e) {
                SliderTouchHandler.handleMouseMove(slider, e);
            });

            document.addEventListener('mouseup', function mouseUp(e) {
                SliderTouchHandler.handleMouseUp(slider, e);
                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('mouseup', mouseUp);
            });
        },

        // Mouse Move
        handleMouseMove: function(slider, e) {
            if (!slider.classList.contains('dragging')) return;
            
            e.preventDefault();
            var deltaX = e.clientX - slider.startX;
            var percentage = Math.max(0, Math.min(100, 
                slider.startValue + (deltaX / slider.rect.width) * 100));
            
            SliderTouchHandler.updateSlider(slider, percentage);
        },

        // Mouse Up
        handleMouseUp: function(slider, e) {
            if (!slider.classList.contains('dragging')) return;
            
            slider.classList.remove('dragging');
            var finalValue = SliderTouchHandler.getCurrentValue(slider);
            SliderTouchHandler.finishSlider(slider, finalValue);
        },

        // Aktuellen Wert abrufen
        getCurrentValue: function(slider) {
            var thumb = slider.querySelector('.slider-thumb');
            var track = slider.querySelector('.slider-track');
            var rect = track.getBoundingClientRect();
            var thumbLeft = parseInt(thumb.style.left) || 0;
            return Math.max(0, Math.min(100, (thumbLeft / rect.width) * 100));
        },

        // Schieberegler aktualisieren
        updateSlider: function(slider, percentage) {
            var thumb = slider.querySelector('.slider-thumb');
            var valueDisplay = slider.querySelector('.slider-value');
            
            if (thumb) {
                thumb.style.left = percentage + '%';
            }
            if (valueDisplay) {
                valueDisplay.textContent = Math.round(percentage) + '%';
            }

            // Throttled Update
            SliderTouchHandler.throttledUpdate(slider, percentage);
        },

        // Throttled Update
        throttledUpdate: function(slider, value) {
            if (!slider.updateTimer) {
                slider.updateTimer = setTimeout(function() {
                    var entityId = slider.closest('.tile').getAttribute('data-entity-id');
                    if (entityId && window.iPadHA) {
                        window.iPadHA.HomeAssistantAPI.setBrightness(entityId, value);
                    }
                    slider.updateTimer = null;
                }, 50);
            }
        },

        // Schieberegler beenden
        finishSlider: function(slider, value) {
            var entityId = slider.closest('.tile').getAttribute('data-entity-id');
            if (entityId && window.iPadHA) {
                window.iPadHA.HomeAssistantAPI.setBrightness(entityId, value);
            }
        }
    };

    // Swipe-Navigation
    var SwipeNavigation = {
        // Swipe-Navigation initialisieren
        init: function() {
            var swipeable = document.querySelector('.dashboard-main');
            if (swipeable) {
                swipeable.classList.add('swipeable');
                this.attachSwipeEvents(swipeable);
            }
        },

        // Swipe-Events anhängen
        attachSwipeEvents: function(element) {
            element.addEventListener('touchSwipe', function(e) {
                SwipeNavigation.handleSwipe(e.detail.direction);
            });
        },

        // Swipe verarbeiten
        handleSwipe: function(direction) {
            var currentTab = document.querySelector('.nav-tab.active');
            if (!currentTab) return;

            var tabs = Array.from(document.querySelectorAll('.nav-tab'));
            var currentIndex = tabs.indexOf(currentTab);
            var nextIndex = currentIndex;

            switch (direction) {
                case 'left':
                    nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
                    break;
                case 'right':
                    nextIndex = Math.max(currentIndex - 1, 0);
                    break;
            }

            if (nextIndex !== currentIndex) {
                var nextTab = tabs[nextIndex];
                var tabId = nextTab.getAttribute('data-tab');
                if (tabId && window.iPadHA) {
                    window.iPadHA.Navigation.switchTab(tabId);
                }
            }
        }
    };

    // Touch-Event Initialisierung
    function initTouchEvents() {
        // Touch Manager initialisieren
        document.addEventListener('touchstart', function(e) {
            TouchManager.handleTouchStart(e);
        }, { passive: false });

        document.addEventListener('touchmove', function(e) {
            TouchManager.handleTouchMove(e);
        }, { passive: false });

        document.addEventListener('touchend', function(e) {
            TouchManager.handleTouchEnd(e);
        }, { passive: false });

        // Schieberegler initialisieren
        SliderTouchHandler.init();

        // Swipe-Navigation initialisieren
        SwipeNavigation.init();

        console.log('Touch events initialized');
    }

    // iOS 9.3.5 spezifische Optimierungen
    function initIOS9Optimizations() {
        // Prevent Zoom
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent Context Menu
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        // Prevent Text Selection
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
        });

        // Hardware-Beschleunigung für alle animierten Elemente
        var animatedElements = document.querySelectorAll('.tile, .nav-tab, .slider-thumb');
        animatedElements.forEach(function(element) {
            element.style.transform = 'translateZ(0)';
            element.style.webkitTransform = 'translateZ(0)';
        });

        console.log('iOS 9.3.5 optimizations applied');
    }

    // Initialisierung
    function init() {
        // Touch-Events initialisieren
        initTouchEvents();

        // iOS 9.3.5 Optimierungen
        if (navigator.userAgent.indexOf('Safari') !== -1) {
            initIOS9Optimizations();
        }
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Global verfügbar machen
    global.TouchManager = TouchManager;
    global.SliderTouchHandler = SliderTouchHandler;
    global.SwipeNavigation = SwipeNavigation;

})(window);
