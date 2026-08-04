import { render, toPlainText } from "react-email";
import type { EmailRenderer } from "server/services/email.js";

export const reactEmailRenderer: EmailRenderer = {
  async render(email) {
    const html = await render(email);
    return { html, text: toPlainText(html) };
  },
};
