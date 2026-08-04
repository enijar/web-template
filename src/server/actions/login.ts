import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "server/services/trpc.js";
import User from "server/models/user.js";

export const login = publicProcedure
  .input(
    z
      .instanceof(FormData)
      .transform((arg) => {
        return {
          email: arg.get("email"),
          password: arg.get("password"),
        };
      })
      .pipe(
        z.object({
          email: z.email("Email is invalid").nonempty("Email is required"),
          password: z.string().nonempty("Password is required"),
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
