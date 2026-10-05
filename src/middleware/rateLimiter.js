// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// Limite générale pour les routes publiques (skip admin en dev)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: isDev ? 2000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => isDev && req.path.startsWith('/admin'),
  message: { error: 'Trop de requêtes, veuillez réessayer dans 15 minutes.' },
});

// Limite stricte pour le login admin (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

// Limite pour le formulaire de réservation
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de réservations soumises. Réessayez dans 1 heure.' },
});

module.exports = { generalLimiter, loginLimiter, bookingLimiter };
