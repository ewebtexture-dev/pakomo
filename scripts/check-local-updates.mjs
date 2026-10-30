import fs from "node:fs";
import assert from "node:assert/strict";
import {
  firebaseDefaults,
  firebaseSettingsSchema,
} from "../src/cms/firebase.js";

const base = process.env.TEST_ORIGIN || "http://localhost:3000";
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Run this check against the local server only.",
);
const credentials = fs.readFileSync(".data/local-admin.txt", "utf8");
let cookie = "",
  previousFirebase;
const ids = [];
async function request(path, method = "GET", body, authenticated = true) {
  return fetch(base + path, {
    method,
    headers: {
      Origin: base,
      ...(authenticated && cookie ? { Cookie: cookie } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
}
async function json(path, method = "GET", body, status = 200) {
  const response = await request(path, method, body);
  const value = await response.json();
  assert.equal(response.status, status, JSON.stringify(value));
  return value;
}
try {
  assert.equal(
    (await request("/api/admin/firebase", "GET", undefined, false)).status,
    401,
  );
  const login = await request(
    "/api/auth/login",
    "POST",
    {
      username: credentials.match(/Username: (.+)/)[1].trim(),
      password: credentials.match(/Password: (.+)/)[1].trim(),
    },
    false,
  );
  assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie").split(";")[0];
  for (const [kind, payload] of [
    [
      "client",
      {
        name: "Local client check",
        logo: "/image-placeholder.svg",
        website: "https://example.com",
        industries: ["Testing"],
        image_alt: "Client alt",
      },
    ],
    [
      "testimonial",
      {
        name: "Local testimonial check",
        quote: "<p>Temporary check</p>",
        role: "Tester",
        company: "Local test",
        rating: 5,
      },
    ],
    [
      "gallery",
      {
        title: "Local gallery check",
        alt: "Gallery alt",
        image: "/image-placeholder.svg",
      },
    ],
  ]) {
    const key = "local-check-" + kind + "-" + Date.now();
    let record = (
      await json(
        "/api/admin/content",
        "POST",
        {
          kind,
          key,
          slug: key,
          title: key,
          status: "draft",
          enabled: true,
          payload: {
            ...payload,
            seo: { title: "Must not persist" },
            schema: { type: "Organization" },
          },
        },
        201,
      )
    ).record;
    ids.push(record.id);
    assert.equal(Object.hasOwn(record.payload, "seo"), false);
    assert.equal(Object.hasOwn(record.payload, "schema"), false);
    record = (
      await json("/api/admin/content/" + record.id, "PUT", {
        ...record,
        payload: {
          ...record.payload,
          seo: { title: "Must not persist on edit" },
          schema: { type: "Organization" },
        },
      })
    ).record;
    assert.equal(Object.hasOwn(record.payload, "seo"), false);
    assert.equal(Object.hasOwn(record.payload, "schema"), false);
    if (kind === "client") {
      assert.deepEqual(record.payload.industries, ["Testing"]);
      assert.equal(record.payload.image_alt, "Client alt");
    }
  }
  previousFirebase = (await json("/api/admin/firebase")).settings;
  assert.equal(
    firebaseSettingsSchema.safeParse({ ...firebaseDefaults, enabled: true })
      .success,
    false,
  );
  assert.equal(
    firebaseSettingsSchema.safeParse({
      ...firebaseDefaults,
      private_key: "not-accepted",
    }).success,
    false,
  );
  await json(
    "/api/admin/firebase",
    "PUT",
    { ...firebaseDefaults, enabled: true },
    422,
  );
  await json(
    "/api/admin/firebase",
    "PUT",
    { ...firebaseDefaults, private_key: "not-accepted" },
    422,
  );
  const settings = (await json("/api/admin/firebase", "PUT", firebaseDefaults))
    .settings;
  assert.deepEqual(settings, firebaseDefaults);
  assert.deepEqual(
    (await json("/api/admin/firebase")).settings,
    firebaseDefaults,
  );
  assert.equal(
    (await request("/api/public/content?scope=firebase")).status,
    422,
  );
  for (const path of [
    "/admin",
    "/admin/catalog/clients/new",
    "/admin/catalog/testimonials/new",
    "/admin/catalog/gallery",
    "/admin/firebase",
    "/blog",
  ])
    assert.equal((await request(path)).status, 200, path);
  console.log(
    "PASS: local add/edit SEO exclusion, client fields retained, protected Firebase settings, configuration validation, local persistence, public API privacy and admin routes. No Firebase network requests made.",
  );
} finally {
  for (const id of ids) await request("/api/admin/content/" + id, "DELETE");
  if (previousFirebase)
    await request("/api/admin/firebase", "PUT", previousFirebase);
  if (cookie) await request("/api/auth/logout", "POST");
}
