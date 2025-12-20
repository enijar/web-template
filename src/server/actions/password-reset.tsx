import crypto from "node:crypto";
import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "server/services/trpc.js";
import User from "server/models/user.js";
import config from "config/index.js";
import email from "server/services/email.js";
import PasswordReset from "emails/password-reset.js";

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
    if (user === null) {
      throw new TRPCError({ code: "NOT_FOUND", message: "We don't recognise that email in our systems" });
    }
    try {
      await email.send(<PasswordReset url={config.APP_URL} token={crypto.randomUUID()} />, {
        to: user.email,
        from: config.EMAIL_FROM,
        subject: "Test",
      });
    } catch (err) {
      console.error(err);
    }
  });
