// server.js — Point d'entrée HTTP
require('dotenv').config();
const app    = require('./app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`TRANSCOM PNEUS démarré sur http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Arrêt propre
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu — arrêt du serveur');
  server.close(() => process.exit(0));
});

module.exports = server;
