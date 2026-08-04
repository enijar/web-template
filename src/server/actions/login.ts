import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { formInput, publicProcedure } from "server/services/trpc.js";
import User from "server/models/user.js";

const RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 }; // 10 attempts per 15 minutes per email

export const login = publicProcedure
  .input(
    formInput({
      email: z.email("Email is invalid").nonempty("Email is required"),
      password: z.string().nonempty("Password is required"),
    }),
  )
  .mutation(async (opts) => {
    const allowed = await opts.ctx.rateLimiter.limit(`login:${opts.input.email}`, RATE_LIMIT);
    if (!allowed) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts, try again later" });
    }
    const user = await User.findOne({
      where: {
        email: opts.input.email,
      },
    });
    if (user === null) {
      // Hash anyway so response timing doesn't reveal whether the email is registered
      await opts.ctx.auth.hashPassword(opts.input.password);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email or password, try again" });
    }
    const authenticated = await opts.ctx.auth.verifyPassword(user.password, opts.input.password);
    if (!authenticated) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email or password, try again" });
    }
    await opts.ctx.auth.startSession(user, opts.ctx.resHeaders);
    return {
      id: user.id,
      email: user.email,
    };
  });
