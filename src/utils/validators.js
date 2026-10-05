// utils/validators.js — Schémas de validation Joi
const Joi = require('joi');

// Codes postaux IDF valides (75xxx, 77xxx, 78xxx, 91xxx, 92xxx, 93xxx, 94xxx, 95xxx)
const IDF_REGEX = /^(75|77|78|91|92|93|94|95)\d{3}$/;

const bookingSchema = Joi.object({
  clientType: Joi.string().valid('particulier', 'professionnel').default('particulier'),
  name:       Joi.string().trim().min(2).max(100).required().messages({ 'any.required': 'Le nom est requis' }),
  phone:      Joi.string().trim().pattern(/^[\d\s\+\-\.]{10,15}$/).required().messages({ 'any.required': 'Le téléphone est requis', 'string.pattern.base': 'Numéro de téléphone invalide' }),
  email:      Joi.string().email().optional().allow(''),
  address:    Joi.string().trim().min(5).max(200).required().messages({ 'any.required': 'L\'adresse est requise' }),
  postalCode: Joi.string().pattern(IDF_REGEX).required().messages({ 'string.pattern.base': 'Code postal hors Île-de-France', 'any.required': 'Le code postal est requis' }),
  plate:      Joi.string().trim().optional().allow(''),
  tireId:     Joi.number().integer().optional().allow(null, ''),
  serviceId:  Joi.number().integer().required().messages({ 'any.required': 'Veuillez choisir un service' }),
  date:       Joi.string().isoDate().required().messages({ 'any.required': 'La date est requise' }),
  slot:       Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({ 'any.required': 'Le créneau est requis' }),
  tireQty:    Joi.number().integer().min(1).max(4).default(4),
});

const contactSchema = Joi.object({
  name:    Joi.string().trim().min(2).max(100).required(),
  email:   Joi.string().email().required(),
  phone:   Joi.string().trim().optional().allow(''),
  message: Joi.string().trim().min(10).max(2000).required(),
});

const adminLoginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

const tireSchema = Joi.object({
  brand:       Joi.string().trim().max(100).required(),
  model:       Joi.string().trim().max(100).required(),
  width:       Joi.number().integer().min(100).max(400).required(),
  ratio:       Joi.number().integer().min(20).max(100).required(),
  diameter:    Joi.number().integer().min(10).max(26).required(),
  season:      Joi.string().valid('summer', 'winter', 'allseason').required(),
  buyPrice:    Joi.number().min(0).required(),
  sellPrice:   Joi.number().min(0).required(),
  stock:       Joi.number().integer().min(0).required(),
  description: Joi.string().optional().allow(''),
  active:      Joi.boolean().default(true),
});

const serviceSchema = Joi.object({
  category:   Joi.string().trim().max(100).optional().allow('').default('Général'),
  name:        Joi.string().trim().max(100).required(),
  description: Joi.string().optional().allow(''),
  price:       Joi.number().min(0).default(0),
  priceLabel:  Joi.string().trim().max(100).optional().allow('').default('Prix sur devis'),
  duration:    Joi.number().integer().min(5).max(480).required(),
  active:      Joi.boolean().default(true),
});

const bulkPriceSchema = Joi.object({
  type:       Joi.string().valid('percent', 'fixed').required(),
  value:      Joi.number().required(),
  brand:      Joi.string().optional().allow(''),
  applyTo:    Joi.string().valid('sellPrice', 'both').required(),
});

// Valide et renvoie { value, error }
function validate(schema, data) {
  return schema.validate(data, { abortEarly: false, stripUnknown: true });
}

module.exports = {
  bookingSchema,
  contactSchema,
  adminLoginSchema,
  tireSchema,
  serviceSchema,
  bulkPriceSchema,
  validate,
  IDF_REGEX,
};
