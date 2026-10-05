// controllers/admin/bookings.controller.js
const { PrismaClient } = require('@prisma/client');
const { exportCSV, STATUS_LABELS } = require('../../services/booking.service');
const prisma = new PrismaClient();

const include = { customer: true, tire: true, service: true, zone: true };

exports.index = async (req, res) => {
  const { status, date, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (date)   where.date   = { gte: new Date(date + 'T00:00:00'), lt: new Date(date + 'T23:59:59') };
  if (search) where.OR = [
    { customer: { name:  { contains: search } } },
    { customer: { phone: { contains: search } } },
    { plate:    { contains: search } },
  ];

  const bookings = await prisma.booking.findMany({ where, include, orderBy: { date: 'desc' } });
  res.render('admin/bookings/index', { title: 'Réservations', bookings, STATUS_LABELS, query: req.query });
};

exports.show = async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: +req.params.id }, include });
  if (!booking) return res.redirect('/admin/bookings');
  res.render('admin/bookings/show', { title: `Réservation #${booking.id}`, booking, STATUS_LABELS });
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!Object.keys(STATUS_LABELS).includes(status)) return res.redirect('/admin/bookings');
  await prisma.booking.update({ where: { id: +req.params.id }, data: { status } });
  req.session.success = 'Statut mis à jour.';
  res.redirect(`/admin/bookings/${req.params.id}`);
};

exports.updateNotes = async (req, res) => {
  await prisma.booking.update({ where: { id: +req.params.id }, data: { notes: req.body.notes || '' } });
  res.redirect(`/admin/bookings/${req.params.id}`);
};

exports.delete = async (req, res) => {
  await prisma.booking.delete({ where: { id: +req.params.id } });
  req.session.success = 'Réservation supprimée.';
  res.redirect('/admin/bookings');
};

exports.exportCSV = async (req, res) => {
  const csv = await exportCSV();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="reservations-${Date.now()}.csv"`);
  res.send('\uFEFF' + csv); // BOM UTF-8 pour Excel
};
