// utils/settingsCache.js — Cache en mémoire des paramètres DB
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let cache = null;

async function getSettings() {
  if (!cache) await refresh();
  return cache;
}

async function refresh() {
  const rows = await prisma.setting.findMany();
  cache = Object.fromEntries(rows.map(s => [s.key, s.value]));
}

module.exports = { getSettings, refresh };
