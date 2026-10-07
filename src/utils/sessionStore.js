// sessionStore.js — Store de session basé sur Prisma (pas de connexion pg séparée)
const session = require('express-session');
const prisma   = require('./prisma');

class PrismaSessionStore extends session.Store {
  async get(sid, cb) {
    try {
      const row = await prisma.session.findUnique({ where: { sid } });
      if (!row) return cb(null, null);
      if (row.expire < new Date()) {
        await prisma.session.delete({ where: { sid } }).catch(() => {});
        return cb(null, null);
      }
      cb(null, JSON.parse(row.data));
    } catch (e) { cb(e); }
  }

  async set(sid, sess, cb) {
    try {
      const expire = sess.cookie?.expires
        ? new Date(sess.cookie.expires)
        : new Date(Date.now() + 8 * 60 * 60 * 1000);
      const data = JSON.stringify(sess);
      await prisma.session.upsert({
        where:  { sid },
        update: { data, expire },
        create: { sid, data, expire },
      });
      cb(null);
    } catch (e) { cb(e); }
  }

  async destroy(sid, cb) {
    try {
      await prisma.session.delete({ where: { sid } }).catch(() => {});
      cb(null);
    } catch (e) { cb(e); }
  }
}

module.exports = PrismaSessionStore;
