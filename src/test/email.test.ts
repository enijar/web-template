import React from "react";
import { describe, expect, it, vi } from "vitest";
import sendgrid from "@sendgrid/mail";
import {
  createEmailService,
  type EmailContent,
  type EmailMessage,
  type EmailRenderer,
  type EmailTransport,
} from "server/services/email.js";
import { reactEmailRenderer } from "server/adapters/react-email.js";
import { createSendgridTransport } from "server/adapters/sendgrid.js";
import { consoleTransport } from "server/adapters/console.js";

vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(async () => {}),
  },
}));

function createFakes(content: EmailContent = { html: "<p>Hi</p>", text: "Hi" }) {
  const render = vi.fn(async () => content);
  const send = vi.fn(async () => {});
  const renderer: EmailRenderer = { render };
  const transport: EmailTransport = { send };
  return { render, send, renderer, transport };
}

const element = React.createElement("p", null, "Hi");

describe("email service", () => {
  it("renders the email and passes the message to the transport", async () => {
    const { render, send, renderer, transport } = createFakes();
    const email = createEmailService({ renderer, transport, defaultFrom: "noreply@example.com" });
    await email.send(element, {
      to: "user@example.com",
      from: "support@example.com",
      subject: "Reset your password",
    });
    expect(render).toHaveBeenCalledWith(element);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      to: "user@example.com",
      from: "support@example.com",
      subject: "Reset your password",
      html: "<p>Hi</p>",
      text: "Hi",
    });
  });

  it("falls back to defaultFrom when from is omitted", async () => {
    const { send, renderer, transport } = createFakes();
    const email = createEmailService({ renderer, transport, defaultFrom: "noreply@example.com" });
    await email.send(element, { to: "user@example.com", subject: "Hello" });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: "noreply@example.com" }));
  });
});

describe("reactEmailRenderer", () => {
  it("renders a React element to html and plain text", async () => {
    const { html, text } = await reactEmailRenderer.render(React.createElement("p", null, "Hello world"));
    expect(html).toContain("Hello world");
    expect(text).toContain("Hello world");
  });
});

describe("createSendgridTransport", () => {
  it("configures the api key and forwards messages to sendgrid", async () => {
    const transport = createSendgridTransport("test-api-key");
    expect(sendgrid.setApiKey).toHaveBeenCalledWith("test-api-key");
    const message: EmailMessage = {
      to: "user@example.com",
      from: "noreply@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
      text: "Hi",
    };
    await transport.send(message);
    expect(sendgrid.send).toHaveBeenCalledWith(message);
  });
});

describe("consoleTransport", () => {
  it("logs the plain-text body instead of sending", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await consoleTransport.send({
      to: "user@example.com",
      from: "noreply@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
      text: "Hi",
    });
    expect(log).toHaveBeenCalledWith("Hi");
    log.mockRestore();
  });
});
