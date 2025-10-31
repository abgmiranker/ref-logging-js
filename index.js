import winston from "winston";
import { format } from "winston";
// Example 1
//
const loggers = {
  splat: winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple(),
    ),
    transports: [new winston.transports.Console()],
  }),
  simple: winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
  }),
};

const meta = {
  subject: "Hello, World!",
  message: "This message is a unique property separate from implicit merging.",
};

loggers.simple.info("email.message is hidden", meta);
loggers.simple.info("email.message is hidden %j\n", meta);

loggers.splat.info("This is overridden by meta", meta);
loggers.splat.info("email.message is shown %j", meta);

/**
 * Output:
 * info: email.message is hidden This message is a unique property separate from implicit merging. {"subject":"Hello, World!"}
 * info: email.message is hidden %j
 *
 * info: This message is a unique property separate from implicit merging. {"subject":"Hello, World!"}
 * info: email.message is shown {"subject":"Hello, World!","message":"This message is a unique property separate from implicit merging."}
 */

// Example 3
//
// const winston = require('../');

/*
 * Simple helper for stringifying all remaining
 * properties.
 */
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

let logger2 = winston.createLogger({
  transports: [new winston.transports.Console({ level: "info" })],
  format: format.combine(
    format.splat(),
    format.printf((info) => `[${info.label}] ${info.message} ${rest(info)}`),
  ),
});

logger2.log("info", "any message", {
  label: "label!",
  extra: true,
});

logger2.log("info", "let's %s some %s", "interpolate", "splat parameters", {
  label: "label!",
  extra: true,
});

logger2.log(
  "info",
  "first is a string %s [[%j]]",
  "behold a string",
  { beAware: "this will interpolate" },
  {
    label: "label!",
    extra: true,
  },
);

logger2.log(
  "info",
  "first is an object [[%j]]",
  { beAware: "this will interpolate" },
  {
    label: "label!",
    extra: true,
  },
);

//
// Non-enumerable properties (such as "message" and "stack" in Error
// instances) will not be merged into any `info`.
//
const terr = new Error("lol please stop doing this");
terr.label = "error";
terr.extra = true;
logger2.log("info", "any message", terr);

logger2.log(
  "info",
  "let's %s some %s",
  "interpolate",
  "splat parameters",
  terr,
);

//
// Example 3
//

logger2.log("silly", "127.0.0.1 - there's no place like home");
logger2.log("debug", "127.0.0.1 - there's no place like home");
logger2.log("verbose", "127.0.0.1 - there's no place like home");
logger2.log("info", "127.0.0.1 - there's no place like home");
logger2.log("warn", "127.0.0.1 - there's no place like home");
logger2.log("error", "127.0.0.1 - there's no place like home");
logger2.info("127.0.0.1 - there's no place like home");
logger2.warn("127.0.0.1 - there's no place like home");
logger2.error("127.0.0.1 - there's no place like home");
