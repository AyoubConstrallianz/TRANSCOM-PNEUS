// routes/admin.routes.js
const express = require('express');
const router  = express.Router();

const { requireAuth, redirectIfAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

const authCtrl     = require('../controllers/admin/auth.controller');
const dashCtrl     = require('../controllers/admin/dashboard.controller');
const tiresCtrl    = require('../controllers/admin/tires.controller');
const servicesCtrl = require('../controllers/admin/services.controller');
const bookCtrl     = require('../controllers/admin/bookings.controller');
const custCtrl     = require('../controllers/admin/customers.controller');
const settCtrl     = require('../controllers/admin/settings.controller');
const zonesCtrl    = require('../controllers/admin/zones.controller');
const devisCtrl    = require('../controllers/admin/devis.controller');

// ── Auth ──────────────────────────────────────────────────────────────────────
router.get( '/login',  redirectIfAuth, authCtrl.loginPage);
router.post('/login',  redirectIfAuth, loginLimiter, authCtrl.login);
router.post('/logout', requireAuth, authCtrl.logout);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/', requireAuth, dashCtrl.dashboard);

// ── Pneus ─────────────────────────────────────────────────────────────────────
router.get( '/tires',              requireAuth, tiresCtrl.index);
router.get( '/tires/new',          requireAuth, tiresCtrl.newForm);
router.post('/tires',              requireAuth, upload.single('image'), tiresCtrl.create);
router.get( '/tires/pricing',      requireAuth, tiresCtrl.pricingPage);
router.post('/tires/pricing/bulk', requireAuth, tiresCtrl.bulkPrice);
router.get( '/tires/:id/edit',     requireAuth, tiresCtrl.editForm);
router.post('/tires/:id',          requireAuth, upload.single('image'), tiresCtrl.update);
router.post('/tires/:id/delete',   requireAuth, tiresCtrl.delete);
router.post('/tires/:id/price',    requireAuth, tiresCtrl.updatePrice);
router.post('/tires/:id/toggle',   requireAuth, tiresCtrl.toggle);

// ── Services ──────────────────────────────────────────────────────────────────
router.get( '/services',           requireAuth, servicesCtrl.index);
router.get( '/services/new',       requireAuth, servicesCtrl.newForm);
router.post('/services',           requireAuth, servicesCtrl.create);
router.get( '/services/:id/edit',  requireAuth, servicesCtrl.editForm);
router.post('/services/:id',       requireAuth, servicesCtrl.update);
router.post('/services/:id/delete',requireAuth, servicesCtrl.delete);

// ── Zones ─────────────────────────────────────────────────────────────────────
router.get( '/zones',          requireAuth, zonesCtrl.index);
router.post('/zones/settings', requireAuth, zonesCtrl.updateSetting);
router.post('/zones/:id',      requireAuth, zonesCtrl.update);

// ── Réservations ──────────────────────────────────────────────────────────────
router.get( '/bookings',              requireAuth, bookCtrl.index);
router.get( '/bookings/export',       requireAuth, bookCtrl.exportCSV);
router.get( '/bookings/:id',          requireAuth, bookCtrl.show);
router.post('/bookings/:id/status',   requireAuth, bookCtrl.updateStatus);
router.post('/bookings/:id/notes',    requireAuth, bookCtrl.updateNotes);
router.post('/bookings/:id/delete',   requireAuth, bookCtrl.delete);

// ── Clients ───────────────────────────────────────────────────────────────────
router.get('/customers',     requireAuth, custCtrl.index);
router.get('/customers/:id', requireAuth, custCtrl.show);

// ── Paramètres ────────────────────────────────────────────────────────────────
router.get( '/settings',     requireAuth, settCtrl.index);
router.post('/settings',     requireAuth, settCtrl.update);

// ── Devis ─────────────────────────────────────────────────────────────────────
router.get( '/devis',              requireAuth, devisCtrl.index);
router.get( '/devis/new',          requireAuth, devisCtrl.createForm);
router.post('/devis',              requireAuth, devisCtrl.create);
router.get( '/devis/:id',          requireAuth, devisCtrl.show);
router.post('/devis/:id/send',     requireAuth, devisCtrl.send);
router.post('/devis/:id/status',   requireAuth, devisCtrl.updateStatus);
router.post('/devis/:id/delete',   requireAuth, devisCtrl.destroy);

module.exports = router;
