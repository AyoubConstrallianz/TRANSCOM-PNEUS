// middleware/auth.js — Protection des routes admin
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/admin/login');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/admin');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuth };
