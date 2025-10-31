import winston from "winston";
import path from "path";
import { format } from "winston";
import util from "node:util";

const NODE_RUNTIME =
  typeof process !== "undefined" && process.versions && process.versions.node;
const TEST = {
  prop1: "val1",
  prop2: 1234,
  prop3: { sub1: "subval1", sub2: false },
  prop4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
};

const objPP = ((isNode) => {
  if (isNode) {
    return (obj) => {
      return `${util.inspect(obj, { colors: true })}`;
    };
  }
  return (obj) => {
    return `${JSON.stringify(obj)}`;
  };
})(NODE_RUNTIME);

function rest(info) {
  return JSON.stringify(
    Object.assign({}, info, {
      level: undefined,
      message: undefined,
      splat: undefined,
      label: undefined,
    }),
  );
}

const logFormatFile = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, label, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level.toUpperCase()}]${label ? ` [${label}]` : ""}: ${message}${metaStr}`;
  }),
);

const prettyJson = winston.format.printf((info) => {
  if (info.message.constructor === Object) {
    info.message = NODE_RUNTIME
      ? util.inspect(info.message, { colors: true })
      : JSON.stringify(info.message, null, 2);
  } else {
    info.message = `${info.level}: ${info.message}\n`;
  }

  return info;
});

const logFormatConsole = winston.format.combine(
  // winston.format.printf((info) => { console.log(Object.keys(info.message).length); console.log(util.inspect(info)); return info }),
  winston.format.printf((info) => {
    info.level = info.level.toUpperCase();
    return info;
  }),
  winston.format.splat(),
  winston.format.colorize(),
  winston.format.printf((info) => {
    if (info.message.constructor === Object) {
      info.message = objPP(info.message);
    }
    return info;
  }),
  winston.format.printf(
    (info) =>
      `${info.level}\t${info.label ? `[${info.label}]` : ""} ${info.message}`,
  ),
  // winston.format.printf(info => `[${info.level}${info.label ? `|${info.label}]` : ']'} ${info.message}`)
);

// Create the main logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  // format: logFormatFile,
  transports: [
    // Console transport
    new winston.transports.Console({
      forceConsole: true,
      format: logFormatConsole,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: "logs/app.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormatFile,
    }),
    // Separate file for errors
    // new winston.transports.File({
    //     filename: 'logs/error.log',
    //     level: 'error',
    //     maxsize: 5242880,
    //     maxFiles: 5
    // })
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
  exitOnError: false,
});

// Factory function to create labeled child loggers
export function createLogger(label) {
  return logger.child({ label });
}

export { logger };
// export default logger;
// export default createLogger;
