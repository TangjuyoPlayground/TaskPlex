# TaskPlex - Suggestions de Refactoring (2025)

Audit réalisé le 24 novembre 2025 basé sur les bonnes pratiques React/TypeScript 2025.

## État Actuel - Points Positifs ✅

| Aspect | Évaluation | Détails |
|--------|-----------|---------|
| **Stack technique** | ⭐⭐⭐⭐⭐ | React 19, Vite 7, TypeScript 5.9, TailwindCSS 4 |
| **Code splitting** | ⭐⭐⭐⭐ | Lazy loading bien configuré avec chunks manuels |
| **State management** | ⭐⭐⭐⭐ | TanStack Query pour server state, Context pour UI state |
| **Internationalisation** | ⭐⭐⭐⭐⭐ | i18next avec 3 langues (EN, FR, ES) |
| **Module registry** | ⭐⭐⭐⭐⭐ | Centralisé et scalable |
| **Desktop app** | ⭐⭐⭐⭐ | Tauri v2 bien intégré |

---

## 1. Architecture & Structure 🏗️

### 1.1 Créer des composants UI réutilisables
**Priorité:** 🔴 Haute

**Problème:** `VideoScreen.tsx`, `ImageScreen.tsx`, `PDFCompress.tsx` partagent beaucoup de code similaire.

**Solution:** Créer un dossier `components/ui/` avec :
- `FileDropzone.tsx` - Zone de drag & drop pour fichiers
- `QualitySelector.tsx` - Sélecteur de qualité (low/medium/high)
- `OperationToggle.tsx` - Toggle entre opérations (compress/convert)
- `ResultCard.tsx` - Affichage des résultats avec téléchargement
- `ProcessButton.tsx` - Bouton de traitement avec état loading

**Fichiers impactés:**
- `pages/VideoScreen.tsx`
- `pages/ImageScreen.tsx`
- `pages/pdf/PDFCompress.tsx`
- `pages/pdf/PDFMerge.tsx`
- `pages/pdf/PDFSplit.tsx`

### 1.2 Extraire les types dans un dossier `types/`
**Priorité:** 🟡 Moyenne

**Problème:** Les types sont éparpillés dans `services/api.ts`.

**Solution:** Créer `src/types/` avec :
- `types/api.ts` - Types des réponses API
- `types/modules.ts` - Types des modules (réexport depuis config)

### 1.3 Supprimer les fichiers inutilisés
**Priorité:** 🟡 Moyenne

**Fichiers à supprimer:**
- `pages/pdf/PDFDashboard.tsx` - Obsolète depuis le nouveau routing
- `pages/pdf/PDFHub.tsx` - Obsolète depuis le nouveau routing

---

## 2. Gestion d'État & Data Fetching 📦

### 2.1 Migrer vers Zustand (optionnel)
**Priorité:** 🟡 Moyenne

**Problème:** Context API peut causer des re-renders inutiles.

**Solution:** Utiliser Zustand pour le state client (favorites, sidebar collapse).

**Avantages:**
- Plus performant (sélecteurs granulaires)
- API plus simple
- Persistance intégrée

### 2.2 Cache pour les conversions d'unités
**Priorité:** 🟢 Basse

**Solution:** Utiliser `useQuery` au lieu d'appels directs pour bénéficier du cache.

---

## 3. Qualité du Code 🧹

### 3.1 Corriger les eslint-disable
**Priorité:** 🔴 Haute

**Problème:** `VideoScreen.tsx` ligne 28-29 contient un `eslint-disable-next-line`.

**Solution:** Utiliser `useCallback` avec les bonnes dépendances ou restructurer le code.

### 3.2 Ajouter Prettier
**Priorité:** 🟡 Moyenne

**Solution:** 
```bash
npm install -D prettier eslint-config-prettier
```

Créer `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### 3.3 Variables d'environnement
**Priorité:** 🟡 Moyenne

**Problème:** URL API hardcodée dans `services/api.ts`.

**Solution:** 
1. Créer `.env`:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```
2. Utiliser `import.meta.env.VITE_API_URL`

### 3.4 Mode strict TypeScript
**Priorité:** 🟢 Basse

**Solution:** Ajouter dans `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 4. Tests 🧪

### 4.1 Tests d'intégration
**Priorité:** 🔴 Haute

**Problème:** Seulement des tests de rendu basiques.

**Solution:** Ajouter des tests pour :
- Navigation entre modules
- Workflow complet (upload → process → download)
- Favoris (ajout/suppression/persistance)

### 4.2 Tests des hooks custom
**Priorité:** 🟡 Moyenne

**Fichiers à tester:**
- `hooks/useVideo.ts`
- `hooks/usePDF.ts`
- `hooks/useImage.ts`
- `hooks/useFavorites.ts`

### 4.3 Mock API avec MSW
**Priorité:** 🟡 Moyenne

**Solution:**
```bash
npm install -D msw
```

Permet de tester sans backend réel.

---

## 5. Performance ⚡

### 5.1 Virtualisation de la liste de modules
**Priorité:** 🟡 Moyenne

**Problème:** 85+ modules dans le dashboard.

**Solution:** Utiliser `@tanstack/react-virtual`:
```bash
npm install @tanstack/react-virtual
```

### 5.2 React.memo sur composants lourds
**Priorité:** 🟢 Basse

**Composants à mémoiser:**
- `NavItem` dans Layout.tsx
- Cards de modules dans HomeDashboard.tsx

### 5.3 Preload dynamique des routes
**Priorité:** 🟢 Basse

**Solution:** Réintroduire le preload basé sur le module registry.

---

## 6. UX/Accessibilité ♿

### 6.1 Thème sombre
**Priorité:** 🟡 Moyenne

**Solution:**
1. Ajouter CSS variables pour les couleurs
2. Utiliser `prefers-color-scheme` ou toggle manuel
3. Persister la préférence dans localStorage

### 6.2 Améliorer l'accessibilité
**Priorité:** 🟡 Moyenne

**Checklist:**
- [ ] `aria-label` sur tous les boutons icône
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Navigation clavier complète
- [ ] Skip links
- [ ] Annonces pour screen readers

### 6.3 Animations/Transitions
**Priorité:** 🟢 Basse

**Options:**
- Framer Motion
- View Transitions API (Chrome 111+)
- CSS Transitions (déjà partiellement en place)

---

## 7. DevOps & Build 🚀

### 7.1 Pre-commit hooks
**Priorité:** 🟡 Moyenne

**Solution:**
```bash
npm install -D husky lint-staged
npx husky init
```

### 7.2 Path aliases
**Priorité:** 🟢 Basse

**Solution:** Dans `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"]
    }
  }
}
```

### 7.3 Bundle analysis
**Priorité:** 🟢 Basse

**Solution:**
```bash
npm install -D rollup-plugin-visualizer
```

---

## Ordre de Priorité Recommandé

### Phase 1 - Quick Wins ✅ COMPLÉTÉ
1. ✅ Supprimer fichiers obsolètes (PDFDashboard.tsx, PDFHub.tsx)
2. ✅ Extraire les types (nouveau dossier `types/`)
3. ✅ Créer composants UI réutilisables (nouveau dossier `components/ui/`)

### Phase 2 - Qualité ✅ COMPLÉTÉ
4. ✅ Corriger eslint-disable (VideoScreen, ImageScreen refactorisés avec useCallback)
5. ✅ Variables d'environnement (VITE_API_URL)
6. ✅ Ajouter Prettier + configuration (.prettierrc, eslint-config-prettier)

### Phase 3 - Tests ✅ COMPLÉTÉ
7. ✅ Tests d'intégration (39 nouveaux tests)
8. ✅ Tests des hooks (6 fichiers, 55 tests)
9. ✅ Setup MSW (handlers pour tous les endpoints)

### Phase 4 - UX ✅ PARTIELLEMENT COMPLÉTÉ
10. ✅ Dark mode (ThemeContext + tous les composants)
11. ⏳ Accessibilité
12. ⏳ Animations

### Phase 5 - Performance ✅ PARTIELLEMENT COMPLÉTÉ
13. ✅ React.memo (NavItem, ModuleCard, CategoryButton)
14. ⏳ Virtualisation (si nécessaire avec 85+ modules)
15. ⏳ Bundle optimization

### Phase 6 - DevOps ✅ PARTIELLEMENT COMPLÉTÉ
16. ✅ Path aliases configurés (@/components, @/hooks, etc.)
17. ⏳ Husky + lint-staged (pre-commit hooks)

---

## Changements Effectués (24/11/2025)

### Nouveaux fichiers créés
- `src/components/ui/FileDropzone.tsx`
- `src/components/ui/QualitySelector.tsx`
- `src/components/ui/OperationToggle.tsx`
- `src/components/ui/ProcessButton.tsx`
- `src/components/ui/ErrorAlert.tsx`
- `src/components/ui/ResultCard.tsx`
- `src/components/ui/FormatSelector.tsx`
- `src/components/ui/index.ts`
- `src/types/api.ts`
- `src/types/index.ts`
- `.prettierrc`
- `.prettierignore`
- `.env.example`

### Fichiers modifiés
- `src/pages/VideoScreen.tsx` - Refactorisé avec composants UI
- `src/pages/ImageScreen.tsx` - Refactorisé avec composants UI
- `src/pages/HomeDashboard.tsx` - React.memo ajouté
- `src/components/Layout.tsx` - React.memo sur NavItem
- `src/services/api.ts` - Variables d'environnement
- `src/config/icons.ts` - Nettoyage imports
- `eslint.config.js` - Intégration Prettier
- `vite.config.ts` - Path aliases
- `tsconfig.app.json` - Path aliases
- `package.json` - Scripts Prettier

### Fichiers supprimés
- `src/pages/pdf/PDFDashboard.tsx`
- `src/pages/pdf/PDFHub.tsx`

---

*Document mis à jour le 24/11/2025*

