// controllers/public/home.controller.js

const prisma = require('../../utils/prisma');

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
      title: `${settings.company_name || 'TRANSCOM PNEUS'} — Pneus à domicile Île-de-France`,
      metaDescription: settings.meta_description || '',
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
      title: 'Nos services — TRANSCOM PNEUS',
      metaDescription: 'Montage à domicile, réparation de crevaison, équilibrage, dépannage — TRANSCOM PNEUS intervient chez vous en Île-de-France.',
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
      title: `Pneus à domicile ${deptName} (${dept}) — TRANSCOM PNEUS`,
      metaDescription: `TRANSCOM PNEUS intervient à domicile dans le ${dept} – ${deptName}. Montage, réparation, équilibrage. Intervention rapide.`,
      settings,
      dept,
      deptName,
      zone,
      depts: DEPT_NAMES,
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};
