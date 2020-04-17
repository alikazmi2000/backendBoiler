const winston = require('winston');

const options = {
  infoFile: {
    level: 'info',
    filename: 'logs/info.log',
    handleExceptions: true,
    json: true,
    maxsize: 10485760,
    maxFiles: 20,
    colorize: false
  },
  errorFile: {
    level: 'error',
    filename: 'logs/error.log',
    handleExceptions: true,
    json: true,
    maxsize: 10485760,
    maxFiles: 20,
    colorize: false
  },
  warnFile: {
    level: 'warn',
    filename: 'logs/warn.log',
    handleExceptions: true,
    json: true,
    maxsize: 10485760,
    maxFiles: 20,
    colorize: false
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

// Logger configuration
const logConfiguration = {
  transports: [
    new winston.transports.File(options.infoFile),
    new winston.transports.File(options.errorFile),
    new winston.transports.File(options.warnFile)
    // new winston.transports.Console(options.console)
  ],
  exitOnError: false // do not exit on handled exceptions
};

// Create the logger
const logger = winston.createLogger(logConfiguration);

module.exports = logger;
