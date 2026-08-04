import type React from "react";

export type EmailContent = {
  html: string;
  text: string;
};

export type EmailMessage = EmailContent & {
  to: string;
  from: string;
  subject: string;
};

export type SendOptions = {
  to: string;
  from?: string;
  subject: string;
};

export type EmailRenderer = {
  render(email: React.ReactElement): Promise<EmailContent>;
};

export type EmailTransport = {
  send(message: EmailMessage): Promise<unknown>;
};

export type EmailServiceOptions = {
  renderer: EmailRenderer;
  transport: EmailTransport;
  defaultFrom: string;
};

export type EmailService = ReturnType<typeof createEmailService>;

export function createEmailService(options: EmailServiceOptions) {
  return {
    async send(email: React.ReactElement, sendOptions: SendOptions) {
      const { html, text } = await options.renderer.render(email);
      return options.transport.send({
        to: sendOptions.to,
        from: sendOptions.from ?? options.defaultFrom,
        subject: sendOptions.subject,
        html,
        text,
      });
    },
  };
}
