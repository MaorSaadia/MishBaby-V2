import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";

const routeSource = await readFile(new URL("../app/api/webhooks/sanity/route.ts", import.meta.url), "utf8");
const tagsSource = await readFile(new URL("../lib/content-cache.ts", import.meta.url), "utf8");

// Exercise the route's authentication/expiration decisions without a running
// Next server. Signature cryptography remains the next-sanity library's job.
async function handler({ secret = "test-secret", signed = true, malformed = false, failExpiry = false } = {}) {
  const calls = [];
  const context = createContext({ Response, process: { env: { SANITY_REVALIDATE_SECRET: secret } } });
  const modules = {
    "@/lib/content-cache": new SourceTextModule(stripTypeScriptTypes(tagsSource), { context }),
  };
  const dependencies = {
    "next/cache": {
      revalidateTag: (tag, profile) => {
        if (failExpiry) throw new Error("Cache unavailable");
        calls.push({ tag, expire: profile.expire });
      },
    },
    "next/server": { NextResponse: Response },
    "next-sanity/webhook": {
      parseBody: async (request, suppliedSecret, waitForPropagation) => {
        assert.equal(suppliedSecret, secret);
        assert.equal(waitForPropagation, true);
        if (malformed) throw new SyntaxError("Invalid JSON");
        return { isValidSignature: signed, body: await request.json() };
      },
    },
  };
  for (const [name, exports] of Object.entries(dependencies)) {
    modules[name] = new SyntheticModule(Object.keys(exports), function () {
      for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
    }, { context });
  }
  const route = new SourceTextModule(stripTypeScriptTypes(routeSource), { context });
  await route.link((name) => modules[name]);
  await route.evaluate();
  return {
    calls,
    send: (body) => route.namespace.POST(new Request("https://example.com/api/webhooks/sanity", {
      method: "POST",
      body: JSON.stringify(body),
    })),
  };
}

test("rejects unconfigured, invalid-signature, malformed and incomplete requests without expiration", async () => {
  for (const [options, body, status] of [
    [{ secret: "" }, { _id: "p1", _type: "product" }, 503],
    [{ signed: false }, { _id: "p1", _type: "product" }, 401],
    [{ signed: null }, { _id: "p1", _type: "product" }, 401],
    [{ malformed: true }, {}, 400],
    [{}, null, 400],
    [{}, [], 400],
    [{}, { _type: "product" }, 400],
  ]) {
    const route = await handler(options);
    assert.equal((await route.send(body)).status, status);
    assert.deepEqual(route.calls, []);
  }
});

test("ignores drafts, release versions, unrelated types and prototype property names", async () => {
  for (const body of [
    { _id: "drafts.p1", _type: "product" },
    { _id: "versions.release.p1", _type: "product" },
    { _id: "p1", _type: "unrelated" },
    { _id: "p1", _type: "constructor" },
  ]) {
    const route = await handler();
    const response = await route.send(body);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).revalidated, false);
    assert.deepEqual(route.calls, []);
  }
});

test("published document events expire only their allowlisted tag immediately", async () => {
  for (const type of ["product", "category", "collection", "guide", "merchant", "homepageSettings", "sanity.imageAsset"]) {
    const route = await handler();
    const response = await route.send({ _id: "published-id", _type: type });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { revalidated: true });
    assert.deepEqual(route.calls, [{ tag: `sanity:${type === "sanity.imageAsset" ? "imageAsset" : type}`, expire: 0 }]);
  }
});

test("returns a retryable failure if cache expiration fails", async () => {
  const route = await handler({ failExpiry: true });
  assert.equal((await route.send({ _id: "p1", _type: "product" })).status, 500);
});
