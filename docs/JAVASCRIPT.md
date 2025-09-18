# iPadHA JavaScript Dokumentation

## Übersicht

Das iPadHA JavaScript Framework ist speziell für iOS 9.3.5 Safari optimiert und bietet Touch-optimierte Events, Performance-Optimierungen und umfassende Kompatibilität für ältere Browser.

## JavaScript-Architektur

```
src/js/
├── ipadha.js           # Haupt-JavaScript mit Core-Funktionalität
├── touch.js            # Touch-Event Handler und Gesten
├── sliders.js          # Schieberegler-Funktionalität
└── ios9-optimizations.js # iOS 9.3.5 spezifische Optimierungen
```

## Core-Funktionalität

### iPadHA Namespace

```javascript
var iPadHA = {
    version: '1.0.0',
    config: {},
    entities: {},
    eventListeners: [],
    isInitialized: false,
    isIOS9: false
};
```

### Initialisierung

```javascript
// iPadHA initialisieren
iPadHA.init({
    homeAssistant: {
        url: 'http://localhost:8123',
        token: 'YOUR_LONG_LIVED_ACCESS_TOKEN'
    },
    dashboard: {
        autoRefresh: 5000,
        touchOptimized: true
    }
});
```

## Touch-Event System

### Touch Manager

```javascript
var TouchManager = {
    touches: [],
    touchStartTime: 0,
    touchStartPosition: { x: 0, y: 0 },
    isDragging: false,
    dragThreshold: 10,
    swipeThreshold: 50,
    longPressThreshold: 500
};
```

### Touch-Events

**Touch Start:**
```javascript
TouchManager.handleTouchStart = function(e) {
    e.preventDefault();
    this.touches = Array.from(e.touches);
    this.touchStartTime = Date.now();
    this.touchStartPosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
    };
};
```

**Touch Move:**
```javascript
TouchManager.handleTouchMove = function(e) {
    e.preventDefault();
    if (this.touches.length === 0) return;
    
    var currentTouch = e.touches[0];
    var deltaX = currentTouch.clientX - this.touchStartPosition.x;
    var deltaY = currentTouch.clientY - this.touchStartPosition.y;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > this.dragThreshold && !this.isDragging) {
        this.isDragging = true;
        this.startDrag(e);
    }
};
```

**Touch End:**
```javascript
TouchManager.handleTouchEnd = function(e) {
    e.preventDefault();
    var touchDuration = Date.now() - this.touchStartTime;
    var deltaX = e.changedTouches[0].clientX - this.touchStartPosition.x;
    var deltaY = e.changedTouches[0].clientY - this.touchStartPosition.y;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > this.swipeThreshold && touchDuration < 300) {
        this.handleSwipe(e, deltaX, deltaY);
    } else if (distance < this.dragThreshold && touchDuration < 300) {
        this.handleTap(e);
    }
};
```

### Touch-Gesten

**Tap:**
```javascript
TouchManager.handleTap = function(e) {
    var target = e.target.closest('.tile, .touch-button, .nav-tab');
    if (target) {
        this.triggerTap(target, e);
    }
};
```

**Long Press:**
```javascript
TouchManager.handleLongPress = function(e) {
    var target = e.target.closest('.tile');
    if (target) {
        this.triggerLongPress(target, e);
    }
};
```

**Swipe:**
```javascript
TouchManager.handleSwipe = function(e, deltaX, deltaY) {
    var direction = this.getSwipeDirection(deltaX, deltaY);
    var target = e.target.closest('.swipeable');
    
    if (target) {
        this.triggerSwipe(target, direction, e);
    }
};
```

## Schieberegler-System

### Slider Manager

```javascript
var SliderManager = {
    sliders: [],
    activeSlider: null,
    isDragging: false,
    dragStartX: 0,
    startValue: 0,
    currentValue: 0,
    updateThrottle: 50
};
```

### Schieberegler initialisieren

```javascript
SliderManager.init = function() {
    this.sliders = Array.from(document.querySelectorAll('.tile-slider'));
    this.sliders.forEach(function(slider) {
        SliderManager.initSlider(slider);
    });
};
```

### Touch-Events für Schieberegler

```javascript
// Touch Start
handleTouchStart: function(slider, e) {
    e.preventDefault();
    e.stopPropagation();
    
    var touch = e.touches[0];
    var track = slider.querySelector('.slider-track');
    var rect = track.getBoundingClientRect();
    
    this.activeSlider = slider;
    this.isDragging = true;
    this.dragStartX = touch.clientX;
    this.startValue = this.getSliderValue(slider);
    this.currentValue = this.startValue;
    
    slider.classList.add('dragging');
    this.hapticFeedback();
}
```

### Schieberegler-Wert setzen

```javascript
setSliderValue: function(slider, value) {
    var thumb = slider.querySelector('.slider-thumb');
    var valueDisplay = slider.querySelector('.slider-value');
    
    if (thumb) {
        thumb.style.left = value + '%';
    }
    if (valueDisplay) {
        valueDisplay.textContent = Math.round(value) + '%';
    }
}
```

## Home Assistant Integration

### API Client

```javascript
var HomeAssistantAPI = {
    baseURL: '',
    token: '',
    
    init: function(config) {
        this.baseURL = config.homeAssistant.url;
        this.token = config.homeAssistant.token;
    },
    
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
                        reject(new Error('API Error: ' + xhr.status));
                    }
                }
            };
            
            if (data) {
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
    }
};
```

### Service-Aufrufe

```javascript
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
}
```

## Performance-Optimierungen

### Event Delegation

```javascript
// Statt viele Event Listener
document.addEventListener('click', function(e) {
    var tile = e.target.closest('.tile');
    if (tile) {
        handleTileClick(tile);
    }
    
    var navTab = e.target.closest('.nav-tab');
    if (navTab) {
        handleNavTabClick(navTab);
    }
});
```

### Throttling

```javascript
// Touch-Events throttlen
var throttledUpdate = throttle(function(value) {
    updateHomeAssistant(entityId, value);
}, 50);

// Debouncing
var debouncedSearch = debounce(function(query) {
    performSearch(query);
}, 300);
```

### Memory Management

```javascript
// Event Listener Cleanup
function cleanup() {
    eventListeners.forEach(function(listener) {
        listener.element.removeEventListener(listener.event, listener.handler);
    });
    eventListeners = [];
}

// Garbage Collection
function forceGC() {
    if (window.gc) {
        window.gc();
    }
}
```

## iOS 9.3.5 Polyfills

### Array Polyfills

```javascript
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
```

### Object Polyfills

```javascript
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
```

### Promise Polyfill

```javascript
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
```

## Touch-Optimierungen

### Hardware-Beschleunigung

```javascript
// Für alle animierten Elemente
var animatedElements = document.querySelectorAll('.tile, .nav-tab, .slider-thumb');
animatedElements.forEach(function(element) {
    element.style.transform = 'translateZ(0)';
    element.style.webkitTransform = 'translateZ(0)';
    element.style.willChange = 'transform';
    element.style.webkitWillChange = 'transform';
});
```

### Touch-Action

```javascript
// Touch-Action setzen
var touchElements = document.querySelectorAll('.tile, .nav-tab, .touch-button, .slider-thumb');
touchElements.forEach(function(element) {
    element.style.touchAction = 'manipulation';
    element.style.webkitTouchCallout = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.userSelect = 'none';
});
```

### Haptic Feedback

```javascript
// Haptic Feedback Simulation
hapticFeedback: function() {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}
```

## Event System

### Custom Events

```javascript
// Event auslösen
triggerEvent: function(element, eventName, detail) {
    var event = new CustomEvent(eventName, {
        detail: detail
    });
    element.dispatchEvent(event);
}

// Event abhören
element.addEventListener('touchTap', function(e) {
    console.log('Tap event:', e.detail);
});
```

### Event Delegation

```javascript
// Event Delegation für Performance
document.addEventListener('click', function(e) {
    var tile = e.target.closest('.tile');
    if (tile) {
        handleTileClick(tile, e);
    }
    
    var button = e.target.closest('.touch-button');
    if (button) {
        handleButtonClick(button, e);
    }
});
```

## Build-Prozess

### JavaScript kompilieren

```bash
# JavaScript Build
npm run build:js

# Mit Watch-Modus
npm run build:js -- --watch
```

### Terser Optionen

```javascript
const terser = {
    compress: {
        ecma: 5,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
        passes: 1
    },
    mangle: {
        reserved: [
            '$scope', '$timeout', '$location', 'Api',
            'document', 'window', 'navigator', 'location'
        ]
    },
    format: {
        ecma: 5,
        comments: false
    }
};
```

## Browser-Unterstützung

### Unterstützte Features

- ✅ **ES5 JavaScript** - Vollständig unterstützt
- ✅ **Touch Events** - Optimiert für iOS 9.3.5
- ✅ **XMLHttpRequest** - Für API-Calls
- ✅ **Custom Events** - Für Event-System
- ✅ **DOM Manipulation** - Alle Standard-Methoden
- ❌ **ES6+ Features** - Polyfills verfügbar
- ❌ **WebSocket** - Fallback auf Polling
- ❌ **Fetch API** - Fallback auf XMLHttpRequest

### iOS 9.3.5 Safari

- **Version**: Safari 9.1
- **Webkit-Engine**: 601.1.56
- **JavaScript-Engine**: JavaScriptCore
- **Touch-Events**: ✅ Vollständig
- **Hardware-Beschleunigung**: ✅

## Debugging

### Touch-Debug-Modus

```javascript
// Touch-Debug aktivieren
document.body.classList.add('touch-debug');

// Touch-Events loggen
document.addEventListener('touchstart', function(e) {
    console.log('Touch Start:', e.touches[0]);
});

document.addEventListener('touchmove', function(e) {
    console.log('Touch Move:', e.touches[0]);
});

document.addEventListener('touchend', function(e) {
    console.log('Touch End:', e.changedTouches[0]);
});
```

### Performance-Monitoring

```javascript
// Memory Usage überwachen
if (window.performance && window.performance.memory) {
    setInterval(function() {
        var memory = window.performance.memory;
        var used = memory.usedJSHeapSize / 1024 / 1024;
        console.log('Memory Usage:', used.toFixed(2) + 'MB');
    }, 30000);
}
```

## Best Practices

### 1. Event Delegation verwenden

```javascript
// ✅ Gut - Event Delegation
document.addEventListener('click', function(e) {
    var tile = e.target.closest('.tile');
    if (tile) {
        handleTileClick(tile);
    }
});

// ❌ Schlecht - Viele Event Listener
tiles.forEach(function(tile) {
    tile.addEventListener('click', handleTileClick);
});
```

### 2. Throttling für Touch-Events

```javascript
// Touch-Events throttlen
var throttledUpdate = throttle(function(value) {
    updateHomeAssistant(entityId, value);
}, 50);
```

### 3. Memory Management

```javascript
// Event Listener Cleanup
window.addEventListener('beforeunload', function() {
    cleanup();
});
```

### 4. Hardware-Beschleunigung

```javascript
// Für alle animierten Elemente
element.style.transform = 'translateZ(0)';
element.style.webkitTransform = 'translateZ(0)';
```

## Troubleshooting

### Häufige Probleme

**Problem**: Touch-Events reagieren nicht
```javascript
// Lösung: Touch-Action setzen
element.style.touchAction = 'manipulation';
element.style.webkitTouchCallout = 'none';
```

**Problem**: Schieberegler funktioniert nicht
```javascript
// Lösung: Event Delegation prüfen
SliderManager.init();
```

**Problem**: Memory Leaks
```javascript
// Lösung: Cleanup-Funktionen aufrufen
MemoryManager.cleanupEventListeners();
MemoryManager.forceGC();
```

**Problem**: Performance-Probleme
```javascript
// Lösung: Hardware-Beschleunigung aktivieren
TouchOptimizer.enableHardwareAcceleration();
```

---

**iPadHA JavaScript Framework** - Touch-optimiert für iOS 9.3.5! ⚡
