import crypto from "node:crypto";
import { z } from "zod/v4";
import { publicProcedure } from "server/services/trpc.js";
import User from "server/models/user.js";
import config from "config/index.js";
import email from "server/services/email.js";
import PasswordReset from "emails/password-reset.js";

const TOKEN_TTL = 60 * 60 * 1000; // 1 hour

export const passwordReset = publicProcedure
  .input(
    z
      .instanceof(FormData)
      .transform((arg) => {
        return {
          email: arg.get("email"),
        };
      })
      .pipe(
        z.object({
          email: z.email("Invalid email"),
        }),
      ),
  )
  .mutation(async (opts) => {
    const user = await User.findOne({
      where: {
        email: opts.input.email,
      },
    });
    if (user !== null) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
      user.passwordResetExpiresAt = new Date(Date.now() + TOKEN_TTL);
      await user.save();
      email
        .send(<PasswordReset url={config.APP_URL} token={token} />, {
          to: user.email,
          from: config.EMAIL_FROM,
          subject: "Reset your password",
        })
        .catch((err) => {
          console.error(err);
        });
    }
    return { success: true };
  });
