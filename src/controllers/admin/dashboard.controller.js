// controllers/admin/dashboard.controller.js

const { getTodayBookings } = require('../../services/booking.service');
const prisma = require('../../utils/prisma');

exports.dashboard = async (req, res) => {
  try {
    const [todayBookings, totalBookings, totalRevenue, lowStock, recentBookings] = await Promise.all([
      getTodayBookings(),
      prisma.booking.count({ where: { status: { not: 'cancelled' } } }),
      prisma.booking.aggregate({ where: { status: 'done' }, _sum: { totalPrice: true } }),
      prisma.tire.findMany({ where: { stock: { lte: 3 }, active: true }, orderBy: { stock: 'asc' }, take: 10 }),
      prisma.booking.findMany({
        take: 8, orderBy: { createdAt: 'desc' },
        include: { customer: true, service: true },
      }),
    ]);

    // CA du mois en cours
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const monthRevenue = await prisma.booking.aggregate({
      where: { status: 'done', createdAt: { gte: startOfMonth } },
      _sum: { totalPrice: true },
    });

    res.render('admin/dashboard', {
      title:         'Tableau de bord — Admin',
      userName:      req.session.userName,
      todayBookings,
      totalBookings,
      totalRevenue:  totalRevenue._sum.totalPrice || 0,
      monthRevenue:  monthRevenue._sum.totalPrice || 0,
      lowStock,
      recentBookings,
    });
  } catch (e) {
    res.status(500).render('public/error', { title: 'Erreur', message: e.message });
  }
};
