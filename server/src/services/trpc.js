import { initTRPC, TRPCError } from "@trpc/server";
import z from "zod";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
export const trpc = initTRPC.context().create({
    errorFormatter({ shape, error }) {
        if (error.cause instanceof z.ZodError) {
            const { fieldErrors } = error.cause.flatten();
            const allMessages = Object.values(fieldErrors).flat().filter(Boolean);
            const message = allMessages.length ? allMessages.join("; ") : shape.message;
            return {
                ...shape,
                message,
                data: {
                    ...shape.data,
                    zodError: fieldErrors,
                },
            };
        }
        return shape;
    },
});
export const publicProcedure = trpc.procedure.use(trpc.middleware(async (opts) => {
    const next = await opts.next();
    if (!next.ok) {
        console.error(next.error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Server error, try again later" });
    }
    return next;
}));
export const trpcServer = ({ endpoint = "/trpc", createContext, ...rest }) => {
    const bodyProps = new Set(["arrayBuffer", "blob", "formData", "json", "text"]);
    return async (c) => {
        const canWithBody = c.req.method === "GET" || c.req.method === "HEAD";
        return fetchRequestHandler({
            ...rest,
            createContext: async (opts) => ({
                ...(createContext ? await createContext(opts, c) : {}),
                // propagate env by default
                env: c.env,
            }),
            endpoint,
            req: canWithBody
                ? c.req.raw
                : new Proxy(c.req.raw, {
                    get(t, p, _r) {
                        if (bodyProps.has(p)) {
                            return () => c.req[p]();
                        }
                        return Reflect.get(t, p, t);
                    },
                }),
        }).then((res) => 
        // @ts-expect-error c.body accepts both ReadableStream and null but is not typed well
        c.body(res.body, res));
    };
};
export default trpc;
