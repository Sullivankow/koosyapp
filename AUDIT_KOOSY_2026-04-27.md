# AUDIT ARCHITECTURAL - PROJECT KOOSY

**Date :** 27 avril 2026
**Auditeur :** Claude Code
**Version projet :** Fonctionnel avec dette technique identifiée

---

## 1. VUE D'ENSEMBLE DU PROJET

### Stack technique
- **Frontend :** React Native (Expo)
- **Backend :** NestJS (Node.js / TypeScript)
- **Base de données :** PostgreSQL (TypeORM)
- **Authentification :** JWT + Refresh Token
- **Paiements :** Stripe

### Structure des répertoires
```
koosyapp/
├── koosy/           (Frontend React Native)
├── admin/           (Panel admin React + Vite)
├── backend/         (API NestJS)
```

---

## 2. POINTS FORTS DU PROJET

### Backend
- Structure par domaine métier (biens, reservations, taches, etc.)
- Intégration Stripe avec webhooks séparés
- Rotation des refresh tokens correctement implémentée
- Documentation Swagger/OpenAPI bien configurée
- Logger utilisé dans ChargesService

### Frontend
- Séparation claire hooks/components/screens
- ThemeContext avec palette switcher
- Utilisation de useMemo/useCallback aux bons endroits
- SearchBar компонент单独 (décomposé)

---

## 3. PROBLEMES CRITIQUES

### 3.1 Backend

| Problème | Fichier | Impact |
|----------|---------|--------|
| `synchronize: true` en prod | `app.module.ts` | Risque de perte de données si le schéma change |
| `ValidationPipe` sans whitelist | `main.ts` | Champs arbitraires acceptés par le backend |
| `countReservations()` sans filtre userId | `reservations.service.ts` | Retourne le total de toutes les réservations en base |
| Aucune Response DTO | Tous controllers | Les entities sont retournées telles quelles |
| Secrets avec fallback hardcodés | `auth.service.ts` | "devRefreshSecret123" ne devrait pas exister |
| CORS hardcodé sur localhost uniquement | `main.ts` | Pas d'ENV pour la production |
| Import dynamique `node-fetch` | `biens.service.ts` | Import à chaque appel dans geocodeAdresse() |
| `require()` dynamique | `taches.service.ts` | Devrait être un import static |

### 3.2 Frontend

| Problème | Fichier | Impact |
|----------|---------|--------|
| `BASE_URL` hardcodée | `config.ts` | IP non portable entre environnements |
| `login()` n'utilise pas `apiFetch()` | `api.ts` | Pas de refresh automatique sur login |
| Types incohérents (`id: string` vs `id: number`) | `models.ts` | Erreurs runtime potentielles |

---

## 4. LISTE DES FICHIERS A DECOMPOSER

### 4.1 FRONTEND (Koosy - React Native)

| # | Fichier | Lignes | Probleme principal |
|---|---------|--------|-------------------|
| 1 | `koosy/components/PlanningCalendar.tsx` | ~773 | 4 modes (list/today/week/month) dans 1 composant |
| 2 | `koosy/screens/Settings/ProfilScreen.tsx` | ~635 | "God screen" — profil + abonnement + entreprise + suppression compte |
| 3 | `koosy/screens/Layout/BiensScreen.tsx` | ~386 | Pagination + recherche + quota + 4 modales dans 1 écran |
| 4 | `koosy/screens/Layout/Homescreen.tsx` | ~357 | Agrège trop de composants enfants sans découpage |
| 5 | `koosy/screens/Layout/ChargesScreen.tsx` | ~304 | Logique filtres/état local non séparée |
| 6 | `koosy/screens/Layout/ReservationScreen.tsx` | ~285 | Filtres + drawer de détail non séparés |
| 7 | `koosy/screens/Layout/TachesScreen.tsx` | ~256 | Filtres devraient être dans un hook dédié |
| 8 | `koosy/components/ProprietaireList.tsx` | ~240 | États locaux (sélection/edit) non externalisés |

### 4.2 ADMIN (Vite - React)

| # | Fichier | Lignes | Probleme principal |
|---|---------|--------|-------------------|
| 9 | `admin/src/pages/users.tsx` | ~612 | "God page" — 60+ useState, liste + création + édition + abonnements |
| 10 | `admin/src/pages/biens.tsx` | ~568 | Filtres avancés + drawer dans 1 fichier |
| 11 | `admin/src/pages/reservations.tsx` | ~452 | Filtres + grille + drawer non séparés |
| 12 | `admin/src/pages/taches.tsx` | ~376 | Filtres + DrawerShell pourraient être des sous-composants |
| 13 | `admin/src/pages/notifications.tsx` | ~329 | UI complexe (2 colonnes, toggle) à découper |

### 4.3 BACKEND (NestJS)

| # | Fichier | Lignes | Probleme principal |
|---|---------|--------|-------------------|
| 14 | `backend/src/biens/biens.service.ts` | ~320 | 15 méthodes mélangeant CRUD + géocodage + quota |
| 15 | `backend/src/users/push-tokens/notifications.controller.ts` | ~302 | 10 routes sans lien (rappels + notifications + push) |
| 16 | `backend/src/subscriptions/subscription.controller.ts` | ~289 | Stripe création + webhooks + portal mélangés |
| 17 | `backend/src/biens/biens.controller.ts` | ~255 | Routes debug/rappels mélangées aux routes métier |
| 18 | `backend/src/devis/devis.service.ts` | ~234 | Génération PDF pourrait être un module séparé |
| 19 | `backend/src/subscriptions/stripe.service.ts` | ~233 | À vérifier si le controller fait trop |
| 20 | `backend/src/prestations/prestation.service.ts` | ~228 | Helpers de grouping à extraire |

**TOTAL : 20 fichiers à décomposer**

---

## 5. DETTE TECHNIQUE PAR PRIORITE

### CRITIQUE
1. **Désactiver `synchronize: true`** — Utiliser des migrations TypeORM
2. **Externaliser `BASE_URL`** — Dans `.env` ou `app.json` extra
3. **ValidationPipe** — Ajouter `whitelist: true, forbidNonWhitelisted: true`

### HAUTE
4. **Corriger `countReservations()`** — Ajouter filtre userId
5. **Fusionner les contexts** — 8+ contexts devraient être 2-3 maximum
6. **Décomposer App.tsx** — Navigation séparée (300+ lignes)
7. **Créer des Response DTOs** — Ne pas exposer les entities directement
8. **Unifier les appels API** — `login()` doit utiliser `apiFetch`

### MOYENNE
9. **Décomposer AddBienModal** — Sous-composants (BienForm, ProprietaireSelector, ImagePicker, QuotaBadge)
10. **Décomposer PlanningCalendar** — 4 modes dans 4 composants séparés
11. **Décomposer ProfilScreen** — ProfileForm, SubscriptionSection, EntrepriseSection
12. **Typer `settings: any`** — Dans User entity

### BASSE
13. **Remplacer `require()` dynamique** — Import static dans taches.service.ts
14. **Déplacer `node-fetch` en haut du fichier** — Import static dans biens.service.ts
15. **Uniformiser les imports** — Pas de mix require()/import dans App.tsx

---

## 6. RECOMMANDATIONS PAR PHASE

### Phase 1 : Sécurisation (1-2 jours)
- Remplacer `synchronize: true` par migrations
- Configurer ValidationPipe correctement
- Ajouter les Response DTOs
- Corriger countReservations()

### Phase 2 : Factorisation (3-5 jours)
- Fusionner les contexts (8 → 3)
- Décomposer App.tsx
- Décomposer AddBienModal
- Externaliser BASE_URL

### Phase 3 : Refactoring (1-2 semaines)
- Décomposer PlanningCalendar (4 composants)
- Décomposer ProfilScreen
- Décomposer tous les "god files" backend
- Uniformiser les patterns API

---

## 7. BONUS : Points d'attention spécifiques

### Entities (Backend)
- `decimal` sans précision explicite dans certaines entities (comportement зависит du driver)
- `settings: any` dans user.entity.ts — non typé
- `simple-array` sans accolades dans bien.entity.ts

### Frontend Models (models.ts)
- `Bien.id` est `string` (devrait être `number`)
- `Locataire.id` est `string` (devrait être `number`)
- Doublon `Proprietaire` vs `Proprio` (types légèrement différents)

### Performance
- `BiensScreen` fait 2 appels API pour un changement de statut
- Pas de `React.memo` sur les FlatList items — re-renders inutiles
- Race condition potentielle sur `refreshInFlight` dans api.ts

---

## 8. CONCLUSION

Le projet Koosy a une **architecture de base solide** avec une separation claire des responsabilités. La dette technique principale vient de la **croissance rapide** : les fichiers grossissent sans être décomposés, et certains raccourcis pris en dev n'ont pas été corrigés avant la mise en production.

La **priorité immédiate** devrait être la sécurisation (synchronize + ValidationPipe) car ces deux points peuvent causer des pertes de données ou des failles de sécurité.

La **vision à 3 mois** devrait être de réduire les 20 fichiers "god files" à une taille manageable, ce qui rendra le projet beaucoup plus maintenable pour une équipe de plusieurs développeurs.