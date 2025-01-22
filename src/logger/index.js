// const { createLogger, format, transports } = require('winston');
import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize, errors } = format;
import config from "../config/config.js";

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new transports.File({
      filename: 'logs/errors.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ]
});

// For handling promise rejections
logger.rejections.handle(
  new transports.File({ filename: 'logs/rejections.log' })
);

export default logger;