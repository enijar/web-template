import { initTRPC, TRPCError, AnyRouter } from "@trpc/server";
import { z } from "zod/v4";
import type { FetchCreateContextFnOptions, FetchHandlerRequestOptions } from "@trpc/server/adapters/fetch";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { Context, MiddlewareHandler } from "hono";
import type { AppContext } from "~/services/app.js";

export const trpc = initTRPC.context<AppContext>().create({
  errorFormatter({ shape, error }) {
    let response: any = shape;
    if (error.cause instanceof z.ZodError) {
      const fieldErrors = z.treeifyError(error.cause);
      const allMessages = Object.values(fieldErrors).flat().filter(Boolean);
      const message = allMessages.length ? allMessages.join("; ") : shape.message;
      response = {
        ...shape,
        message,
        data: {
          ...shape.data,
          zodError: fieldErrors,
        },
      };
    }
    return response;
  },
});

export const publicProcedure = trpc.procedure.use(
  trpc.middleware(async (opts) => {
    const next = await opts.next();
    if (!next.ok) {
      console.error(next.error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Server error, try again later" });
    }
    return next;
  }),
);

type tRPCOptions = Omit<FetchHandlerRequestOptions<AnyRouter>, "req" | "endpoint" | "createContext"> &
  Partial<Pick<FetchHandlerRequestOptions<AnyRouter>, "endpoint">> & {
    createContext?(
      opts: FetchCreateContextFnOptions,
      c: Context,
    ): Record<string, unknown> | Promise<Record<string, unknown>>;
  };

export const trpcServer = ({ endpoint = "/trpc", createContext, ...rest }: tRPCOptions): MiddlewareHandler => {
  const bodyProps = new Set(["arrayBuffer", "blob", "formData", "json", "text"] as const);
  type BodyProp = typeof bodyProps extends Set<infer T> ? T : never;
  return async (ctx) => {
    const canWithBody = ctx.req.method === "GET" || ctx.req.method === "HEAD";
    return fetchRequestHandler({
      ...rest,
      async createContext(opts) {
        return {
          ...(createContext ? await createContext(opts, ctx) : {}),
          // propagate env by default
          env: ctx.env,
        };
      },
      endpoint,
      req: canWithBody
        ? ctx.req.raw
        : new Proxy(ctx.req.raw, {
            get(t, p, _r) {
              if (bodyProps.has(p as BodyProp)) {
                return () => ctx.req[p as BodyProp]();
              }
              return Reflect.get(t, p, t);
            },
          }),
    }).then((res) =>
      // @ts-expect-error c.body accepts both ReadableStream and null but is not typed well
      ctx.body(res.body, res),
    );
  };
};

export default trpc;
