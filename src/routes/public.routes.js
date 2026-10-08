// routes/public.routes.js
const express = require('express');
const router  = express.Router();
const { bookingLimiter } = require('../middleware/rateLimiter');

const homeCtrl    = require('../controllers/public/home.controller');
const catalogCtrl = require('../controllers/public/catalog.controller');
const bookCtrl    = require('../controllers/public/booking.controller');
const contactCtrl = require('../controllers/public/contact.controller');
const legalCtrl   = require('../controllers/public/legal.controller');
const seoCtrl     = require('../controllers/public/seoPages.controller');

// Accueil
router.get('/', homeCtrl.home);

// Catalogue — désactivé temporairement, redirection vers les services
router.get('/catalogue',         (req, res) => res.redirect('/services'));
router.get('/catalogue/:id',     (req, res) => res.redirect('/services'));

// Services
router.get('/services',          homeCtrl.services);

// Réservation
router.get( '/reservation',      bookCtrl.form);
router.post('/reservation',      bookingLimiter, bookCtrl.submit);
router.get( '/reservation/merci',bookCtrl.thanks);

// Devis rapide (AJAX - calcul frais)
router.get('/api/zone/:cp',      bookCtrl.zoneInfo);
router.get('/api/slots',         bookCtrl.availableSlots);

// Contact
router.get( '/contact',          contactCtrl.form);
router.post('/contact',          contactCtrl.submit);

// Pages légales
router.get('/faq',               legalCtrl.faq);
router.get('/mentions-legales',  legalCtrl.legal);
router.get('/cgv',               legalCtrl.cgv);
router.get('/confidentialite',   legalCtrl.privacy);

// Pages SEO par département
router.get('/pneus-domicile/:dept', homeCtrl.department);

// Pages SEO par service
router.get('/depannage-pneu',         seoCtrl.depannagePneu);
router.get('/crevaison-voiture',      seoCtrl.crevaisonVoiture);
router.get('/crevaison-camion',       seoCtrl.crevaisonCamion);
router.get('/soudure-domicile',       seoCtrl.soudure);
router.get('/montage-pneu-domicile',  seoCtrl.montagePneu);
router.get('/equilibrage-roues',      seoCtrl.equilibrage);

module.exports = router;
