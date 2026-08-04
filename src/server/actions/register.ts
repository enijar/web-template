import { z } from "zod/v4";
import { UniqueConstraintError } from "@sequelize/core";
import { TRPCError } from "@trpc/server";
import { formInput, publicProcedure } from "server/services/trpc.js";
import User from "server/models/user.js";

const IP_RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 }; // 5 accounts per hour per ip

export const register = publicProcedure
  .input(
    formInput({
      email: z.email("Email is invalid").nonempty("Email is required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  )
  .mutation(async (opts) => {
    const allowed = await opts.ctx.rateLimiter.limit(`register:ip:${opts.ctx.ip}`, IP_RATE_LIMIT);
    if (!allowed) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts, try again later" });
    }
    let user: User;
    try {
      user = await User.create({
        email: opts.input.email,
        password: await opts.ctx.auth.hashPassword(opts.input.password),
      });
    } catch (err) {
      // The unique index on email is the source of truth, so a pre-check can't race
      if (err instanceof UniqueConstraintError) {
        throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
      }
      throw err;
    }
    await opts.ctx.auth.startSession(user, opts.ctx.resHeaders);
    return {
      id: user.id,
      email: user.email,
    };
  });
