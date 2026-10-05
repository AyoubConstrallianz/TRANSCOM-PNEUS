// utils/logger.js — Winston logger
const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const isProd = process.env.NODE_ENV === 'production';

const loggerTransports = [
  new transports.Console({
    format: isProd
      ? format.combine(format.timestamp(), format.json())
      : format.combine(format.colorize(), format.simple()),
  }),
];

// Fichiers de log uniquement en local (pas sur Vercel/serverless)
if (!isProd) {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  loggerTransports.push(
    new transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logsDir, 'combined.log') })
  );
}

const logger = createLogger({
  level: isProd ? 'warn' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: loggerTransports,
});

module.exports = logger;
