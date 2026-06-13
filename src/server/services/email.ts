import React from "react";
import sendgrid from "@sendgrid/mail";
import { render, toPlainText } from "react-email";
import type { MailData } from "@sendgrid/helpers/classes/mail.js";
import config from "config/index.js";

sendgrid.setApiKey(config.EMAIL_SMTP_API_KEY);

const email = {
  async send(email: React.ReactElement, options: MailData) {
    const html = await render(email);
    const text = toPlainText(html);
    if (config.NODE_ENV === "development") {
      console.log(text);
      return;
    }
    return sendgrid.send({
      ...options,
      to: options.to,
      from: options.from ?? { email: config.EMAIL_FROM },
      subject: options.subject,
      html,
      text,
    });
  },
};

export default email;
