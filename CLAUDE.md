# CLAUDE.md — TRANSCOM PNEUS

## Description du projet

Site web complet pour TRANSCOM PNEUS, entreprise de vente et réparation de pneus à domicile en Île-de-France.

## Stack & conventions

- **Node.js 18+ / Express 4** — pas de TypeScript, CommonJS (`require`/`module.exports`)
- **Prisma + SQLite (dev) / PostgreSQL (prod)** — schéma dans `prisma/schema.prisma`
- **EJS** — vues dans `src/views/`. Pas de layout middleware : chaque vue inclut les partials manuellement (`<%- include('../partials/header') %>` et `<%- include('../partials/footer') %>`)
- **Tailwind CSS** — source : `src/css/input.css`, compilé vers `public/css/tailwind.css`. Classes custom dans `@layer components`.
- **Validation** — schémas Joi dans `src/utils/validators.js`
- **Sécurité** — Helmet, CSRF (csrf-csrf, double-submit cookie), rate-limit, bcrypt (12 rounds)

## Architecture

```
Controllers → Services → Prisma → DB
Routes → Controllers (séparation admin / public)
```

- `src/controllers/admin/` — espace admin protégé
- `src/controllers/public/` — site public
- `src/services/` — logique métier (booking, email, zone)
- `src/middleware/` — auth, rateLimiter, upload

## Conventions de nommage

- Fichiers : `kebab-case.js`
- Variables/fonctions : `camelCase`
- Modèles Prisma : `PascalCase`
- Routes admin : préfixe `/admin/`
- Routes API legères : `/api/`

## Variables EJS disponibles dans toutes les vues

Injectées dans `app.js` via `res.locals` :
- `appName` — "TRANSCOM PNEUS"
- `phone` — numéro de téléphone
- `whatsapp` — numéro WhatsApp (format international)
- `currentPath` — chemin courant pour les menus actifs
- `csrfToken` — token CSRF (à mettre dans `<input type="hidden" name="_csrf">`)
- `success` / `error` — messages flash (session)

## Partials admin

Les vues admin utilisent :
- `<%- include('../../partials/admin-head') %>` en début de fichier
- `<%- include('../../partials/admin-foot') %>` en fin de fichier
- La variable `adminName` doit être passée si on veut afficher le nom dans la sidebar

## Modèles de données clés

- `Tire` — pneu (brand, model, width, ratio, diameter, season, buyPrice, sellPrice, stock)
- `Service` — prestation (name, price, duration)
- `Zone` — département IDF (dept, name, travelFee)
- `Booking` — réservation (customer→, tire→, service→, zone→, date, slot, status)
- `Customer` — client (name, phone, email, postalCode)
- `Setting` — clé/valeur (company_name, company_phone, slots, hero_title…)

## Sécurité — points importants

- Toutes les routes POST admin ont une vérification CSRF
- Login admin : verrouillage après 5 tentatives (15 min)
- Upload images : 5 Mo max, MIME check, nom aléatoire
- Pas d'injection SQL possible via Prisma ORM
- Validation Joi sur tous les formulaires publics

## Variables d'environnement requises

Voir `.env.example` — les clés importantes :
- `DATABASE_URL` — connexion DB
- `SESSION_SECRET` — secret sessions (fort en prod)
- `MAIL_*` — SMTP Nodemailer
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — compte admin (seed uniquement)
- `COMPANY_PHONE` / `COMPANY_WHATSAPP` — affichés partout

## Commandes utiles

```bash
npm run dev          # Développement
npm run db:seed      # Remettre les données de démo
npm run db:studio    # Interface graphique Prisma
npm run build:css    # Compiler Tailwind
```
