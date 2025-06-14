import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "~/services/trpc.js";
import router from "~/router.js";
async function createContext() {
    return {};
}
const app = new Hono();
app.use(cors());
app.use("/trpc/*", trpcServer({ router, createContext }));
export default app;
