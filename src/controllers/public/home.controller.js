// controllers/public/home.controller.js

const prisma = require('../../utils/prisma');
const DEPT_CITIES = require('../../data/cities');

const DEPT_NAMES = {
  '75': 'Paris', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': "Val-d'Oise",
};

async function getSettings() {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map(s => [s.key, s.value]));
}

exports.home = async (req, res) => {
  try {
    const [settings, reviews, featuredTires, services] = await Promise.all([
      getSettings(),
      prisma.review.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.tire.findMany({ where: { active: true, stock: { gt: 0 } }, orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.service.findMany({ where: { active: true }, orderBy: { price: 'asc' } }),
    ]);

    res.render('public/index', {
      title: 'Dépannage Pneu & Soudure à Domicile Île-de-France — TRANSCOM PNEUS 7j/7 24h/24',
      metaDescription: 'TRANSCOM PNEUS : dépannage pneu crevé, montage à domicile, soudure et réparation en Île-de-France (75, 77, 78, 91, 92, 93, 94, 95). Intervention rapide 7j/7 et 24h/24. Devis gratuit.',
      settings,
      reviews,
      featuredTires,
      services,
      depts: DEPT_NAMES,
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};

exports.services = async (req, res) => {
  try {
    const [settings, services] = await Promise.all([getSettings(), prisma.service.findMany({ where: { active: true } })]);
    res.render('public/services', {
      title: 'Dépannage Pneu, Soudure & Montage à Domicile — TRANSCOM PNEUS Île-de-France',
      metaDescription: 'Tous nos services : dépannage pneu crevé, montage pneus à domicile, soudure acier, réparation crevaison, équilibrage — TRANSCOM PNEUS, 7j/7 et 24h/24 en Île-de-France.',
      settings,
      services,
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};

exports.department = async (req, res) => {
  const dept = req.params.dept;
  const deptName = DEPT_NAMES[dept];
  if (!deptName) return res.redirect('/');

  try {
    const [settings, zone] = await Promise.all([getSettings(), prisma.zone.findUnique({ where: { dept } })]);
    res.render('public/department', {
      title: `Dépannage Pneu à Domicile ${deptName} (${dept}) — TRANSCOM PNEUS 7j/7 24h/24`,
      metaDescription: `TRANSCOM PNEUS : dépannage pneu crevé, montage et réparation de pneus à domicile dans le ${dept} – ${deptName}. Intervention rapide 7j/7 et 24h/24. Devis gratuit.`,
      settings,
      dept,
      deptName,
      zone,
      depts: DEPT_NAMES,
      cities: DEPT_CITIES[dept] || [],
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};
