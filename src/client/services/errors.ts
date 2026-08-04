import { TRPCClientError } from "@trpc/client";

export function errorMessage(err: unknown) {
  return err instanceof TRPCClientError ? err.message : "Something went wrong";
}
