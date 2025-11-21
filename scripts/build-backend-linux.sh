#!/bin/bash
set -e

echo "🚧 Building TaskPlex Backend for Linux..."

# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel temporaire pour le build
python3 -m venv venv_build
source venv_build/bin/activate

# Installer les dépendances
pip install -r requirements.txt
pip install pyinstaller

# Nettoyer les builds précédents
rm -rf build dist

# Compiler avec PyInstaller
# --onefile : tout en un seul fichier
# --name : nom de l'exécutable (temporaire)
# --clean : nettoyer le cache
# --add-data : pas besoin ici car tout est dans le code, sauf si templates
# --hidden-import : ajouter les libs que PyInstaller ne détecte pas
pyinstaller --clean --noconfirm --onefile --name taskplex-backend \
    --hidden-import=uvicorn.loops.auto \
    --hidden-import=uvicorn.loops.asyncio \
    --hidden-import=uvicorn.protocols.http.auto \
    --hidden-import=uvicorn.protocols.http.h11 \
    --hidden-import=uvicorn.lifespan.on \
    --hidden-import=app.api.video \
    --hidden-import=app.api.image \
    --hidden-import=app.api.pdf \
    --hidden-import=app.api.regex \
    --hidden-import=app.api.units \
    --hidden-import=multipart \
    --collect-all=ffmpeg_python \
    run.py

echo "✅ Build finished."

# Déplacer l'exécutable vers le dossier src-tauri/binaries
# Note: Tauri attend un format spécifique : <nom>-<target-triple>
# Sur Linux x64 : taskplex-backend-x86_64-unknown-linux-gnu

TARGET_TRIPLE="x86_64-unknown-linux-gnu"
BINARY_NAME="taskplex-backend"
DEST_DIR="../frontend/src-tauri/binaries"

mkdir -p $DEST_DIR
mv dist/$BINARY_NAME $DEST_DIR/$BINARY_NAME-$TARGET_TRIPLE

echo "✅ Binary moved to $DEST_DIR/$BINARY_NAME-$TARGET_TRIPLE"

# Nettoyage
deactivate
rm -rf venv_build build dist taskplex-backend.spec

echo "🎉 Backend ready for Tauri!"

