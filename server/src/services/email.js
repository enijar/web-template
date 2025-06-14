import sendgrid from "@sendgrid/mail";
import { render } from "@react-email/components";
import config from "~/config.js";
sendgrid.setApiKey(config.email.apiKey);
const email = {
    async send(email, options) {
        const html = await render(email);
        return sendgrid.send({
            ...options,
            to: options.to,
            from: options.from ?? { email: config.email.from },
            subject: options.subject,
            html,
        });
    },
};
export default email;
