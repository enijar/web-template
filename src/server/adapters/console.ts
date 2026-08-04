import type { EmailTransport } from "server/services/email.js";

export const consoleTransport: EmailTransport = {
  async send(message) {
    console.log(message.text);
  },
};
