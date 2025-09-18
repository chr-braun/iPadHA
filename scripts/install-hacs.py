#!/usr/bin/env python3
"""
iPadHA HACS Installation Script
Automatische Installation in Home Assistant
"""

import os
import sys
import shutil
import json
import subprocess
from pathlib import Path

def get_homeassistant_config():
    """Finde Home Assistant Konfigurationsverzeichnis"""
    possible_paths = [
        "/config",
        "/usr/share/hassio/homeassistant",
        os.path.expanduser("~/.homeassistant"),
        os.path.expanduser("~/homeassistant"),
    ]
    
    for path in possible_paths:
        if os.path.exists(os.path.join(path, "configuration.yaml")):
            return path
    
    return None

def install_ipadha():
    """Installiere iPadHA in Home Assistant"""
    
    print("🚀 iPadHA HACS Installation")
    print("=" * 50)
    
    # Home Assistant Config finden
    ha_config = get_homeassistant_config()
    if not ha_config:
        print("❌ Home Assistant Konfigurationsverzeichnis nicht gefunden!")
        print("Bitte gib den Pfad manuell an:")
        ha_config = input("Home Assistant Config Pfad: ").strip()
        if not os.path.exists(ha_config):
            print("❌ Ungültiger Pfad!")
            return False
    
    print(f"✅ Home Assistant Config gefunden: {ha_config}")
    
    # www Verzeichnis erstellen
    www_dir = os.path.join(ha_config, "www")
    ipadha_dir = os.path.join(www_dir, "ipadha")
    
    if not os.path.exists(www_dir):
        os.makedirs(www_dir)
        print(f"✅ www Verzeichnis erstellt: {www_dir}")
    
    # Aktuelles Verzeichnis (wo das Script läuft)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(current_dir)
    
    # HACS Build erstellen
    print("🔨 Erstelle HACS Build...")
    try:
        # Node.js Build ausführen
        os.chdir(project_dir)
        result = subprocess.run(["node", "scripts/build-hacs.js"], 
                              capture_output=True, text=True, check=True)
        print("✅ HACS Build erfolgreich")
    except subprocess.CalledProcessError as e:
        print(f"❌ HACS Build fehlgeschlagen: {e}")
        print(f"Error: {e.stderr}")
        return False
    except FileNotFoundError:
        print("❌ Node.js nicht gefunden. Bitte installiere Node.js zuerst.")
        return False
    
    # HACS Build kopieren
    hacs_build_dir = os.path.join(project_dir, "dist-hacs")
    if not os.path.exists(hacs_build_dir):
        print("❌ HACS Build Verzeichnis nicht gefunden!")
        return False
    
    print("📁 Kopiere HACS Build...")
    
    try:
        # Alte Installation entfernen
        if os.path.exists(ipadha_dir):
            shutil.rmtree(ipadha_dir)
            print("🗑️  Alte Installation entfernt")
        
        # Neue Installation kopieren
        shutil.copytree(hacs_build_dir, ipadha_dir)
        print(f"✅ iPadHA kopiert nach: {ipadha_dir}")
        
        # Berechtigungen setzen
        os.chmod(ipadha_dir, 0o755)
        for root, dirs, files in os.walk(ipadha_dir):
            for d in dirs:
                os.chmod(os.path.join(root, d), 0o755)
            for f in files:
                os.chmod(os.path.join(root, f), 0o644)
        
        print("✅ Berechtigungen gesetzt")
        
    except Exception as e:
        print(f"❌ Fehler beim Kopieren: {e}")
        return False
    
    # HACS Integration prüfen
    hacs_dir = os.path.join(ha_config, "custom_components", "hacs")
    if os.path.exists(hacs_dir):
        print("✅ HACS ist installiert")
        
        # HACS Frontend Repository hinzufügen
        hacs_repos_file = os.path.join(ha_config, ".storage", "hacs.repositories")
        if os.path.exists(hacs_repos_file):
            print("📝 HACS Repository wird hinzugefügt...")
            # Hier könnte man das HACS Repository automatisch hinzufügen
            # Das ist aber komplexer und wird manuell gemacht
    else:
        print("⚠️  HACS ist nicht installiert")
        print("   Bitte installiere HACS zuerst:")
        print("   https://hacs.xyz/docs/installation/installation/")
    
    # Home Assistant Konfiguration prüfen
    config_file = os.path.join(ha_config, "configuration.yaml")
    if os.path.exists(config_file):
        with open(config_file, 'r', encoding='utf-8') as f:
            config_content = f.read()
        
        # Trusted Networks prüfen
        if "trusted_networks" not in config_content:
            print("⚠️  Trusted Networks nicht in configuration.yaml gefunden")
            print("   Bitte füge folgendes hinzu:")
            print("""
homeassistant:
  auth_providers:
    - type: homeassistant
    - type: trusted_networks
      trusted_networks:
        - 192.168.1.0/24
      allow_bypass_login: true
""")
        
        # API prüfen
        if "api:" not in config_content:
            print("⚠️  API nicht in configuration.yaml gefunden")
            print("   Bitte füge folgendes hinzu:")
            print("""
api:
  use_ssl: false
""")
    
    # Konfigurationsdatei erstellen
    config_example = os.path.join(ipadha_dir, "config", "config.example.js")
    config_file = os.path.join(ipadha_dir, "config", "ipadha.js")
    
    if os.path.exists(config_example) and not os.path.exists(config_file):
        shutil.copy2(config_example, config_file)
        print("✅ Konfigurationsdatei erstellt: config/ipadha.js")
        print("   Bitte passe die Konfiguration an deine Home Assistant Einstellungen an")
    
    print("\n🎉 Installation abgeschlossen!")
    print("=" * 50)
    print("📱 Nächste Schritte:")
    print(f"1. Home Assistant neustarten")
    print(f"2. Auf iPad: http://DEINE_HA_IP:8123/local/ipadha/")
    print(f"3. Als Web-App installieren")
    print(f"4. config/ipadha.js anpassen (deine Home Assistant Einstellungen)")
    print("\n📚 Dokumentation: README.md")
    print("🔧 HACS Integration: hacs.json")
    
    return True

def main():
    """Hauptfunktion"""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("iPadHA HACS Installation")
        print("Verwendung: python3 install-hacs.py")
        return
    
    success = install_ipadha()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
