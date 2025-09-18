/**
 * JavaScript Build Script für iPadHA
 * Kompiliert und optimiert JavaScript für iOS 9.3.5
 */

const fs = require('fs');
const path = require('path');
const Terser = require('terser');

const config = {
    // Input Verzeichnisse
    inputDir: path.join(__dirname, '../src/js'),
    outputDir: path.join(__dirname, '../public/js'),
    
    // JavaScript Dateien
    files: [
        'ipadha.js',
        'touch.js',
        'sliders.js',
        'ios9-optimizations.js'
    ],
    
    // Terser Optionen für iOS 9.3.5
    terser: {
        compress: {
            // ES5 Kompatibilität
            ecma: 5,
            // Console.log entfernen
            drop_console: true,
            drop_debugger: true,
            // Pure Functions
            pure_funcs: ['console.log', 'console.warn'],
            // Weniger aggressive Optimierungen
            passes: 1
        },
        mangle: {
            // Reserved Names für iOS 9.3.5
            reserved: [
                '$scope', '$timeout', '$location', 'Api',
                'document', 'window', 'navigator', 'location'
            ]
        },
        format: {
            // ES5 Kompatibilität
            ecma: 5,
            // Kommentare entfernen
            comments: false
        }
    }
};

// JavaScript kompilieren
function buildJS() {
    console.log('⚡ Building JavaScript for iPadHA...');
    
    // Output Verzeichnis erstellen
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // JavaScript Dateien verarbeiten
    config.files.forEach(file => {
        const inputPath = path.join(config.inputDir, file);
        const outputPath = path.join(config.outputDir, file);
        
        if (fs.existsSync(inputPath)) {
            console.log(`  📄 Processing ${file}...`);
            
            // JavaScript lesen
            const js = fs.readFileSync(inputPath, 'utf8');
            
            // JavaScript optimieren
            const result = Terser.minify(js, config.terser);
            
            if (result.error) {
                console.error(`  ❌ Error in ${file}:`, result.error);
                return;
            }
            
            if (result.warnings && result.warnings.length > 0) {
                console.warn(`  ⚠️  Warnings in ${file}:`, result.warnings);
            }
            
            // JavaScript schreiben
            fs.writeFileSync(outputPath, result.code);
            console.log(`  ✅ ${file} built successfully`);
        } else {
            console.warn(`  ⚠️  File not found: ${file}`);
        }
    });
    
    // Combined JavaScript erstellen
    createCombinedJS();
    
    console.log('🎉 JavaScript build completed!');
}

// Combined JavaScript erstellen
function createCombinedJS() {
    console.log('  📦 Creating combined JavaScript...');
    
    const combinedJS = config.files
        .map(file => {
            const filePath = path.join(config.inputDir, file);
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf8');
            }
            return '';
        })
        .join('\n\n');
    
    // JavaScript optimieren
    const result = Terser.minify(combinedJS, config.terser);
    
    if (result.error) {
        console.error('  ❌ Error in combined JS:', result.error);
        return;
    }
    
    // Combined JavaScript schreiben
    const outputPath = path.join(config.outputDir, 'ipadha-combined.js');
    fs.writeFileSync(outputPath, result.code);
    
    console.log(`  ✅ Combined JavaScript created: ${outputPath}`);
}

// iOS 9.3.5 Polyfills hinzufügen
function addPolyfills() {
    console.log('  🔧 Adding iOS 9.3.5 polyfills...');
    
    const polyfills = `
// iOS 9.3.5 Polyfills
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

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

if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(callback.call(thisArg, this[i], i, this));
        }
        return result;
    };
}

// Object.assign Polyfill
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

// Promise Polyfill (vereinfacht)
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
`;
    
    // Polyfills zu combined JS hinzufügen
    const combinedPath = path.join(config.outputDir, 'ipadha-combined.js');
    if (fs.existsSync(combinedPath)) {
        const existingJS = fs.readFileSync(combinedPath, 'utf8');
        const polyfilledJS = polyfills + '\n\n' + existingJS;
        fs.writeFileSync(combinedPath, polyfilledJS);
        console.log('  ✅ Polyfills added to combined JavaScript');
    }
}

// Build starten
if (require.main === module) {
    buildJS();
    addPolyfills();
}

module.exports = { buildJS, addPolyfills };
