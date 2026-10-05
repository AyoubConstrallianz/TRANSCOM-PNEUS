// services/booking.service.js
const { PrismaClient } = require('@prisma/client');
const { getZoneByPostalCode } = require('./zone.service');
const prisma = new PrismaClient();

const STATUS_LABELS = {
  new:         'Nouveau',
  confirmed:   'Confirmé',
  in_progress: 'En cours',
  done:        'Terminé',
  cancelled:   'Annulé',
};

/**
 * Crée une réservation complète avec calcul du prix
 */
async function createBooking(data) {
  const { name, phone, email, address, postalCode, plate, tireId, serviceId, date, slot, tireQty = 4 } = data;

  // Récupérer le client ou le créer
  let customer = await prisma.customer.findFirst({ where: { phone } });
  if (!customer) {
    customer = await prisma.customer.create({ data: { name, phone, email: email || null, postalCode } });
  }

  // Zone & frais déplacement
  const { zone, travelFee } = await getZoneByPostalCode(postalCode);

  // Calcul du prix total
  let servicePrice = 0;
  let tirePrice    = 0;

  if (serviceId) {
    const svc = await prisma.service.findUnique({ where: { id: parseInt(serviceId) } });
    if (svc) servicePrice = svc.price;
  }
  if (tireId) {
    const tire = await prisma.tire.findUnique({ where: { id: parseInt(tireId) } });
    if (tire) tirePrice = tire.sellPrice * tireQty;
  }

  const totalPrice = parseFloat((servicePrice + tirePrice + travelFee).toFixed(2));

  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      tireId:     tireId ? parseInt(tireId) : null,
      serviceId:  serviceId ? parseInt(serviceId) : null,
      zoneId:     zone?.id || null,
      date:       new Date(date + 'T' + slot + ':00'),
      slot,
      address,
      postalCode,
      plate:      plate || null,
      tireQty:    parseInt(tireQty),
      travelFee,
      totalPrice,
    },
    include: { customer: true, tire: true, service: true, zone: true },
  });

  // Décrémenter le stock si pneu sélectionné
  if (tireId) {
    await prisma.tire.update({
      where: { id: parseInt(tireId) },
      data:  { stock: { decrement: parseInt(tireQty) } },
    });
  }

  return booking;
}

/**
 * Met à jour le statut d'une réservation
 */
async function updateStatus(id, status) {
  return prisma.booking.update({ where: { id: parseInt(id) }, data: { status } });
}

/**
 * Récupère les réservations du jour
 */
async function getTodayBookings() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.booking.findMany({
    where:   { date: { gte: today, lt: tomorrow } },
    include: { customer: true, service: true, tire: true },
    orderBy: { slot: 'asc' },
  });
}

/**
 * Génère un export CSV des réservations
 */
async function exportCSV(filters = {}) {
  const bookings = await prisma.booking.findMany({
    where:   filters,
    include: { customer: true, service: true, tire: true, zone: true },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'ID,Date,Créneau,Statut,Client,Téléphone,Email,Adresse,CP,Immatriculation,Service,Pneu,Qté,Frais dépl.,Total,Notes';
  const rows = bookings.map(b => [
    b.id,
    new Date(b.date).toLocaleDateString('fr-FR'),
    b.slot,
    STATUS_LABELS[b.status] || b.status,
    `"${b.customer.name}"`,
    b.customer.phone,
    b.customer.email || '',
    `"${b.address}"`,
    b.postalCode,
    b.plate || '',
    `"${b.service?.name || ''}"`,
    b.tire ? `"${b.tire.brand} ${b.tire.model} ${b.tire.width}/${b.tire.ratio}R${b.tire.diameter}"` : '',
    b.tireQty,
    b.travelFee,
    b.totalPrice,
    `"${(b.notes || '').replace(/"/g, '""')}"`,
  ].join(','));

  return [header, ...rows].join('\n');
}

module.exports = { createBooking, updateStatus, getTodayBookings, exportCSV, STATUS_LABELS };
