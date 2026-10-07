// app.js — Configuration Express principale
require('dotenv').config();

const express      = require('express');
const path         = require('path');
const helmet       = require('helmet');
const morgan       = require('morgan');
const session      = require('express-session');
const PrismaSessionStore = require('./src/utils/sessionStore');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');

const { generalLimiter } = require('./src/middleware/rateLimiter');
const logger             = require('./src/utils/logger');
const { getSettings }    = require('./src/utils/settingsCache');
const publicRoutes       = require('./src/routes/public.routes');
const adminRoutes        = require('./src/routes/admin.routes');

const app = express();

// ── Vues EJS ──────────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ── Sécurité ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc:    ["'self'", 'fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'blob:'],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", 'https://api-adresse.data.gouv.fr'],
    },
  },
}));

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser(process.env.SESSION_SECRET));

// ── Sessions (Prisma store — partagé entre toutes les instances Vercel) ────────
app.use(session({
  store:             new PrismaSessionStore(),
  secret:            process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge:   8 * 60 * 60 * 1000, // 8h
    sameSite: 'lax',
  },
}));

// ── Variables globales pour les vues (avant CSRF pour être dispo dans les erreurs) ──
app.use(async (req, res, next) => {
  try {
    const s = await getSettings();
    res.locals.appName     = s.company_name    || 'TRANSCOM PNEUS';
    res.locals.phone       = s.company_phone   || process.env.COMPANY_PHONE    || '+33 1 XX XX XX XX';
    res.locals.whatsapp    = s.company_whatsapp || process.env.COMPANY_WHATSAPP || '+33XXXXXXXXX';
  } catch {
    res.locals.appName  = 'TRANSCOM PNEUS';
    res.locals.phone    = process.env.COMPANY_PHONE    || '+33 1 XX XX XX XX';
    res.locals.whatsapp = process.env.COMPANY_WHATSAPP || '+33XXXXXXXXX';
  }
  res.locals.currentPath = req.path;
  res.locals.success     = req.session?.success || null;
  res.locals.error       = req.session?.error   || null;
  if (req.session) {
    delete req.session.success;
    delete req.session.error;
  }
  next();
});

// ── CSRF ──────────────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret:  () => process.env.SESSION_SECRET || 'dev-secret',
  // Pas de préfixe __Host- en dev (exige HTTPS), on l'active uniquement en prod
  cookieName: isProd ? '__Host-csrf-token' : 'csrf-token',
  cookieOptions: {
    secure:   isProd,
    sameSite: 'lax',
    path:     '/',
  },
  size: 64,
  getTokenFromRequest: (req) =>
    req.body?._csrf || req.headers['x-csrf-token'],
});
app.use(doubleCsrfProtection);

// Rendre le token CSRF disponible dans toutes les vues
app.use((req, res, next) => {
  res.locals.csrfToken = generateToken(req, res);
  next();
});

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: (req) => req.url.startsWith('/public'),
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Fichiers statiques ────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProd ? '7d' : 0,
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/',       publicRoutes);
app.use('/admin',  adminRoutes);

// Sitemap
app.get('/sitemap.xml', require('./src/controllers/public/seo.controller').sitemap);
app.get('/robots.txt',  require('./src/controllers/public/seo.controller').robots);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('public/404', { title: 'Page introuvable — TRANSCOM PNEUS' });
});

// ── Gestion des erreurs ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  // Erreur CSRF
  if (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token') {
    return res.status(403).render('public/error', {
      title:   'Erreur de sécurité',
      message: 'Token de sécurité invalide. Veuillez actualiser la page.',
    });
  }
  logger.error('Erreur serveur', { url: req.url, err: err.message, stack: err.stack });
  res.status(err.status || 500).render('public/error', {
    title:   'Erreur serveur',
    message: process.env.NODE_ENV === 'production' ? 'Une erreur inattendue est survenue.' : err.message,
  });
});

module.exports = app;
