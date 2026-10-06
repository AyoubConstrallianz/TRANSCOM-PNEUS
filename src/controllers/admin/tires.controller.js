// controllers/admin/tires.controller.js

const path   = require('path');
const fs     = require('fs');
const { validate, tireSchema, bulkPriceSchema } = require('../../utils/validators');
const logger = require('../../utils/logger');

const prisma = require('../../utils/prisma');

exports.index = async (req, res) => {
  const { brand, season, search, lowstock } = req.query;
  const where = {};
  if (brand)    where.brand  = brand;
  if (season)   where.season = season;
  if (lowstock) where.stock  = { lte: 3 };
  if (search)   where.OR = [
    { brand: { contains: search } },
    { model: { contains: search } },
  ];

  const [tires, brands] = await Promise.all([
    prisma.tire.findMany({ where, orderBy: { brand: 'asc' } }),
    prisma.tire.findMany({ distinct: ['brand'], select: { brand: true }, orderBy: { brand: 'asc' } }),
  ]);
  res.render('admin/tires/index', { title: 'Gestion des pneus', tires, brands, query: req.query });
};

exports.newForm = (req, res) => {
  res.render('admin/tires/form', { title: 'Nouveau pneu', tire: null, errors: null });
};

exports.create = async (req, res) => {
  const body = { ...req.body, width: +req.body.width, ratio: +req.body.ratio, diameter: +req.body.diameter, buyPrice: +req.body.buyPrice, sellPrice: +req.body.sellPrice, stock: +req.body.stock, active: req.body.active === 'on' };
  const { error, value } = validate(tireSchema, body);
  if (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.render('admin/tires/form', { title: 'Nouveau pneu', tire: req.body, errors: error.details });
  }
  if (req.file) value.imageUrl = '/uploads/' + req.file.filename;
  await prisma.tire.create({ data: value });
  req.session.success = 'Pneu créé avec succès.';
  res.redirect('/admin/tires');
};

exports.editForm = async (req, res) => {
  const tire = await prisma.tire.findUnique({ where: { id: +req.params.id } });
  if (!tire) return res.redirect('/admin/tires');
  res.render('admin/tires/form', { title: 'Modifier le pneu', tire, errors: null });
};

exports.update = async (req, res) => {
  const id = +req.params.id;
  const existing = await prisma.tire.findUnique({ where: { id } });
  if (!existing) return res.redirect('/admin/tires');

  const body = { ...req.body, width: +req.body.width, ratio: +req.body.ratio, diameter: +req.body.diameter, buyPrice: +req.body.buyPrice, sellPrice: +req.body.sellPrice, stock: +req.body.stock, active: req.body.active === 'on' };
  const { error, value } = validate(tireSchema, body);
  if (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.render('admin/tires/form', { title: 'Modifier le pneu', tire: { ...req.body, id }, errors: error.details });
  }
  if (req.file) {
    if (existing.imageUrl) {
      const old = path.join(__dirname, '../../../public', existing.imageUrl);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    value.imageUrl = '/uploads/' + req.file.filename;
  }
  await prisma.tire.update({ where: { id }, data: value });
  req.session.success = 'Pneu mis à jour.';
  res.redirect('/admin/tires');
};

exports.delete = async (req, res) => {
  const id = +req.params.id;
  const tire = await prisma.tire.findUnique({ where: { id } });
  if (tire?.imageUrl) {
    const p = path.join(__dirname, '../../../public', tire.imageUrl);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  await prisma.tire.delete({ where: { id } });
  req.session.success = 'Pneu supprimé.';
  res.redirect('/admin/tires');
};

exports.toggle = async (req, res) => {
  const tire = await prisma.tire.findUnique({ where: { id: +req.params.id } });
  if (!tire) return res.redirect('/admin/tires');
  await prisma.tire.update({ where: { id: tire.id }, data: { active: !tire.active } });
  res.redirect('/admin/tires');
};

exports.updatePrice = async (req, res) => {
  const { sellPrice, buyPrice } = req.body;
  await prisma.tire.update({ where: { id: +req.params.id }, data: { sellPrice: +sellPrice, buyPrice: +buyPrice } });
  res.redirect('/admin/tires/pricing');
};

exports.pricingPage = async (req, res) => {
  const brands = await prisma.tire.findMany({ distinct: ['brand'], select: { brand: true }, orderBy: { brand: 'asc' } });
  const tires  = await prisma.tire.findMany({ orderBy: [{ brand: 'asc' }, { model: 'asc' }] });
  res.render('admin/tires/pricing', { title: 'Gestion des prix', tires, brands });
};

exports.bulkPrice = async (req, res) => {
  const { error, value } = validate(bulkPriceSchema, req.body);
  if (error) { req.session.error = error.details[0].message; return res.redirect('/admin/tires/pricing'); }

  const { type, value: v, brand, applyTo } = value;
  const where = brand ? { brand } : {};
  const tires = await prisma.tire.findMany({ where });

  for (const t of tires) {
    const delta = type === 'percent' ? v / 100 : v;
    const newSell = type === 'percent' ? parseFloat((t.sellPrice * (1 + delta)).toFixed(2)) : parseFloat((t.sellPrice + delta).toFixed(2));
    const newBuy  = type === 'percent' ? parseFloat((t.buyPrice  * (1 + delta)).toFixed(2)) : parseFloat((t.buyPrice  + delta).toFixed(2));
    const data = { sellPrice: newSell };
    if (applyTo === 'both') data.buyPrice = newBuy;
    await prisma.tire.update({ where: { id: t.id }, data });
  }

  req.session.success = `Prix mis à jour pour ${tires.length} pneu(s).`;
  res.redirect('/admin/tires/pricing');
};
