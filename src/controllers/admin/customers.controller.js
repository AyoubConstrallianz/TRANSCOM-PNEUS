// controllers/admin/customers.controller.js

const { STATUS_LABELS } = require('../../services/booking.service');
const prisma = require('../../utils/prisma');

exports.index = async (req, res) => {
  const { search } = req.query;
  const where = search ? { OR: [{ name: { contains: search } }, { phone: { contains: search } }, { email: { contains: search } }] } : {};
  const customers = await prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' }, include: { _count: { select: { bookings: true } } } });
  res.render('admin/customers/index', { title: 'Clients', customers, query: req.query });
};

exports.show = async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: +req.params.id },
    include: { bookings: { include: { service: true, tire: true }, orderBy: { createdAt: 'desc' } } },
  });
  if (!customer) return res.redirect('/admin/customers');
  res.render('admin/customers/show', { title: customer.name, customer, STATUS_LABELS });
};
