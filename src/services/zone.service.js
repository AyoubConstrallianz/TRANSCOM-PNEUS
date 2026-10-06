// services/zone.service.js — Validation et frais IDF

const prisma = require('../utils/prisma');

const IDF_DEPTS = ['75', '77', '78', '91', '92', '93', '94', '95'];

/**
 * Extrait le numéro de département depuis un code postal
 * @param {string} cp
 * @returns {string|null}
 */
function deptFromPostalCode(cp) {
  if (!cp || cp.length < 2) return null;
  return cp.substring(0, 2);
}

/**
 * Vérifie si un code postal est en Île-de-France
 * @param {string} cp
 * @returns {boolean}
 */
function isIleDeFrance(cp) {
  const dept = deptFromPostalCode(cp);
  return IDF_DEPTS.includes(dept);
}

/**
 * Récupère la zone et ses frais de déplacement selon le code postal
 * @param {string} cp
 * @returns {Promise<{zone: object|null, travelFee: number}>}
 */
async function getZoneByPostalCode(cp) {
  const dept = deptFromPostalCode(cp);
  if (!dept || !IDF_DEPTS.includes(dept)) {
    return { zone: null, travelFee: 0 };
  }
  const zone = await prisma.zone.findUnique({ where: { dept } });
  return { zone, travelFee: zone?.travelFee ?? 0 };
}

/**
 * Récupère toutes les zones
 */
async function getAllZones() {
  return prisma.zone.findMany({ orderBy: { dept: 'asc' } });
}

module.exports = { isIleDeFrance, deptFromPostalCode, getZoneByPostalCode, getAllZones, IDF_DEPTS };
