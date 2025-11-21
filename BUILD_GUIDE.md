# Guide de Build TaskPlex

## Prérequis Système (Linux - Fedora)

Avant de compiler l'application Desktop, vous devez installer les bibliothèques de développement nécessaires pour Tauri :

```bash
sudo dnf group install "C Development Tools and Libraries"
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel libsoup3-devel javascriptcoregtk4.1-devel
```

## Commandes de Build

### 1. Mode Web (Docker)

Pour lancer l'application en mode serveur (accessible via navigateur) :

```bash
docker-compose up --build
```

### 2. Mode Desktop (Tauri)

1.  **Compiler le backend Python** (nécessaire avant le build Tauri) :
    ```bash
    ./scripts/build-backend-linux.sh
    ```

2.  **Lancer en mode développement** :
    ```bash
    cd frontend
    npm run tauri dev
    ```

3.  **Créer l'exécutable final** (.deb, .AppImage) :
    ```bash
    cd frontend
    npm run tauri build
    ```

Les exécutables seront générés dans `frontend/src-tauri/target/release/bundle/`.

