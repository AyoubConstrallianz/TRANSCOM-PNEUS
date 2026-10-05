// services/email.service.js — Envoi d'emails transactionnels
const transporter = require('../config/mailer');
const logger      = require('../utils/logger');

const FROM    = process.env.MAIL_FROM  || 'TRANSCOM PNEUS <contact@transcompneus.fr>';
const ADMIN   = process.env.MAIL_ADMIN || 'admin@transcompneus.fr';
const APP_URL = process.env.APP_URL    || 'http://localhost:3000';

/**
 * Envoie un email de confirmation au client après réservation
 */
async function sendBookingConfirmation(booking) {
  const { customer, service, tire, date, slot, address, postalCode, totalPrice, travelFee } = booking;
  const dateStr = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#e53e3e;padding:24px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:24px">TRANSCOM PNEUS</h1>
      <p style="margin:8px 0 0;color:#fed7d7">Confirmation de réservation</p>
    </div>
    <div style="padding:32px">
      <p>Bonjour <strong>${customer.name}</strong>,</p>
      <p>Votre réservation a bien été enregistrée. Voici le récapitulatif :</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr style="border-bottom:1px solid #4a5568"><td style="padding:10px;color:#a0aec0">Service</td><td style="padding:10px"><strong>${service?.name || 'N/A'}</strong></td></tr>
        ${tire ? `<tr style="border-bottom:1px solid #4a5568"><td style="padding:10px;color:#a0aec0">Pneu</td><td style="padding:10px"><strong>${tire.brand} ${tire.model} ${tire.width}/${tire.ratio} R${tire.diameter}</strong></td></tr>` : ''}
        <tr style="border-bottom:1px solid #4a5568"><td style="padding:10px;color:#a0aec0">Date</td><td style="padding:10px"><strong>${dateStr}</strong></td></tr>
        <tr style="border-bottom:1px solid #4a5568"><td style="padding:10px;color:#a0aec0">Créneau</td><td style="padding:10px"><strong>${slot}h</strong></td></tr>
        <tr style="border-bottom:1px solid #4a5568"><td style="padding:10px;color:#a0aec0">Adresse</td><td style="padding:10px">${address}, ${postalCode}</td></tr>
        <tr style="border-bottom:1px solid #4a5568"><td style="padding:10px;color:#a0aec0">Frais déplacement</td><td style="padding:10px">${travelFee} €</td></tr>
        <tr><td style="padding:10px;color:#a0aec0">Total estimé</td><td style="padding:10px;color:#ed8936;font-size:18px"><strong>${totalPrice} €</strong></td></tr>
      </table>
      <p style="color:#a0aec0;font-size:14px">Un technicien vous contactera pour confirmer le rendez-vous.</p>
      <p>En cas de question : <a href="tel:${process.env.COMPANY_PHONE}" style="color:#e53e3e">${process.env.COMPANY_PHONE}</a></p>
    </div>
    <div style="background:#16213e;padding:16px;text-align:center;font-size:12px;color:#718096">
      TRANSCOM PNEUS — Île-de-France | <a href="${APP_URL}" style="color:#e53e3e">transcompneus.fr</a>
    </div>
  </div>`;

  try {
    if (customer.email) {
      await transporter.sendMail({ from: FROM, to: customer.email, subject: `Confirmation réservation #${booking.id} — TRANSCOM PNEUS`, html });
    }
    // Notification admin
    await transporter.sendMail({
      from: FROM, to: ADMIN,
      subject: `[Nouvelle réservation #${booking.id}] ${customer.name} — ${dateStr}`,
      html: `<p>Nouvelle réservation reçue.</p><p><a href="${APP_URL}/admin/bookings/${booking.id}">Voir la réservation</a></p>${html}`,
    });
    logger.info(`Emails réservation #${booking.id} envoyés`);
  } catch (err) {
    logger.error('Erreur envoi email réservation', { err: err.message });
  }
}

/**
 * Envoie un email de contact
 */
async function sendContactMessage({ name, email, phone, message }) {
  try {
    await transporter.sendMail({
      from: FROM, to: ADMIN,
      subject: `[Contact] Message de ${name}`,
      html: `<p><strong>De :</strong> ${name} (${email}${phone ? ', ' + phone : ''})</p><p><strong>Message :</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    });
    logger.info(`Email contact reçu de ${email}`);
  } catch (err) {
    logger.error('Erreur envoi email contact', { err: err.message });
  }
}

module.exports = { sendBookingConfirmation, sendContactMessage };
