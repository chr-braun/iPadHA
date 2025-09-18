# iPadHA CSS Framework Dokumentation

## Übersicht

Das iPadHA CSS Framework ist speziell für iOS 9.3.5 Safari optimiert und bietet moderne Glasmorphismus-Effekte mit umfassenden Fallbacks für ältere Browser.

## CSS-Architektur

```
src/css/
├── ipadha.css      # Haupt-CSS mit Basis-Styles
├── glass.css       # Glasmorphismus-Effekte
├── touch.css       # Touch-Optimierungen
└── ios9.css        # iOS 9.3.5 spezifische Fixes
```

## CSS Custom Properties

### Farbpalette

```css
:root {
    /* Glasmorphismus-Farben */
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-bg-hover: rgba(255, 255, 255, 0.15);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-border-hover: rgba(255, 255, 255, 0.3);
    --glass-shadow: rgba(0, 0, 0, 0.1);
    --glass-shadow-hover: rgba(0, 0, 0, 0.15);
    
    /* Akzentfarben */
    --accent-blue: rgba(0, 122, 255, 0.8);
    --accent-green: rgba(52, 199, 89, 0.8);
    --accent-orange: rgba(255, 149, 0, 0.8);
    --accent-red: rgba(255, 59, 48, 0.8);
    --accent-purple: rgba(175, 82, 222, 0.8);
    
    /* Text-Farben */
    --text-primary: rgba(255, 255, 255, 0.9);
    --text-secondary: rgba(255, 255, 255, 0.6);
    --text-muted: rgba(255, 255, 255, 0.4);
}
```

### Design-Tokens

```css
:root {
    /* Blur-Effekte */
    --blur-intensity: 20px;
    --blur-fallback: rgba(255, 255, 255, 0.2);
    
    /* Border Radius */
    --radius-small: 8px;
    --radius-medium: 12px;
    --radius-large: 16px;
    --radius-xlarge: 20px;
    
    /* Schatten */
    --shadow-small: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.15);
    --shadow-large: 0 8px 32px rgba(0, 0, 0, 0.2);
    
    /* Touch-Optimierung */
    --min-touch-size: 60px;
    --touch-feedback-scale: 0.95;
    
    /* Animationen */
    --transition-fast: 0.1s ease;
    --transition-medium: 0.2s ease;
    --transition-slow: 0.3s ease;
}
```

## Glasmorphismus-Komponenten

### Glass Card

```css
.glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-intensity));
    -webkit-backdrop-filter: blur(var(--blur-intensity));
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-large);
    box-shadow: var(--shadow-medium);
}
```

**Varianten:**
- `.glass-card-small` - Kleine Karten
- `.glass-card-medium` - Mittlere Karten
- `.glass-card-large` - Große Karten
- `.glass-card-blue` - Blaue Akzentfarbe
- `.glass-card-green` - Grüne Akzentfarbe
- `.glass-card-orange` - Orange Akzentfarbe
- `.glass-card-red` - Rote Akzentfarbe
- `.glass-card-purple` - Lila Akzentfarbe

### Glass Button

```css
.glass-button {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-intensity));
    -webkit-backdrop-filter: blur(var(--blur-intensity));
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-medium);
    color: var(--text-primary);
    padding: 12px 24px;
    min-height: var(--min-touch-size);
    min-width: var(--min-touch-size);
    cursor: pointer;
    transition: all var(--transition-medium);
}
```

**Varianten:**
- `.glass-button.primary` - Primärer Button
- `.glass-button.success` - Erfolgs-Button
- `.glass-button.warning` - Warnungs-Button
- `.glass-button.danger` - Gefahr-Button

### Glass Slider

```css
.glass-slider {
    height: 8px;
    background: var(--glass-border);
    border-radius: 4px;
    cursor: pointer;
}

.glass-slider-thumb {
    position: absolute;
    top: -6px;
    width: 20px;
    height: 20px;
    background: var(--glass-bg);
    backdrop-filter: blur(var(--blur-intensity));
    -webkit-backdrop-filter: blur(var(--blur-intensity));
    border: 2px solid var(--accent-blue);
    border-radius: 50%;
    cursor: pointer;
    transition: all var(--transition-fast);
}
```

## Touch-Optimierung

### Touch Targets

```css
.touch-target {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ipad-optimized .touch-target {
    min-width: 60px;
    min-height: 60px;
}
```

### Touch Feedback

```css
.touch-feedback {
    transition: transform var(--transition-fast);
    -webkit-transition: -webkit-transform var(--transition-fast);
}

.touch-feedback:active {
    transform: scale(var(--touch-feedback-scale));
    -webkit-transform: scale(var(--touch-feedback-scale));
}
```

### Touch Gestures

```css
.touch-gesture {
    position: relative;
    overflow: hidden;
}

.touch-scroll {
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
    scroll-behavior: smooth;
}
```

## iOS 9.3.5 Kompatibilität

### Hardware-Beschleunigung

```css
.ios9-optimized * {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}
```

### Webkit-Prefixes

```css
.ios9-optimized .glass-card {
    -webkit-backdrop-filter: blur(20px);
    backdrop-filter: blur(20px);
    -webkit-border-radius: 16px;
    border-radius: 16px;
    -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

### Flexbox Fallbacks

```css
.ios9-optimized .dashboard-grid {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
}
```

## Responsive Design

### Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
    }
}

/* Mobile */
@media (max-width: 480px) {
    .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

### Touch-Optimierungen

```css
@media (max-width: 768px) {
    .touch-button {
        min-width: 48px;
        min-height: 48px;
        padding: 14px 22px;
        font-size: 18px;
    }
}
```

## Performance-Optimierungen

### Will-Change

```css
.ios9-optimized .tile,
.ios9-optimized .nav-tab,
.ios9-optimized .slider-thumb {
    will-change: transform;
    -webkit-will-change: transform;
}
```

### Memory Management

```css
.ios9-optimized .tile:not(.active) {
    visibility: hidden;
    opacity: 0;
    -webkit-transform: translateZ(0) scale(0.8);
    transform: translateZ(0) scale(0.8);
}
```

## Build-Prozess

### CSS kompilieren

```bash
# CSS Build
npm run build:css

# Mit Watch-Modus
npm run build:css -- --watch
```

### CleanCSS Optionen

```javascript
const cleanCSS = {
    level: 2,
    compatibility: 'ie9',
    keepSpecialComments: 0
};
```

## Browser-Unterstützung

### Unterstützte Features

- ✅ **CSS3 Transforms** - Hardware-beschleunigt
- ✅ **CSS3 Transitions** - Smooth Animationen
- ✅ **CSS3 Border Radius** - Abgerundete Ecken
- ✅ **CSS3 Box Shadow** - Schatten-Effekte
- ✅ **CSS3 Gradients** - Farbverläufe
- ✅ **Flexbox** - Mit Fallbacks
- ❌ **CSS Grid** - Fallback auf Flexbox
- ❌ **CSS Custom Properties** - Fallbacks definiert
- ❌ **Backdrop Filter** - Fallback auf Opacity

### iOS 9.3.5 Safari

- **Version**: Safari 9.1
- **Webkit-Engine**: 601.1.56
- **CSS3 Support**: Teilweise
- **Hardware-Beschleunigung**: ✅
- **Touch-Events**: ✅
- **Webkit-Prefixes**: ✅

## Fallbacks

### Backdrop Filter Fallback

```css
@supports not (backdrop-filter: blur(20px)) {
    .glass-card {
        background: var(--blur-fallback);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
}
```

### CSS Grid Fallback

```css
.ios9-optimized .dashboard-grid {
    display: flex;
    flex-wrap: wrap;
}

.ios9-optimized .tile {
    flex: 1 1 280px;
    max-width: 280px;
}
```

## Debugging

### Touch-Debug-Modus

```css
.touch-debug .touch-target {
    outline: 2px solid rgba(255, 0, 0, 0.5);
}

.touch-debug .touch-target:hover {
    outline-color: rgba(0, 255, 0, 0.5);
}
```

### Performance-Monitoring

```css
.performance-debug * {
    outline: 1px solid rgba(0, 255, 0, 0.1);
}
```

## Best Practices

### 1. Hardware-Beschleunigung

```css
/* Immer verwenden für animierte Elemente */
.animated-element {
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
}
```

### 2. Touch-Targets

```css
/* Mindestgröße 44px für Touch-Targets */
.touch-target {
    min-width: 44px;
    min-height: 44px;
}
```

### 3. Webkit-Prefixes

```css
/* Immer Webkit-Prefixes für iOS verwenden */
.element {
    -webkit-transition: all 0.2s ease;
    transition: all 0.2s ease;
}
```

### 4. Fallbacks

```css
/* Immer Fallbacks für ältere Browser definieren */
.element {
    background: rgba(255, 255, 255, 0.2); /* Fallback */
    background: var(--glass-bg); /* Moderne Browser */
}
```

## Troubleshooting

### Häufige Probleme

**Problem**: Glasmorphismus-Effekte funktionieren nicht
```css
/* Lösung: Fallback aktivieren */
@supports not (backdrop-filter: blur(20px)) {
    .glass-card {
        background: rgba(255, 255, 255, 0.2);
    }
}
```

**Problem**: Touch-Events reagieren nicht
```css
/* Lösung: Touch-Action setzen */
.touch-target {
    touch-action: manipulation;
    -webkit-touch-callout: none;
}
```

**Problem**: Animationen sind ruckelig
```css
/* Lösung: Hardware-Beschleunigung aktivieren */
.animated-element {
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
}
```

---

**iPadHA CSS Framework** - Moderne Glasmorphismus-Effekte für iOS 9.3.5! 🎨
