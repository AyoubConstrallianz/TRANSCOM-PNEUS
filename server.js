// server.js — Point d'entrée HTTP
require('dotenv').config();
const app    = require('./app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

// En local (node server.js), on démarre le serveur HTTP
// Sur Vercel (serverless), on exporte juste l'app Express
if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`TRANSCOM PNEUS démarré sur http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM reçu — arrêt du serveur');
    server.close(() => process.exit(0));
  });
}

// Vercel attend l'app Express en export (pas un http.Server)
module.exports = app;
