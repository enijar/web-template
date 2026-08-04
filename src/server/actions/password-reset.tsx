import crypto from "node:crypto";
import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { formInput, publicProcedure } from "server/services/trpc.js";
import User from "server/models/user.js";
import PasswordReset from "emails/password-reset.js";

const TOKEN_TTL = 60 * 60 * 1000; // 1 hour

const RATE_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 }; // 3 reset emails per hour per email

export const passwordReset = publicProcedure
  .input(
    formInput({
      email: z.email("Invalid email"),
    }),
  )
  .mutation(async (opts) => {
    const allowed = await opts.ctx.rateLimiter.limit(`password-reset:${opts.input.email}`, RATE_LIMIT);
    if (!allowed) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many reset requests, try again later" });
    }
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
      opts.ctx.email
        .send(<PasswordReset url={opts.ctx.config.APP_URL} token={token} />, {
          to: user.email,
          subject: "Reset your password",
        })
        .catch((err) => {
          opts.ctx.logger.error("Failed to send password reset email", { error: err });
        });
    }
    return { success: true };
  });
