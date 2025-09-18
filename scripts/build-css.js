/**
 * CSS Build Script für iPadHA
 * Kompiliert und optimiert CSS für iOS 9.3.5
 */

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

const config = {
    // Input Verzeichnisse
    inputDir: path.join(__dirname, '../src/css'),
    outputDir: path.join(__dirname, '../public/css'),
    
    // CSS Dateien
    files: [
        'ipadha.css',
        'glass.css',
        'touch.css',
        'ios9.css'
    ],
    
    // CleanCSS Optionen
    cleanCSS: {
        level: 2,
        // iOS 9.3.5 Kompatibilität
        compatibility: 'ie9',
        // Webkit-Prefixes beibehalten
        keepSpecialComments: 0
    }
};

// CSS kompilieren
function buildCSS() {
    console.log('🎨 Building CSS for iPadHA...');
    
    // Output Verzeichnis erstellen
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // CSS Dateien verarbeiten
    config.files.forEach(file => {
        const inputPath = path.join(config.inputDir, file);
        const outputPath = path.join(config.outputDir, file);
        
        if (fs.existsSync(inputPath)) {
            console.log(`  📄 Processing ${file}...`);
            
            // CSS lesen
            const css = fs.readFileSync(inputPath, 'utf8');
            
            // CSS optimieren
            const cleanCSS = new CleanCSS(config.cleanCSS);
            const result = cleanCSS.minify(css);
            
            if (result.errors.length > 0) {
                console.error(`  ❌ Errors in ${file}:`, result.errors);
            }
            
            if (result.warnings.length > 0) {
                console.warn(`  ⚠️  Warnings in ${file}:`, result.warnings);
            }
            
            // CSS schreiben
            fs.writeFileSync(outputPath, result.styles);
            console.log(`  ✅ ${file} built successfully`);
        } else {
            console.warn(`  ⚠️  File not found: ${file}`);
        }
    });
    
    // Combined CSS erstellen
    createCombinedCSS();
    
    console.log('🎉 CSS build completed!');
}

// Combined CSS erstellen
function createCombinedCSS() {
    console.log('  📦 Creating combined CSS...');
    
    const combinedCSS = config.files
        .map(file => {
            const filePath = path.join(config.inputDir, file);
            if (fs.existsSync(filePath)) {
                return fs.readFileSync(filePath, 'utf8');
            }
            return '';
        })
        .join('\n\n');
    
    // CSS optimieren
    const cleanCSS = new CleanCSS(config.cleanCSS);
    const result = cleanCSS.minify(combinedCSS);
    
    // Combined CSS schreiben
    const outputPath = path.join(config.outputDir, 'ipadha-combined.css');
    fs.writeFileSync(outputPath, result.styles);
    
    console.log(`  ✅ Combined CSS created: ${outputPath}`);
}

// Build starten
if (require.main === module) {
    buildCSS();
}

module.exports = { buildCSS };
