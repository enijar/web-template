import Email from "email-templates";
import config from "~/config.js";

const email = new Email({
  transport: config.email.transport,
  views: {
    root: config.email.templates,
    options: {
      extension: "ejs",
    },
  },
  preview: {
    open: config.email.preview,
    openSimulator: false,
  },
  send: config.email.send,
  message: {
    from: config.email.from,
  },
});

export default email;
