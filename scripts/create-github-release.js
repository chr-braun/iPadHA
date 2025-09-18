#!/usr/bin/env node
/**
 * GitHub Release Creation Script
 * Erstellt automatisch einen GitHub Release für iPadHA
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const config = {
    version: '0.1.0',
    releaseName: 'iPadHA v0.1.0 - Initial Release',
    releaseDir: path.join(__dirname, '../dist-release'),
    repository: 'chr-braun/iPadHA',
    tagName: 'v0.1.0',
    isPrerelease: false,
    isDraft: true // Set to false when ready to publish
};

// GitHub Release erstellen
async function createGitHubRelease() {
    console.log('🚀 Creating GitHub Release...');
    console.log('=' * 50);
    
    try {
        // 1. Release-Informationen laden
        const releaseInfo = loadReleaseInfo();
        
        // 2. Release Notes erstellen
        const releaseNotes = createReleaseNotes(releaseInfo);
        
        // 3. GitHub CLI prüfen
        checkGitHubCLI();
        
        // 4. Release erstellen
        await createRelease(releaseNotes);
        
        // 5. Assets hochladen
        await uploadAssets();
        
        console.log('\n🎉 GitHub Release created successfully!');
        console.log('=' * 50);
        console.log(`📝 Release: ${config.releaseName}`);
        console.log(`🏷️  Tag: ${config.tagName}`);
        console.log(`📦 Assets: ${getAssetFiles().length} files`);
        console.log(`🔗 URL: https://github.com/${config.repository}/releases/tag/${config.tagName}`);
        
        if (config.isDraft) {
            console.log('\n⚠️  Release is in DRAFT mode');
            console.log('   Edit the release on GitHub to publish it');
        }
        
    } catch (error) {
        console.error('❌ GitHub Release creation failed:', error.message);
        process.exit(1);
    }
}

// Release-Informationen laden
function loadReleaseInfo() {
    const releaseInfoPath = path.join(config.releaseDir, 'release-info.json');
    
    if (!fs.existsSync(releaseInfoPath)) {
        throw new Error('Release info not found. Run build:release first.');
    }
    
    return JSON.parse(fs.readFileSync(releaseInfoPath, 'utf8'));
}

// Release Notes erstellen
function createReleaseNotes(releaseInfo) {
    const releaseNotesPath = path.join(__dirname, '../RELEASE_NOTES.md');
    
    if (!fs.existsSync(releaseNotesPath)) {
        throw new Error('Release notes not found: RELEASE_NOTES.md');
    }
    
    let releaseNotes = fs.readFileSync(releaseNotesPath, 'utf8');
    
    // GitHub-spezifische Anpassungen
    releaseNotes = releaseNotes
        .replace(/## Version 0\.1\.0 - Initial Release 🎉/g, '## 🎉 Initial Release')
        .replace(/### 🎯 Überblick/g, '### 🎯 Overview')
        .replace(/### ✨ Neue Features/g, '### ✨ New Features')
        .replace(/### 🛠️ Technische Details/g, '### 🛠️ Technical Details')
        .replace(/### 📊 Performance-Benchmarks/g, '### 📊 Performance Benchmarks')
        .replace(/### 🚀 Installation/g, '### 🚀 Installation')
        .replace(/### ⚙️ Konfiguration/g, '### ⚙️ Configuration')
        .replace(/### 📱 iPad Setup/g, '### 📱 iPad Setup')
        .replace(/### 🎨 Design-Features/g, '### 🎨 Design Features')
        .replace(/### 🔧 Troubleshooting/g, '### 🔧 Troubleshooting')
        .replace(/### 📈 Bekannte Einschränkungen/g, '### 📈 Known Limitations')
        .replace(/### 🔄 Updates/g, '### 🔄 Updates')
        .replace(/### 📞 Support/g, '### 📞 Support')
        .replace(/### 🙏 Credits/g, '### 🙏 Credits')
        .replace(/### 📄 Lizenz/g, '### 📄 License')
        .replace(/### 🔮 Roadmap/g, '### 🔮 Roadmap');
    
    return releaseNotes;
}

// GitHub CLI prüfen
function checkGitHubCLI() {
    try {
        execSync('gh --version', { stdio: 'pipe' });
        console.log('✅ GitHub CLI found');
    } catch (error) {
        throw new Error('GitHub CLI not found. Install it from https://cli.github.com/');
    }
}

// Release erstellen
async function createRelease(releaseNotes) {
    console.log('📝 Creating release...');
    
    const releaseFile = path.join(config.releaseDir, 'release-notes.md');
    fs.writeFileSync(releaseFile, releaseNotes);
    
    const command = [
        'gh release create',
        config.tagName,
        `--title "${config.releaseName}"`,
        `--notes-file "${releaseFile}"`,
        config.isPrerelease ? '--prerelease' : '',
        config.isDraft ? '--draft' : '',
        '--repo', config.repository
    ].filter(Boolean).join(' ');
    
    try {
        execSync(command, { stdio: 'pipe' });
        console.log('  ✅ Release created');
    } catch (error) {
        // Prüfen ob Release bereits existiert
        if (error.message.includes('already exists')) {
            console.log('  ⚠️  Release already exists, updating...');
            await updateRelease(releaseNotes);
        } else {
            throw error;
        }
    }
}

// Release aktualisieren
async function updateRelease(releaseNotes) {
    const command = [
        'gh release edit',
        config.tagName,
        `--title "${config.releaseName}"`,
        `--notes-file "${path.join(config.releaseDir, 'release-notes.md')}"`,
        '--repo', config.repository
    ].join(' ');
    
    execSync(command, { stdio: 'pipe' });
    console.log('  ✅ Release updated');
}

// Assets hochladen
async function uploadAssets() {
    console.log('📦 Uploading assets...');
    
    const assetFiles = getAssetFiles();
    
    for (const assetFile of assetFiles) {
        const assetPath = path.join(config.releaseDir, assetFile);
        
        if (!fs.existsSync(assetPath)) {
            console.log(`  ⚠️  Asset not found: ${assetFile}`);
            continue;
        }
        
        try {
            const command = [
                'gh release upload',
                config.tagName,
                assetPath,
                '--repo', config.repository
            ].join(' ');
            
            execSync(command, { stdio: 'pipe' });
            console.log(`  ✅ Uploaded: ${assetFile}`);
        } catch (error) {
            console.log(`  ⚠️  Upload failed: ${assetFile} - ${error.message}`);
        }
    }
}

// Asset-Dateien auflisten
function getAssetFiles() {
    return [
        'ipadha-source-v0.1.0.zip',
        'ipadha-hacs-v0.1.0.zip',
        'ipadha-standalone-v0.1.0.zip'
    ];
}

// Release-Status prüfen
function checkReleaseStatus() {
    try {
        const command = `gh release view ${config.tagName} --repo ${config.repository}`;
        const output = execSync(command, { stdio: 'pipe' }).toString();
        
        console.log('📊 Release Status:');
        console.log(output);
        
    } catch (error) {
        console.log('❌ Release not found or error occurred');
    }
}

// Release veröffentlichen
function publishRelease() {
    console.log('🚀 Publishing release...');
    
    const command = [
        'gh release edit',
        config.tagName,
        '--draft=false',
        '--repo', config.repository
    ].join(' ');
    
    try {
        execSync(command, { stdio: 'pipe' });
        console.log('✅ Release published');
    } catch (error) {
        console.error('❌ Failed to publish release:', error.message);
    }
}

// Hauptfunktion
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log(`
iPadHA GitHub Release Script

Usage:
  node create-github-release.js [options]

Options:
  --help              Show this help message
  --publish           Publish the release (remove draft status)
  --status            Check release status
  --dry-run           Show what would be done without executing

Examples:
  node create-github-release.js              # Create draft release
  node create-github-release.js --publish    # Publish release
  node create-github-release.js --status     # Check status
        `);
        return;
    }
    
    if (args.includes('--dry-run')) {
        console.log('🔍 Dry run mode - showing what would be done:');
        console.log(`  - Create release: ${config.releaseName}`);
        console.log(`  - Tag: ${config.tagName}`);
        console.log(`  - Assets: ${getAssetFiles().join(', ')}`);
        console.log(`  - Draft: ${config.isDraft}`);
        return;
    }
    
    if (args.includes('--status')) {
        checkReleaseStatus();
        return;
    }
    
    if (args.includes('--publish')) {
        config.isDraft = false;
        await createGitHubRelease();
        publishRelease();
        return;
    }
    
    await createGitHubRelease();
}

// Script ausführen
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    });
}

module.exports = { createGitHubRelease, publishRelease, checkReleaseStatus };
