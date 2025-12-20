import { createTRPCReact } from "@trpc/react-query";
import type { Router } from "server/router.js";

export const trpc = createTRPCReact<Router>();

export default trpc;
