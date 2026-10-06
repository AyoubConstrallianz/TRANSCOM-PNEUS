// controllers/public/contact.controller.js

const { validate, contactSchema } = require('../../utils/validators');
const { sendContactMessage } = require('../../services/email.service');
const prisma = require('../../utils/prisma');

async function getSettings() {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map(s => [s.key, s.value]));
}

exports.form = async (req, res) => {
  const settings = await getSettings();
  res.render('public/contact', {
    title: 'Contact — TRANSCOM PNEUS',
    metaDescription: 'Contactez TRANSCOM PNEUS pour toute question sur nos services de pneus à domicile en Île-de-France.',
    settings, errors: null, formData: {},
  });
};

exports.submit = async (req, res) => {
  const { error, value } = validate(contactSchema, req.body);
  const settings = await getSettings();
  if (error) {
    return res.status(400).render('public/contact', {
      title: 'Contact — TRANSCOM PNEUS',
      metaDescription: '',
      settings, errors: error.details, formData: req.body,
    });
  }
  await sendContactMessage(value);
  req.session.success = 'Votre message a bien été envoyé. Nous vous répondrons sous 24h.';
  res.redirect('/contact');
};
