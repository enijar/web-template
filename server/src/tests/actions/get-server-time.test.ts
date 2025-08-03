import { describe, expect, it } from "vitest";
import router from "~/router.js";

describe("get-server-time", () => {
  it("should get the server time", async () => {
    const caller = router.createCaller({});
    const res = await caller.getServerTime();
    expect(res).toBeTypeOf("number");
  });
});
