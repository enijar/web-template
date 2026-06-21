import crypto from "node:crypto";
import { z } from "zod/v4";
import { Op } from "@sequelize/core";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { publicProcedure } from "server/services/trpc.js";
import User from "server/models/user.js";

export const passwordResetComplete = publicProcedure
  .input(
    z
      .instanceof(FormData)
      .transform((arg) => {
        return {
          token: arg.get("token"),
          password: arg.get("password"),
        };
      })
      .pipe(
        z.object({
          token: z.string().nonempty("Invalid token"),
          password: z.string().min(8, "Password must be at least 8 characters"),
        }),
      ),
  )
  .mutation(async (opts) => {
    const passwordResetToken = crypto.createHash("sha256").update(opts.input.token).digest("hex");
    const user = await User.findOne({
      where: {
        passwordResetToken,
        passwordResetExpiresAt: { [Op.gt]: new Date() },
      },
    });
    if (user === null) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid or has expired" });
    }
    user.password = await argon2.hash(opts.input.password);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await user.save();
    return { success: true };
  });
