import { createTRPCReact } from "@trpc/react-query";
import { type Router } from "../../../server/src/router";

export const trpc = createTRPCReact<Router>();

export default trpc;
