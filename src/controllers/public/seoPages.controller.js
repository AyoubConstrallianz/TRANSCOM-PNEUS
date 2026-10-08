// controllers/public/seoPages.controller.js
// Pages de service dédiées pour le SEO — une page par cluster de mots-clés

const prisma = require('../../utils/prisma');

async function getSettings() {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map(s => [s.key, s.value]));
}

const DEPTS = {
  '75': 'Paris', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': "Val-d'Oise",
};

// ── Dépannage pneu Île-de-France ────────────────────────────────────────────
exports.depannagePneu = async (req, res) => {
  const settings = await getSettings();
  res.render('public/seo/depannage-pneu', {
    title: 'Dépannage Pneu à Domicile Île-de-France — TRANSCOM PNEUS 7j/7 24h/24',
    metaDescription: 'Dépannage pneu crevé à domicile en Île-de-France. Intervention rapide 7j/7 et 24h/24. Changement de pneu, réparation crevaison, montage sur place. TRANSCOM PNEUS.',
    settings, depts: DEPTS,
  });
};

// ── Crevaison voiture ───────────────────────────────────────────────────────
exports.crevaisonVoiture = async (req, res) => {
  const settings = await getSettings();
  res.render('public/seo/crevaison-voiture', {
    title: 'Réparation Crevaison Voiture à Domicile Île-de-France — TRANSCOM PNEUS',
    metaDescription: 'Pneu crevé sur votre voiture ? TRANSCOM PNEUS intervient à domicile en Île-de-France pour réparer ou remplacer votre pneu crevé. Dépannage rapide 7j/7 et 24h/24.',
    settings, depts: DEPTS,
  });
};

// ── Crevaison camion / utilitaire ───────────────────────────────────────────
exports.crevaisonCamion = async (req, res) => {
  const settings = await getSettings();
  res.render('public/seo/crevaison-camion', {
    title: 'Réparation Crevaison Camion & Utilitaire à Domicile — TRANSCOM PNEUS Île-de-France',
    metaDescription: 'Crevaison sur camion, utilitaire ou poids lourd ? TRANSCOM PNEUS intervient sur place en Île-de-France pour la réparation et le changement de pneu. 7j/7 24h/24.',
    settings, depts: DEPTS,
  });
};

// ── Soudure à domicile ─────────────────────────────────────────────────────
exports.soudure = async (req, res) => {
  const settings = await getSettings();
  res.render('public/seo/soudure', {
    title: 'Soudure à Domicile Île-de-France — Soudure Tresse, Acier, Réparation | TRANSCOM PNEUS',
    metaDescription: 'Service de soudure à domicile en Île-de-France : soudure tresse voiture, soudure acier, réparation pot d\'échappement, châssis, berceau. Intervention 7j/7. TRANSCOM PNEUS.',
    settings, depts: DEPTS,
  });
};

// ── Montage pneu à domicile ────────────────────────────────────────────────
exports.montagePneu = async (req, res) => {
  const settings = await getSettings();
  res.render('public/seo/montage-pneu', {
    title: 'Montage de Pneus à Domicile Île-de-France — TRANSCOM PNEUS 7j/7',
    metaDescription: 'Montage et démontage de pneus à domicile en Île-de-France. Équilibrage inclus, tous véhicules. Intervention rapide sans vous déplacer. TRANSCOM PNEUS.',
    settings, depts: DEPTS,
  });
};

// ── Équilibrage ─────────────────────────────────────────────────────────────
exports.equilibrage = async (req, res) => {
  const settings = await getSettings();
  res.render('public/seo/equilibrage', {
    title: 'Équilibrage de Roues à Domicile Île-de-France — TRANSCOM PNEUS',
    metaDescription: 'Équilibrage de roues à domicile en Île-de-France. Éliminez vibrations et usure prématurée. TRANSCOM PNEUS intervient chez vous 7j/7.',
    settings, depts: DEPTS,
  });
};
