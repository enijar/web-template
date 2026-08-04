import sendgrid from "@sendgrid/mail";
import type { EmailTransport } from "server/services/email.js";

export function createSendgridTransport(apiKey: string): EmailTransport {
  sendgrid.setApiKey(apiKey);
  return {
    async send(message) {
      return sendgrid.send(message);
    },
  };
}
