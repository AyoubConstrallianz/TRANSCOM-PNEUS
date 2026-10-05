// controllers/admin/auth.controller.js
const bcrypt       = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { validate, adminLoginSchema } = require('../../utils/validators');
const logger       = require('../../utils/logger');

const prisma = new PrismaClient();
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

exports.loginPage = (req, res) => {
  res.render('admin/login', { title: 'Connexion admin — TRANSCOM PNEUS', error: null });
};

exports.login = async (req, res) => {
  const { error, value } = validate(adminLoginSchema, req.body);
  if (error) {
    return res.render('admin/login', { title: 'Connexion admin', error: 'Email ou mot de passe invalide.' });
  }

  const { email, password } = value;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      logger.warn(`Tentative login utilisateur inexistant: ${email}`);
      return res.render('admin/login', { title: 'Connexion admin', error: 'Identifiants incorrects.' });
    }

    // Vérifier si le compte est verrouillé
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil - new Date()) / 60000);
      return res.render('admin/login', { title: 'Connexion admin', error: `Compte verrouillé. Réessayez dans ${minutes} minute(s).` });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      const attempts = user.loginAttempts + 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
        : null;
      await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: attempts, lockedUntil } });
      logger.warn(`Échec login (${attempts}/${MAX_ATTEMPTS}): ${email}`);
      return res.render('admin/login', {
        title: 'Connexion admin',
        error: attempts >= MAX_ATTEMPTS
          ? `Trop de tentatives. Compte verrouillé ${LOCK_MINUTES} minutes.`
          : `Identifiants incorrects. (${MAX_ATTEMPTS - attempts} essai(s) restant(s))`,
      });
    }

    // Succès
    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } });

    req.session.regenerate((err) => {
      if (err) return res.redirect('/admin/login');
      req.session.userId   = user.id;
      req.session.userName = user.name;
      req.session.userRole = user.role;
      const returnTo = req.session.returnTo || '/admin';
      delete req.session.returnTo;
      logger.info(`Connexion admin: ${email}`);
      res.redirect(returnTo);
    });
  } catch (e) {
    logger.error('Erreur login', { err: e.message });
    res.render('admin/login', { title: 'Connexion admin', error: 'Erreur serveur. Veuillez réessayer.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
};
