import type { LoggerService, LogLevel } from "server/services/logger.js";

function replaceErrors(key: string, value: unknown) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function write(level: LogLevel) {
  return (message: string, meta?: Record<string, unknown>) => {
    const entry = { time: new Date().toISOString(), level, message, ...meta };
    process.stdout.write(`${JSON.stringify(entry, replaceErrors)}\n`);
  };
}

export const jsonLogger: LoggerService = {
  debug: write("debug"),
  info: write("info"),
  warn: write("warn"),
  error: write("error"),
};
