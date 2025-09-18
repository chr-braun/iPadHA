/**
 * iPadHA Release Build Script
 * Erstellt Release-Assets für GitHub Release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const config = {
    // Verzeichnisse
    projectDir: path.join(__dirname, '..'),
    releaseDir: path.join(__dirname, '../dist-release'),
    
    // Release-Informationen
    version: '0.1.0',
    releaseName: 'iPadHA v0.1.0 - Initial Release',
    
    // Assets
    assets: {
        source: 'ipadha-source-v0.1.0.zip',
        hacs: 'ipadha-hacs-v0.1.0.zip',
        standalone: 'ipadha-standalone-v0.1.0.zip'
    }
};

// Release Build erstellen
async function buildRelease() {
    console.log('🚀 Building iPadHA Release v0.1.0...');
    console.log('=' * 60);
    
    try {
        // 1. Release-Verzeichnis erstellen
        createReleaseDirectory();
        
        // 2. Source Code ZIP erstellen
        console.log('📦 Creating source code ZIP...');
        await createSourceZip();
        
        // 3. HACS Build erstellen
        console.log('🔧 Creating HACS build...');
        await createHACSBuild();
        
        // 4. Standalone Build erstellen
        console.log('🏠 Creating standalone build...');
        await createStandaloneBuild();
        
        // 5. Release-Informationen erstellen
        console.log('📋 Creating release information...');
        createReleaseInfo();
        
        // 6. Build-Validierung
        console.log('✅ Validating build...');
        validateBuild();
        
        console.log('\n🎉 Release build completed successfully!');
        console.log('=' * 60);
        console.log('📁 Release directory:', config.releaseDir);
        console.log('📦 Assets created:');
        console.log(`  - ${config.assets.source}`);
        console.log(`  - ${config.assets.hacs}`);
        console.log(`  - ${config.assets.standalone}`);
        console.log('\n🚀 Ready for GitHub Release!');
        
    } catch (error) {
        console.error('❌ Release build failed:', error.message);
        process.exit(1);
    }
}

// Release-Verzeichnis erstellen
function createReleaseDirectory() {
    if (fs.existsSync(config.releaseDir)) {
        fs.rmSync(config.releaseDir, { recursive: true });
    }
    fs.mkdirSync(config.releaseDir, { recursive: true });
    console.log('✅ Release directory created');
}

// Source Code ZIP erstellen
async function createSourceZip() {
    const sourceZipPath = path.join(config.releaseDir, config.assets.source);
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(sourceZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            console.log(`  ✅ Source ZIP created: ${archive.pointer()} bytes`);
            resolve();
        });
        
        archive.on('error', (err) => {
            reject(err);
        });
        
        archive.pipe(output);
        
        // Dateien hinzufügen (ohne node_modules, dist, etc.)
        const excludePatterns = [
            'node_modules/**',
            'dist-*/**',
            '.git/**',
            '*.log',
            '.DS_Store',
            'Thumbs.db'
        ];
        
        archive.glob('**/*', {
            cwd: config.projectDir,
            ignore: excludePatterns
        });
        
        archive.finalize();
    });
}

// HACS Build erstellen
async function createHACSBuild() {
    // HACS Build ausführen
    try {
        execSync('node scripts/build-hacs.js', { 
            cwd: config.projectDir,
            stdio: 'pipe'
        });
        console.log('  ✅ HACS build completed');
    } catch (error) {
        throw new Error(`HACS build failed: ${error.message}`);
    }
    
    // HACS ZIP erstellen
    const hacsZipPath = path.join(config.releaseDir, config.assets.hacs);
    const hacsBuildDir = path.join(config.projectDir, 'dist-hacs');
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(hacsZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            console.log(`  ✅ HACS ZIP created: ${archive.pointer()} bytes`);
            resolve();
        });
        
        archive.on('error', (err) => {
            reject(err);
        });
        
        archive.pipe(output);
        archive.directory(hacsBuildDir, false);
        archive.finalize();
    });
}

// Standalone Build erstellen
async function createStandaloneBuild() {
    const standaloneZipPath = path.join(config.releaseDir, config.assets.standalone);
    
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(standaloneZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', () => {
            console.log(`  ✅ Standalone ZIP created: ${archive.pointer()} bytes`);
            resolve();
        });
        
        archive.on('error', (err) => {
            reject(err);
        });
        
        archive.pipe(output);
        
        // Wichtige Dateien für Standalone-Installation
        const files = [
            'package.json',
            'README.md',
            'RELEASE_NOTES.md',
            'LICENSE',
            'src/**/*',
            'config/**/*',
            'docs/**/*',
            'scripts/**/*'
        ];
        
        files.forEach(pattern => {
            archive.glob(pattern, { cwd: config.projectDir });
        });
        
        archive.finalize();
    });
}

// Release-Informationen erstellen
function createReleaseInfo() {
    const releaseInfo = {
        version: config.version,
        releaseName: config.releaseName,
        releaseDate: new Date().toISOString(),
        assets: config.assets,
        buildInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            timestamp: Date.now()
        },
        installation: {
            hacs: {
                repository: 'https://github.com/chr-braun/iPadHA',
                category: 'frontend',
                requirements: ['Home Assistant 2021.1.0+', 'HACS']
            },
            manual: {
                requirements: ['Node.js 14+', 'Home Assistant 2021.1.0+'],
                steps: [
                    '1. Download and extract ipadha-standalone-v0.1.0.zip',
                    '2. Run: npm install',
                    '3. Run: npm run build:hacs',
                    '4. Copy to Home Assistant www directory',
                    '5. Configure config/ipadha.js',
                    '6. Restart Home Assistant'
                ]
            }
        },
        features: [
            'iOS 9.3.5 Compatibility',
            'Glasmorphism Design',
            'Touch Optimization',
            'Home Assistant Integration',
            'HACS Support',
            'Slider Controls',
            'Real-time Updates',
            'Performance Optimized'
        ],
        compatibility: {
            ios: '9.3.5+',
            homeassistant: '2021.1.0+',
            hacs: '1.0.0+',
            nodejs: '14.0.0+'
        }
    };
    
    const releaseInfoPath = path.join(config.releaseDir, 'release-info.json');
    fs.writeFileSync(releaseInfoPath, JSON.stringify(releaseInfo, null, 2));
    console.log('  ✅ Release info created');
    
    // README für Release erstellen
    const releaseReadme = createReleaseReadme(releaseInfo);
    const releaseReadmePath = path.join(config.releaseDir, 'README-RELEASE.md');
    fs.writeFileSync(releaseReadmePath, releaseReadme);
    console.log('  ✅ Release README created');
}

// Release README erstellen
function createReleaseReadme(releaseInfo) {
    return `# iPadHA v${releaseInfo.version} Release

## ${releaseInfo.releaseName}

**Release Date:** ${new Date(releaseInfo.releaseDate).toLocaleDateString('de-DE')}  
**Build Info:** Node.js ${releaseInfo.buildInfo.nodeVersion} on ${releaseInfo.buildInfo.platform}-${releaseInfo.buildInfo.arch}

## 📦 Assets

### Source Code
- **${releaseInfo.assets.source}** - Vollständiger Quellcode für Entwicklung

### HACS Integration
- **${releaseInfo.assets.hacs}** - HACS-kompatible Version für Home Assistant

### Standalone Installation
- **${releaseInfo.assets.standalone}** - Standalone-Version für manuelle Installation

## 🚀 Installation

### HACS Installation (Empfohlen)

1. **HACS installieren** (falls noch nicht geschehen)
2. **Repository hinzufügen:**
   - HACS → Frontend → Custom repositories
   - Repository: \`${releaseInfo.installation.hacs.repository}\`
   - Kategorie: ${releaseInfo.installation.hacs.category}
3. **Installieren** und Home Assistant neustarten

### Manuelle Installation

\`\`\`bash
# 1. Standalone ZIP herunterladen und entpacken
unzip ${releaseInfo.assets.standalone}

# 2. Dependencies installieren
npm install

# 3. HACS Build erstellen
npm run build:hacs

# 4. Nach Home Assistant kopieren
cp -r dist-hacs/* /config/www/ipadha/

# 5. Konfiguration anpassen
cp config/config.example.js config/ipadha.js
# config/ipadha.js mit deinen Home Assistant Einstellungen anpassen

# 6. Home Assistant neustarten
\`\`\`

## ✨ Features

${releaseInfo.features.map(feature => `- ✅ **${feature}**`).join('\n')}

## 🔧 Kompatibilität

- **iOS:** ${releaseInfo.compatibility.ios}
- **Home Assistant:** ${releaseInfo.compatibility.homeassistant}
- **HACS:** ${releaseInfo.compatibility.hacs}
- **Node.js:** ${releaseInfo.compatibility.nodejs}

## 📱 iPad Setup

1. **Safari öffnen** auf dem iPad
2. **URL eingeben**: \`http://DEINE_HA_IP:8123/local/ipadha/\`
3. **Als Web-App installieren**:
   - Teilen-Button → "Zum Startbildschirm hinzufügen"
4. **Vollbildmodus** aktivieren

## ⚙️ Konfiguration

### Home Assistant Setup

\`\`\`yaml
# configuration.yaml
homeassistant:
  auth_providers:
    - type: trusted_networks
      trusted_networks:
        - 192.168.1.0/24
      allow_bypass_login: true

api:
  use_ssl: false
\`\`\`

### iPadHA Konfiguration

\`\`\`javascript
// config/ipadha.js
module.exports = {
  homeAssistant: {
    url: 'http://localhost:8123',
    token: 'YOUR_LONG_LIVED_ACCESS_TOKEN'
  },
  dashboard: {
    title: 'iPadHA Dashboard',
    theme: 'glass',
    autoRefresh: 5000
  }
};
\`\`\`

## 🔧 Troubleshooting

### Häufige Probleme

**Problem**: Dashboard lädt nicht
\`\`\`bash
# Lösung: Logs prüfen
tail -f /config/home-assistant.log | grep ipadha
\`\`\`

**Problem**: Touch-Events reagieren nicht
\`\`\`css
/* Lösung: Touch-Action setzen */
.tile {
    touch-action: manipulation;
    -webkit-touch-callout: none;
}
\`\`\`

**Problem**: Home Assistant Verbindung fehlgeschlagen
\`\`\`yaml
# Lösung: Trusted Networks konfigurieren
homeassistant:
  auth_providers:
    - type: trusted_networks
      trusted_networks:
        - 192.168.1.0/24
      allow_bypass_login: true
\`\`\`

## 📞 Support

- **GitHub Issues**: [iPadHA Issues](https://github.com/chr-braun/iPadHA/issues)
- **Home Assistant Community**: [iPadHA Thread](https://community.home-assistant.io/t/ipadha-dashboard)
- **Dokumentation**: [docs/](docs/)

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE)

---

**iPadHA v${releaseInfo.version}** - Moderne Home Assistant Dashboards für klassische iPads! 🎉

**Entwickelt mit ❤️ für die Home Assistant Community**`;
}

// Build validieren
function validateBuild() {
    const requiredFiles = [
        config.assets.source,
        config.assets.hacs,
        config.assets.standalone,
        'release-info.json',
        'README-RELEASE.md'
    ];
    
    const missingFiles = requiredFiles.filter(file => {
        const filePath = path.join(config.releaseDir, file);
        return !fs.existsSync(filePath);
    });
    
    if (missingFiles.length > 0) {
        throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
    
    // Dateigrößen prüfen
    const minSize = 1024; // 1KB
    requiredFiles.forEach(file => {
        const filePath = path.join(config.releaseDir, file);
        const stats = fs.statSync(filePath);
        if (stats.size < minSize) {
            throw new Error(`File too small: ${file} (${stats.size} bytes)`);
        }
    });
    
    console.log('  ✅ All files validated');
}

// Build starten
if (require.main === module) {
    buildRelease().catch(error => {
        console.error('❌ Release build failed:', error.message);
        process.exit(1);
    });
}

module.exports = { buildRelease };
