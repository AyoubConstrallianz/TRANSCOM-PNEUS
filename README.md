# TRANSCOM PNEUS — Site web

Site de vente et réservation de pneus à domicile en Île-de-France.

## Stack technique

- **Runtime** : Node.js 18+ (LTS)
- **Framework** : Express 4
- **Base de données** : SQLite (dev) / PostgreSQL (prod) via Prisma
- **Vues** : EJS + Tailwind CSS
- **Sécurité** : Helmet, CSRF (csrf-csrf), rate-limiting, bcrypt, sessions
- **Emails** : Nodemailer
- **Validation** : Joi
- **Logs** : Winston

---

## Installation rapide

```bash
# 1. Cloner / copier le projet
cd "TRANSCOM PNEUS"

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# 4. Initialiser la base de données + seed
npm run db:push
npm run db:seed

# 5. Compiler le CSS Tailwind
npm run build:css

# 6. Lancer en développement
npm run dev
```

Le site est accessible sur [http://localhost:3000](http://localhost:3000)
L'admin est accessible sur [http://localhost:3000/admin](http://localhost:3000/admin)

Credentials par défaut (seed) :
- Email : `admin@transcompneus.fr`
- Mot de passe : `Admin1234!`

> **IMPORTANT** : Changez ces identifiants en production via le fichier `.env`.

---

## Commandes disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur en développement (nodemon) |
| `npm start` | Démarre le serveur en production |
| `npm run build:css` | Compile Tailwind CSS (production) |
| `npm run watch:css` | Compile Tailwind en watch (dev) |
| `npm run db:push` | Applique le schéma Prisma à la base de données |
| `npm run db:seed` | Injecte les données de démonstration |
| `npm run db:studio` | Ouvre Prisma Studio (GUI base de données) |
| `npm run db:reset` | Réinitialise complètement la base + seed |
| `npm run setup` | Tout-en-un : install + db + seed + css |

---

## Structure du projet

```
├── app.js                  # Application Express (middleware, routes)
├── server.js               # Serveur HTTP
├── prisma/
│   ├── schema.prisma       # Modèles de données
│   └── seed.js             # Données de démonstration
├── src/
│   ├── config/
│   │   └── mailer.js       # Configuration Nodemailer
│   ├── controllers/
│   │   ├── admin/          # Controllers espace admin
│   │   └── public/         # Controllers site public
│   ├── middleware/
│   │   ├── auth.js         # Vérification session admin
│   │   ├── rateLimiter.js  # Rate limiting (express-rate-limit)
│   │   └── upload.js       # Upload images (Multer)
│   ├── routes/
│   │   ├── admin.routes.js
│   │   └── public.routes.js
│   ├── services/
│   │   ├── booking.service.js  # Logique réservation + export CSV
│   │   ├── email.service.js    # Envoi emails
│   │   └── zone.service.js     # Validation codes postaux IDF
│   ├── utils/
│   │   ├── logger.js           # Winston logger
│   │   └── validators.js       # Schémas Joi
│   └── views/
│       ├── partials/           # Header, footer, composants partagés
│       ├── public/             # Vues site public
│       └── admin/              # Vues espace admin
├── public/
│   ├── css/tailwind.css        # CSS compilé (généré)
│   └── uploads/                # Images pneus (gitignored)
└── logs/                       # Fichiers de logs (gitignored)
```

---

## Configuration email

Dans `.env`, renseignez vos paramètres SMTP :

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre@email.com
MAIL_PASS=votre_mot_de_passe_application  # Pour Gmail : mot de passe d'application
```

> Pour Gmail, créez un "Mot de passe d'application" dans les paramètres de sécurité du compte.

---

## Déploiement en production

### Option 1 — VPS (Ubuntu/Debian)

```bash
# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner le projet
git clone <repo> /var/www/transcom-pneus
cd /var/www/transcom-pneus
npm install --production

# Configurer .env (PostgreSQL, SESSION_SECRET fort, etc.)
cp .env.example .env
nano .env

# Build
npm run build:css
npm run db:push
npm run db:seed

# Démarrer avec PM2
npm install -g pm2
pm2 start server.js --name transcom-pneus
pm2 startup && pm2 save

# Nginx reverse proxy
# proxy_pass http://localhost:3000;
```

### Option 2 — Render.com

1. Créer un service Web depuis votre repo GitHub
2. Build command : `npm install && npm run build:css && npm run db:push && npm run db:seed`
3. Start command : `node server.js`
4. Ajouter les variables d'environnement depuis `.env.example`
5. Ajouter un add-on PostgreSQL (changer `DATABASE_URL` en conséquence)

### Option 3 — Railway.app

1. Connecter votre repo GitHub
2. Ajouter un service PostgreSQL
3. Configurer les variables d'environnement
4. Deploy automatique à chaque push

---

## Passer en production PostgreSQL

1. Dans `.env`, remplacer `DATABASE_URL` :
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/transcom_pneus"
   ```
2. Dans `prisma/schema.prisma`, changer :
   ```prisma
   provider = "postgresql"
   ```
3. Relancer `npm run db:push`

---

## Sécurité

- Changez `SESSION_SECRET` avec une chaîne aléatoire longue (32+ caractères)
- Changez les identifiants admin par défaut
- En production, activez HTTPS (Let's Encrypt via Certbot ou votre hébergeur)
- Les logs d'erreurs sont dans `logs/error.log`
