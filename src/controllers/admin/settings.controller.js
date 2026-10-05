// controllers/admin/settings.controller.js
const { PrismaClient } = require('@prisma/client');
const { refresh } = require('../../utils/settingsCache');
const prisma = new PrismaClient();

exports.index = async (req, res) => {
  const rows = await prisma.setting.findMany();
  const settings = Object.fromEntries(rows.map(s => [s.key, s.value]));
  res.render('admin/settings/index', { title: 'Paramètres', settings });
};

exports.update = async (req, res) => {
  const keys = [
    'company_name','company_phone','company_whatsapp','company_email',
    'company_address','opening_hours','slots','hero_title','hero_subtitle','meta_description',
  ];
  for (const key of keys) {
    if (req.body[key] !== undefined) {
      await prisma.setting.upsert({
        where:  { key },
        update: { value: req.body[key] },
        create: { key, value: req.body[key] },
      });
    }
  }
  await refresh();
  req.session.success = 'Paramètres sauvegardés.';
  res.redirect('/admin/settings');
};
