// controllers/public/booking.controller.js

const { validate, bookingSchema } = require('../../utils/validators');
const { createBooking } = require('../../services/booking.service');
const { getZoneByPostalCode, isIleDeFrance } = require('../../services/zone.service');
const { sendBookingConfirmation } = require('../../services/email.service');
const logger = require('../../utils/logger');

const prisma = require('../../utils/prisma');

exports.form = async (req, res) => {
  try {
    const [services, tires, settings] = await Promise.all([
      prisma.service.findMany({ where: { active: true }, orderBy: { price: 'asc' } }),
      prisma.tire.findMany({ where: { active: true, stock: { gt: 0 } }, orderBy: [{ brand: 'asc' }, { model: 'asc' }] }),
      prisma.setting.findMany(),
    ]);
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
    const slots = (settingsMap.slots || '08:00,09:00,10:00,11:00,12:00,14:00,15:00,16:00,17:00,18:00').split(',');

    // Pré-sélection depuis le catalogue
    const preselectedTire = req.query.tireId
      ? tires.find(t => t.id === parseInt(req.query.tireId))
      : null;

    res.render('public/booking', {
      title: 'Prendre rendez-vous — TRANSCOM PNEUS',
      metaDescription: 'Réservez votre intervention de montage ou réparation de pneus à domicile en Île-de-France.',
      services, tires, slots, settings: settingsMap,
      prefill: req.query,
      preselectedTire,
      errors: null,
      formData: {},
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};

exports.submit = async (req, res) => {
  const { error, value } = validate(bookingSchema, req.body);

  if (error) {
    const [services, tires, settings] = await Promise.all([
      prisma.service.findMany({ where: { active: true } }),
      prisma.tire.findMany({ where: { active: true, stock: { gt: 0 } } }),
      prisma.setting.findMany(),
    ]);
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
    const slots = (settingsMap.slots || '08:00,09:00,10:00,11:00,14:00,15:00,16:00').split(',');
    return res.status(400).render('public/booking', {
      title: 'Prendre rendez-vous — TRANSCOM PNEUS',
      metaDescription: '',
      services, tires, slots, settings: settingsMap,
      prefill: {}, preselectedTire: null,
      errors: error.details,
      formData: req.body,
    });
  }

  try {
    const booking = await createBooking(value);
    await sendBookingConfirmation(booking);
    req.session.bookingId = booking.id;
    res.redirect('/reservation/merci');
  } catch (e) {
    logger.error('Erreur création réservation', { err: e.message });
    res.status(500).render('public/error', { title: 'Erreur', message: 'Impossible de créer la réservation. Veuillez nous appeler directement.' });
  }
};

exports.thanks = async (req, res) => {
  const settings = Object.fromEntries((await prisma.setting.findMany()).map(s => [s.key, s.value]));
  res.render('public/booking-thanks', {
    title: 'Réservation confirmée — TRANSCOM PNEUS',
    metaDescription: '',
    settings,
    bookingId: req.session.bookingId,
  });
};

// API : infos zone selon code postal
exports.zoneInfo = async (req, res) => {
  const cp = req.params.cp;
  if (!isIleDeFrance(cp)) {
    return res.json({ valid: false, message: 'Code postal hors Île-de-France.' });
  }
  const { zone, travelFee } = await getZoneByPostalCode(cp);
  res.json({ valid: true, dept: cp.substring(0,2), deptName: zone?.name, travelFee });
};

// API : créneaux disponibles pour une date donnée
exports.availableSlots = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.json({ slots: [] });
  const settings = Object.fromEntries((await prisma.setting.findMany()).map(s => [s.key, s.value]));
  const allSlots = (settings.slots || '08:00,09:00,10:00,11:00,12:00,14:00,15:00,16:00').split(',');
  // Retourner tous les créneaux (possibilité future : bloquer les créneaux pris)
  res.json({ slots: allSlots });
};
