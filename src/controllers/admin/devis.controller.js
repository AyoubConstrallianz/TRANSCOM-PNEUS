// controllers/admin/devis.controller.js
const prisma    = require('../../utils/prisma');
const nodemailer = require('nodemailer');
const logger    = require('../../utils/logger');

// ── Référence auto DEV-YYYY-XXXX ──────────────────────────────────────────────
async function generateRef() {
  const year  = new Date().getFullYear();
  const count = await prisma.devis.count();
  return `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
}

// ── Transport mail ─────────────────────────────────────────────────────────────
function getTransport() {
  return nodemailer.createTransport({
    host:   process.env.MAIL_HOST   || 'smtp.hostinger.com',
    port:   parseInt(process.env.MAIL_PORT || '587'),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

// ── HTML du devis pour l'email ─────────────────────────────────────────────────
function buildEmailHtml(devis) {
  const items = JSON.parse(devis.items || '[]');
  const rows  = items.map(it => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${it.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${it.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${Number(it.unitPrice).toFixed(2)} €</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;">${(it.qty * it.unitPrice).toFixed(2)} €</td>
    </tr>`).join('');

  const validStr = devis.validUntil
    ? new Date(devis.validUntil).toLocaleDateString('fr-FR')
    : '30 jours';

  return `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <!-- En-tête -->
  <tr><td style="background:#000;padding:28px 32px;">
    <h1 style="margin:0;color:#F5C200;font-size:26px;letter-spacing:1px;">TRANSCOM PNEUS</h1>
    <p style="margin:4px 0 0;color:#aaa;font-size:13px;">Le spécialiste du pneu à domicile en Île-de-France</p>
  </td></tr>
  <!-- Titre devis -->
  <tr><td style="padding:28px 32px 16px;">
    <h2 style="margin:0 0 4px;font-size:20px;color:#111;">Devis ${devis.reference}</h2>
    <p style="margin:0;color:#666;font-size:13px;">Valable jusqu'au : <strong>${validStr}</strong></p>
  </td></tr>
  <!-- Infos client -->
  <tr><td style="padding:0 32px 20px;">
    <table style="width:100%;background:#f8f8f8;border-radius:6px;padding:16px;" cellpadding="0" cellspacing="0">
      <tr><td style="font-size:13px;color:#555;padding:3px 0;"><strong>Client :</strong> ${devis.clientName}</td></tr>
      ${devis.clientAddress ? `<tr><td style="font-size:13px;color:#555;padding:3px 0;"><strong>Adresse :</strong> ${devis.clientAddress}</td></tr>` : ''}
      <tr><td style="font-size:13px;color:#555;padding:3px 0;"><strong>Type :</strong> ${devis.clientType === 'professionnel' ? 'Professionnel' : 'Particulier'}</td></tr>
    </table>
  </td></tr>
  <!-- Tableau des prestations -->
  <tr><td style="padding:0 32px 8px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
      <thead><tr style="background:#F5C200;">
        <th style="padding:10px 12px;text-align:left;">Prestation</th>
        <th style="padding:10px 12px;text-align:center;">Qté</th>
        <th style="padding:10px 12px;text-align:right;">Prix unit.</th>
        <th style="padding:10px 12px;text-align:right;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </td></tr>
  <!-- Totaux -->
  <tr><td style="padding:0 32px 28px;">
    <table style="margin-left:auto;width:260px;font-size:14px;" cellpadding="0" cellspacing="0">
      ${devis.travelFee > 0 ? `
      <tr><td style="padding:6px 0;color:#555;">Frais de déplacement</td><td style="padding:6px 0;text-align:right;">${Number(devis.travelFee).toFixed(2)} €</td></tr>` : ''}
      <tr style="border-top:2px solid #F5C200;">
        <td style="padding:10px 0;font-size:16px;font-weight:bold;">TOTAL TTC</td>
        <td style="padding:10px 0;text-align:right;font-size:18px;font-weight:bold;color:#F5C200;">${Number(devis.total).toFixed(2)} €</td>
      </tr>
    </table>
  </td></tr>
  ${devis.notes ? `<tr><td style="padding:0 32px 24px;"><p style="margin:0;padding:14px;background:#fffbe6;border-left:4px solid #F5C200;font-size:13px;color:#555;">${devis.notes}</p></td></tr>` : ''}
  <!-- Footer -->
  <tr><td style="background:#f0f0f0;padding:18px 32px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#888;">TRANSCOM PNEUS — contact@transcompneus.fr — ${process.env.COMPANY_PHONE || ''}</p>
    <p style="margin:4px 0 0;font-size:11px;color:#aaa;">Pour accepter ce devis, répondez à cet email ou appelez-nous.</p>
  </td></tr>
</table>
</body></html>`;
}

// ── LISTE ──────────────────────────────────────────────────────────────────────
exports.index = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const devisList = await prisma.devis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.render('admin/devis/index', {
      title: 'Devis — TRANSCOM PNEUS',
      devisList,
      filterStatus: status || '',
    });
  } catch (e) {
    logger.error('Erreur liste devis', { err: e.message });
    res.redirect('/admin');
  }
};

// ── FORMULAIRE CRÉATION ────────────────────────────────────────────────────────
exports.createForm = (req, res) => {
  res.render('admin/devis/form', {
    title: 'Nouveau devis — TRANSCOM PNEUS',
    devis: null,
    error: null,
  });
};

// ── CRÉER ──────────────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { clientName, clientEmail, clientPhone, clientType, clientAddress,
            items, travelFee, validUntil, notes } = req.body;

    const parsedItems = JSON.parse(items || '[]');
    const subtotal    = parsedItems.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const total       = subtotal + Number(travelFee || 0);

    const devis = await prisma.devis.create({
      data: {
        reference:     await generateRef(),
        clientName,
        clientEmail,
        clientPhone:   clientPhone || null,
        clientType:    clientType  || 'particulier',
        clientAddress: clientAddress || null,
        items,
        travelFee:     Number(travelFee || 0),
        total,
        validUntil:    validUntil ? new Date(validUntil) : null,
        notes:         notes || null,
      },
    });

    req.session.success = `Devis ${devis.reference} créé.`;
    res.redirect(`/admin/devis/${devis.id}`);
  } catch (e) {
    logger.error('Erreur création devis', { err: e.message });
    res.render('admin/devis/form', { title: 'Nouveau devis', devis: null, error: e.message });
  }
};

// ── DÉTAIL ─────────────────────────────────────────────────────────────────────
exports.show = async (req, res) => {
  try {
    const devis = await prisma.devis.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!devis) return res.redirect('/admin/devis');
    devis.itemsParsed = JSON.parse(devis.items || '[]');
    res.render('admin/devis/show', { title: `Devis ${devis.reference}`, devis });
  } catch (e) {
    res.redirect('/admin/devis');
  }
};

// ── ENVOYER PAR EMAIL ──────────────────────────────────────────────────────────
exports.send = async (req, res) => {
  try {
    const devis = await prisma.devis.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!devis) return res.redirect('/admin/devis');

    const transport = getTransport();
    await transport.sendMail({
      from:    process.env.MAIL_FROM || 'TRANSCOM PNEUS <contact@transcompneus.fr>',
      to:      devis.clientEmail,
      subject: `Votre devis ${devis.reference} — TRANSCOM PNEUS`,
      html:    buildEmailHtml(devis),
    });

    await prisma.devis.update({
      where: { id: devis.id },
      data:  { status: 'envoyé', sentAt: new Date() },
    });

    req.session.success = `Devis ${devis.reference} envoyé à ${devis.clientEmail}.`;
    res.redirect(`/admin/devis/${devis.id}`);
  } catch (e) {
    logger.error('Erreur envoi devis', { err: e.message });
    req.session.error = `Erreur envoi : ${e.message}`;
    res.redirect(`/admin/devis/${req.params.id}`);
  }
};

// ── METTRE À JOUR LE STATUT ────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await prisma.devis.update({
      where: { id: parseInt(req.params.id) },
      data:  { status },
    });
    req.session.success = 'Statut mis à jour.';
    res.redirect(`/admin/devis/${req.params.id}`);
  } catch (e) {
    res.redirect('/admin/devis');
  }
};

// ── SUPPRIMER ──────────────────────────────────────────────────────────────────
exports.destroy = async (req, res) => {
  try {
    await prisma.devis.delete({ where: { id: parseInt(req.params.id) } });
    req.session.success = 'Devis supprimé.';
    res.redirect('/admin/devis');
  } catch (e) {
    res.redirect('/admin/devis');
  }
};

// ── CRÉER DEVIS DEPUIS UNE RÉSERVATION ────────────────────────────────────────
exports.createFromBooking = async (booking, service, zone) => {
  try {
    const items = [];
    if (service) {
      items.push({ description: service.name, qty: 1, unitPrice: service.price || 0 });
    }

    const travelFee = zone ? zone.travelFee : 0;
    const total     = items.reduce((s, it) => s + it.qty * it.unitPrice, 0) + travelFee;

    const devis = await prisma.devis.create({
      data: {
        reference:     await generateRef(),
        clientName:    booking.customer?.name    || '',
        clientEmail:   booking.customer?.email   || '',
        clientPhone:   booking.customer?.phone   || null,
        clientType:    booking.clientType        || 'particulier',
        clientAddress: booking.address           || null,
        items:         JSON.stringify(items),
        travelFee,
        total,
        bookingId:     booking.id,
        validUntil:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30j
        status:        'envoyé',
        sentAt:        new Date(),
      },
    });

    if (booking.customer?.email) {
      const transport = getTransport();
      await transport.sendMail({
        from:    process.env.MAIL_FROM || 'TRANSCOM PNEUS <contact@transcompneus.fr>',
        to:      booking.customer.email,
        subject: `Votre devis ${devis.reference} — TRANSCOM PNEUS`,
        html:    buildEmailHtml(devis),
      });
    }

    return devis;
  } catch (e) {
    logger.error('Erreur création devis depuis réservation', { err: e.message });
    return null;
  }
};
