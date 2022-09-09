import { createReactQueryHooks } from "@trpc/react";
import { type Router } from "../../../server/src/router";

const trpc = createReactQueryHooks<Router>();

export default trpc;
