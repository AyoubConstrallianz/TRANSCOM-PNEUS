// utils/prisma.js — Instance Prisma partagée (singleton)
// Évite les 17+ connexions simultanées sur Supabase (pool_size: 15)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
