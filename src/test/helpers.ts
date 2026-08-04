import type { AppConfig } from "config/index.js";
import type { PasswordHasher } from "server/services/auth.js";
import type { EmailMessage, EmailTransport } from "server/services/email.js";
import type { LoggerService, LogLevel } from "server/services/logger.js";

export function createTestConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    PORT: 3000,
    APP_URL: "http://localhost:3000",
    DATABASE_DIALECT: "sqlite3",
    DATABASE_URL: "sqlite3::memory:",
    JWT_SECRET: new TextEncoder().encode("test-secret"),
    EMAIL_FROM: "noreply@example.com",
    EMAIL_SMTP_API_KEY: "test-api-key",
    BASE_PATH: "/",
    NODE_ENV: "development",
    ...overrides,
  };
}

export const fakeHasher: PasswordHasher = {
  async hash(password) {
    return `hashed:${password}`;
  },
  async verify(hash, password) {
    return hash === `hashed:${password}`;
  },
};

export function createMemoryTransport() {
  const messages: EmailMessage[] = [];
  const transport: EmailTransport = {
    async send(message) {
      messages.push(message);
    },
  };
  return { messages, transport };
}

export type LogEntry = { level: LogLevel; message: string; meta?: Record<string, unknown> };

export function createMemoryLogger() {
  const entries: LogEntry[] = [];
  function log(level: LogLevel) {
    return (message: string, meta?: Record<string, unknown>) => {
      entries.push({ level, message, meta });
    };
  }
  const logger: LoggerService = {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error: log("error"),
  };
  return { entries, logger };
}

export function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value);
  }
  return data;
}
