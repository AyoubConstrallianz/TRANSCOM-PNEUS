// controllers/admin/zones.controller.js
const { PrismaClient } = require('@prisma/client');
const { refresh } = require('../../utils/settingsCache');
const prisma = new PrismaClient();

exports.index = async (req, res) => {
  const [zones, settings] = await Promise.all([
    prisma.zone.findMany({ orderBy: { dept: 'asc' } }),
    prisma.setting.findMany(),
  ]);
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
  res.render('admin/zones/index', { title: 'Zones & frais de déplacement', zones, settings: settingsMap });
};

exports.update = async (req, res) => {
  const { travelFee } = req.body;
  await prisma.zone.update({ where: { id: +req.params.id }, data: { travelFee: +travelFee } });
  req.session.success = 'Frais mis à jour.';
  res.redirect('/admin/zones');
};

exports.updateSetting = async (req, res) => {
  const value = req.body.show_travel_fee === '1' ? '1' : '0';
  await prisma.setting.upsert({
    where:  { key: 'show_travel_fee' },
    update: { value },
    create: { key: 'show_travel_fee', value },
  });
  await refresh();
  req.session.success = 'Paramètre mis à jour.';
  res.redirect('/admin/zones');
};
