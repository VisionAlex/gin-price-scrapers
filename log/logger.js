const winston = require("winston");
const { combine, timestamp, json, colorize, simple } = winston.format;
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "error",
      format: combine(colorize(), simple()),
    }),
    new winston.transports.File({
      filename: "./log/error.log",
      level: "error",
      format: combine(timestamp(), json()),
    }),
    new winston.transports.Console({
      level: "info",
      format: combine(colorize(), simple()),
    }),
    new winston.transports.File({
      filename: "./log/logfile.log",
      format: combine(timestamp(), json()),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: "./log/exceptions.log",
      format: combine(timestamp(), json()),
    }),
    new winston.transports.Console({
      level: "error",
      format: combine(colorize(), simple()),
    }),
  ],
});

module.exports = logger;
