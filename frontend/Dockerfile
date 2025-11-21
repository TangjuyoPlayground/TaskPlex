# Étape 1 : Build
FROM node:20-alpine as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape 2 : Serve avec Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée (optionnel, sinon config par défaut)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

