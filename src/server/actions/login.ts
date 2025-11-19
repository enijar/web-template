import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
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
          email: z.email("Invalid email"),
          password: z.string().nonempty("Can't be empty"),
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
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email and password, try again" });
    }
    const authenticated = await argon2.verify(user.password, opts.input.password);
    if (!authenticated) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email and password, try again" });
    }
    return {
      id: user.id,
      email: user.email,
    };
  });
