import { createTRPCReact } from "@trpc/react-query";
import type { Router } from "server/router";

export const trpc = createTRPCReact<Router>();

export default trpc;
