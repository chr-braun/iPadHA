/**
 * iOS 9.3.5 spezifische JavaScript-Optimierungen
 * Performance und Kompatibilität für ältere Safari-Versionen
 */

(function(global) {
    'use strict';

    // iOS 9.3.5 Detection
    var isIOS9 = function() {
        var userAgent = navigator.userAgent;
        var iOS = /iPad|iPhone|iPod/.test(userAgent);
        var version = userAgent.match(/OS (\d+)_(\d+)/);
        return iOS && version && parseInt(version[1]) === 9 && parseInt(version[2]) <= 3;
    };

    // Performance Optimierungen
    var PerformanceOptimizer = {
        // Memory Management
        memoryManager: {
            objects: [],
            maxObjects: 1000,
            
            // Objekt registrieren
            register: function(obj) {
                this.objects.push(obj);
                if (this.objects.length > this.maxObjects) {
                    this.cleanup();
                }
            },
            
            // Cleanup
            cleanup: function() {
                this.objects = this.objects.slice(-this.maxObjects / 2);
                this.forceGC();
            },
            
            // Garbage Collection
            forceGC: function() {
                if (window.gc) {
                    window.gc();
                }
            }
        },

        // Event Delegation
        eventDelegation: {
            listeners: [],
            
            // Event Listener hinzufügen
            add: function(element, event, handler) {
                element.addEventListener(event, handler);
                this.listeners.push({ element: element, event: event, handler: handler });
            },
            
            // Cleanup
            cleanup: function() {
                this.listeners.forEach(function(listener) {
                    listener.element.removeEventListener(listener.event, listener.handler);
                });
                this.listeners = [];
            }
        },

        // Throttling
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

        // Debouncing
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
        }
    };

    // iOS 9.3.5 Polyfills
    var Polyfills = {
        // Array Polyfills
        initArrayPolyfills: function() {
            // forEach
            if (!Array.prototype.forEach) {
                Array.prototype.forEach = function(callback, thisArg) {
                    for (var i = 0; i < this.length; i++) {
                        callback.call(thisArg, this[i], i, this);
                    }
                };
            }

            // filter
            if (!Array.prototype.filter) {
                Array.prototype.filter = function(callback, thisArg) {
                    var result = [];
                    for (var i = 0; i < this.length; i++) {
                        if (callback.call(thisArg, this[i], i, this)) {
                            result.push(this[i]);
                        }
                    }
                    return result;
                };
            }

            // map
            if (!Array.prototype.map) {
                Array.prototype.map = function(callback, thisArg) {
                    var result = [];
                    for (var i = 0; i < this.length; i++) {
                        result.push(callback.call(thisArg, this[i], i, this));
                    }
                    return result;
                };
            }

            // find
            if (!Array.prototype.find) {
                Array.prototype.find = function(callback, thisArg) {
                    for (var i = 0; i < this.length; i++) {
                        if (callback.call(thisArg, this[i], i, this)) {
                            return this[i];
                        }
                    }
                    return undefined;
                };
            }

            // includes
            if (!Array.prototype.includes) {
                Array.prototype.includes = function(searchElement, fromIndex) {
                    var from = fromIndex || 0;
                    for (var i = from; i < this.length; i++) {
                        if (this[i] === searchElement) {
                            return true;
                        }
                    }
                    return false;
                };
            }
        },

        // Object Polyfills
        initObjectPolyfills: function() {
            // assign
            if (!Object.assign) {
                Object.assign = function(target) {
                    for (var i = 1; i < arguments.length; i++) {
                        var source = arguments[i];
                        for (var key in source) {
                            if (source.hasOwnProperty(key)) {
                                target[key] = source[key];
                            }
                        }
                    }
                    return target;
                };
            }

            // keys
            if (!Object.keys) {
                Object.keys = function(obj) {
                    var keys = [];
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            keys.push(key);
                        }
                    }
                    return keys;
                };
            }
        },

        // String Polyfills
        initStringPolyfills: function() {
            // startsWith
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function(searchString, position) {
                    position = position || 0;
                    return this.indexOf(searchString, position) === position;
                };
            }

            // endsWith
            if (!String.prototype.endsWith) {
                String.prototype.endsWith = function(searchString, length) {
                    if (length === undefined || length > this.length) {
                        length = this.length;
                    }
                    return this.indexOf(searchString, length - searchString.length) !== -1;
                };
            }

            // includes
            if (!String.prototype.includes) {
                String.prototype.includes = function(search, start) {
                    if (typeof start !== 'number') {
                        start = 0;
                    }
                    if (start + search.length > this.length) {
                        return false;
                    } else {
                        return this.indexOf(search, start) !== -1;
                    }
                };
            }
        },

        // Promise Polyfill (vereinfacht)
        initPromisePolyfill: function() {
            if (!window.Promise) {
                window.Promise = function(executor) {
                    var self = this;
                    self.state = 'pending';
                    self.value = undefined;
                    self.handlers = [];
                    
                    function resolve(result) {
                        if (self.state === 'pending') {
                            self.state = 'fulfilled';
                            self.value = result;
                            self.handlers.forEach(handle);
                            self.handlers = null;
                        }
                    }
                    
                    function reject(error) {
                        if (self.state === 'pending') {
                            self.state = 'rejected';
                            self.value = error;
                            self.handlers.forEach(handle);
                            self.handlers = null;
                        }
                    }
                    
                    function handle(handler) {
                        if (self.state === 'pending') {
                            self.handlers.push(handler);
                        } else {
                            if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                                handler.onFulfilled(self.value);
                            }
                            if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                                handler.onRejected(self.value);
                            }
                        }
                    }
                    
                    this.then = function(onFulfilled, onRejected) {
                        return new Promise(function(resolve, reject) {
                            handle({
                                onFulfilled: function(result) {
                                    try {
                                        resolve(onFulfilled ? onFulfilled(result) : result);
                                    } catch (ex) {
                                        reject(ex);
                                    }
                                },
                                onRejected: function(error) {
                                    try {
                                        resolve(onRejected ? onRejected(error) : error);
                                    } catch (ex) {
                                        reject(ex);
                                    }
                                }
                            });
                        });
                    };
                    
                    executor(resolve, reject);
                };
            }
        },

        // Alle Polyfills initialisieren
        init: function() {
            this.initArrayPolyfills();
            this.initObjectPolyfills();
            this.initStringPolyfills();
            this.initPromisePolyfill();
            console.log('iOS 9.3.5 polyfills initialized');
        }
    };

    // Touch-Optimierungen
    var TouchOptimizer = {
        // Touch-Events optimieren
        optimizeTouchEvents: function() {
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

            // Touch-Action setzen
            var touchElements = document.querySelectorAll('.tile, .nav-tab, .touch-button, .slider-thumb');
            touchElements.forEach(function(element) {
                element.style.touchAction = 'manipulation';
                element.style.webkitTouchCallout = 'none';
                element.style.webkitUserSelect = 'none';
                element.style.userSelect = 'none';
            });
        },

        // Hardware-Beschleunigung aktivieren
        enableHardwareAcceleration: function() {
            var animatedElements = document.querySelectorAll('.tile, .nav-tab, .slider-thumb, .glass-card');
            animatedElements.forEach(function(element) {
                element.style.transform = 'translateZ(0)';
                element.style.webkitTransform = 'translateZ(0)';
                element.style.willChange = 'transform';
                element.style.webkitWillChange = 'transform';
            });
        },

        // Touch-Feedback optimieren
        optimizeTouchFeedback: function() {
            var touchElements = document.querySelectorAll('.tile, .nav-tab, .touch-button');
            touchElements.forEach(function(element) {
                element.addEventListener('touchstart', function() {
                    this.classList.add('touch-active');
                }, { passive: true });

                element.addEventListener('touchend', function() {
                    var self = this;
                    setTimeout(function() {
                        self.classList.remove('touch-active');
                    }, 150);
                }, { passive: true });
            });
        }
    };

    // Memory Management
    var MemoryManager = {
        // Memory Usage überwachen
        monitorMemory: function() {
            if (window.performance && window.performance.memory) {
                setInterval(function() {
                    var memory = window.performance.memory;
                    var used = memory.usedJSHeapSize / 1024 / 1024; // MB
                    var total = memory.totalJSHeapSize / 1024 / 1024; // MB
                    
                    if (used > 50) { // Mehr als 50MB
                        console.warn('High memory usage:', used.toFixed(2) + 'MB');
                        PerformanceOptimizer.memoryManager.cleanup();
                    }
                }, 30000); // Alle 30 Sekunden
            }
        },

        // Event Listener Cleanup
        cleanupEventListeners: function() {
            PerformanceOptimizer.eventDelegation.cleanup();
        },

        // Garbage Collection
        forceGC: function() {
            PerformanceOptimizer.memoryManager.forceGC();
        }
    };

    // Safari-spezifische Fixes
    var SafariFixes = {
        // CSS Transform Fixes
        fixTransforms: function() {
            var elements = document.querySelectorAll('.tile, .nav-tab, .slider-thumb');
            elements.forEach(function(element) {
                element.style.webkitTransform = 'translateZ(0)';
                element.style.transform = 'translateZ(0)';
            });
        },

        // Scroll Fixes
        fixScrolling: function() {
            var scrollElements = document.querySelectorAll('.touch-scroll, .dashboard-nav');
            scrollElements.forEach(function(element) {
                element.style.webkitOverflowScrolling = 'touch';
                element.style.overflowScrolling = 'touch';
            });
        },

        // Input Fixes
        fixInputs: function() {
            var inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                input.style.webkitAppearance = 'none';
                input.style.borderRadius = '8px';
            });
        }
    };

    // Initialisierung
    function init() {
        if (isIOS9()) {
            console.log('iOS 9.3.5 detected, applying optimizations...');
            
            // Polyfills laden
            Polyfills.init();
            
            // Touch-Optimierungen
            TouchOptimizer.optimizeTouchEvents();
            TouchOptimizer.enableHardwareAcceleration();
            TouchOptimizer.optimizeTouchFeedback();
            
            // Safari-Fixes
            SafariFixes.fixTransforms();
            SafariFixes.fixScrolling();
            SafariFixes.fixInputs();
            
            // Memory Management
            MemoryManager.monitorMemory();
            
            // Performance-Optimierungen
            PerformanceOptimizer.memoryManager.register(window);
            
            console.log('iOS 9.3.5 optimizations applied');
        }
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Global verfügbar machen
    global.PerformanceOptimizer = PerformanceOptimizer;
    global.TouchOptimizer = TouchOptimizer;
    global.MemoryManager = MemoryManager;
    global.SafariFixes = SafariFixes;
    global.isIOS9 = isIOS9;

})(window);
