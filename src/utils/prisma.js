// utils/prisma.js — Instance Prisma partagée (singleton)
// En production : force le transaction pooler Supabase (port 6543 + pgbouncer=true)
const { PrismaClient } = require('@prisma/client');

function buildUrl() {
  let url = process.env.DATABASE_URL || '';
  if (!url) return url;

  // En production sur Vercel : passer au transaction pooler (port 6543)
  // Le session pooler (port 5432) est limité à 15 connexions simultanées
  if (process.env.NODE_ENV === 'production') {
    url = url.replace(':5432/', ':6543/');
    if (!url.includes('pgbouncer=true')) {
      url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
    if (!url.includes('connection_limit')) {
      url += '&connection_limit=1';
    }
  }

  return url;
}

const prisma = new PrismaClient({
  datasources: { db: { url: buildUrl() } },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
