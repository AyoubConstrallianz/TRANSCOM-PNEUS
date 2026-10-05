// controllers/public/legal.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getSettings() {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map(s => [s.key, s.value]));
}

exports.faq     = async (req, res) => { res.render('public/faq',     { title: 'FAQ — TRANSCOM PNEUS',              metaDescription: 'Vos questions sur le montage de pneus à domicile.', settings: await getSettings() }); };
exports.legal   = async (req, res) => { res.render('public/legal',   { title: 'Mentions légales — TRANSCOM PNEUS', metaDescription: '',    settings: await getSettings() }); };
exports.cgv     = async (req, res) => { res.render('public/cgv',     { title: 'CGV — TRANSCOM PNEUS',              metaDescription: '',    settings: await getSettings() }); };
exports.privacy = async (req, res) => { res.render('public/privacy', { title: 'Confidentialité — TRANSCOM PNEUS',  metaDescription: 'Politique de confidentialité RGPD.', settings: await getSettings() }); };
