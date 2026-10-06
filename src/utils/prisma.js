// utils/prisma.js — Instance Prisma partagée (singleton)
// Supabase transaction pooler (port 6543 + pgbouncer=true) + connection_limit=1 pour serverless
const { PrismaClient } = require('@prisma/client');

// En prod/serverless : on limite à 1 connexion par instance Vercel
function buildUrl() {
  const url = process.env.DATABASE_URL || '';
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  // Ajoute connection_limit=1 si pas déjà présent
  if (url.includes('connection_limit')) return url;
  return `${url}${sep}connection_limit=1`;
}

const prisma = new PrismaClient({
  datasources: { db: { url: buildUrl() } },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
