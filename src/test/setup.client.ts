// jsdom gets its own realm's Uint8Array while TextEncoder comes from Node, so bytes encoded
// by server code (e.g. jose signing a JWT) fail instanceof checks. Align the global with
// whatever TextEncoder actually produces so both realms agree.
globalThis.Uint8Array = new TextEncoder().encode("").constructor as Uint8ArrayConstructor;
