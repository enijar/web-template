import type { EmailTransport } from "server/services/email.js";
import type { LoggerService, LogLevel } from "server/services/logger.js";

export const consoleTransport: EmailTransport = {
  async send(message) {
    console.log(message.text);
  },
};

function log(level: LogLevel) {
  return (message: string, meta?: Record<string, unknown>) => {
    if (meta === undefined) {
      console[level](message);
    } else {
      console[level](message, meta);
    }
  };
}

export const consoleLogger: LoggerService = {
  debug: log("debug"),
  info: log("info"),
  warn: log("warn"),
  error: log("error"),
};
