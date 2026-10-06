// controllers/admin/services.controller.js

const { validate, serviceSchema } = require('../../utils/validators');
const prisma = require('../../utils/prisma');

exports.index = async (req, res) => {
  const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
  res.render('admin/services/index', { title: 'Gestion des services', services });
};

exports.newForm = (req, res) => {
  res.render('admin/services/form', { title: 'Nouveau service', service: null, errors: null });
};

exports.create = async (req, res) => {
  const body = { ...req.body, price: +(req.body.price || 0), duration: +req.body.duration, active: req.body.active === 'on' };
  const { error, value } = validate(serviceSchema, body);
  if (error) return res.render('admin/services/form', { title: 'Nouveau service', service: req.body, errors: error.details });
  await prisma.service.create({ data: value });
  req.session.success = 'Service créé.';
  res.redirect('/admin/services');
};

exports.editForm = async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: +req.params.id } });
  if (!service) return res.redirect('/admin/services');
  res.render('admin/services/form', { title: 'Modifier le service', service, errors: null });
};

exports.update = async (req, res) => {
  const body = { ...req.body, price: +(req.body.price || 0), duration: +req.body.duration, active: req.body.active === 'on' };
  const { error, value } = validate(serviceSchema, body);
  if (error) return res.render('admin/services/form', { title: 'Modifier le service', service: { ...req.body, id: +req.params.id }, errors: error.details });
  await prisma.service.update({ where: { id: +req.params.id }, data: value });
  req.session.success = 'Service mis à jour.';
  res.redirect('/admin/services');
};

exports.delete = async (req, res) => {
  await prisma.service.delete({ where: { id: +req.params.id } });
  req.session.success = 'Service supprimé.';
  res.redirect('/admin/services');
};
