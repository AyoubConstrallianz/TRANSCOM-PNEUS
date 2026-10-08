// controllers/public/legal.controller.js

const prisma = require('../../utils/prisma');

async function getSettings() {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map(s => [s.key, s.value]));
}

exports.faq     = async (req, res) => { res.render('public/faq',     { title: 'FAQ Dépannage Pneu à Domicile — TRANSCOM PNEUS Île-de-France',              metaDescription: 'Questions fréquentes sur le dépannage pneu à domicile en Île-de-France : délais, tarifs, départements couverts, paiement. TRANSCOM PNEUS 7j/7 et 24h/24.', settings: await getSettings() }); };
exports.legal   = async (req, res) => { res.render('public/legal',   { title: 'Mentions légales — TRANSCOM PNEUS', metaDescription: '',    settings: await getSettings() }); };
exports.cgv     = async (req, res) => { res.render('public/cgv',     { title: 'CGV — TRANSCOM PNEUS',              metaDescription: '',    settings: await getSettings() }); };
exports.privacy = async (req, res) => { res.render('public/privacy', { title: 'Confidentialité — TRANSCOM PNEUS',  metaDescription: 'Politique de confidentialité RGPD.', settings: await getSettings() }); };
