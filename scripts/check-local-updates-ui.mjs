import fs from "node:fs";
import assert from "node:assert/strict";
import sharp from "sharp";
const base = "http://localhost:3000",
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const tabs = await (await fetch("http://127.0.0.1:9222/json")).json();
const socket = new WebSocket(
  tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl,
);
await new Promise((resolve) =>
  socket.addEventListener("open", resolve, { once: true }),
);
let id = 0;
const requests = new Map(),
  exceptions = [],
  consoleErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const pending = requests.get(message.id);
    requests.delete(message.id);
    message.error
      ? pending.reject(message.error)
      : pending.resolve(message.result);
  } else if (message.method === "Runtime.exceptionThrown")
    exceptions.push(message.params.exceptionDetails.text);
  else if (
    message.method === "Runtime.consoleAPICalled" &&
    message.params.type === "error"
  )
    consoleErrors.push(
      message.params.args.map((arg) => arg.value || arg.description).join(" "),
    );
});
const call = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const key = ++id;
    requests.set(key, { resolve, reject });
    socket.send(JSON.stringify({ id: key, method, params }));
  });
async function evaluate(expression) {
  const r = await call("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function until(expression) {
  for (let n = 0; n < 100; n++) {
    if (await evaluate(expression)) return;
    await wait(200);
  }
  throw Error("Timed out: " + expression);
}
async function navigate(path) {
  await call("Page.navigate", { url: base + path });
  await until(
    "location.pathname===" +
      JSON.stringify(path) +
      '&&document.readyState==="complete"',
  );
  await wait(350);
}
async function api(path, method = "GET", body) {
  return evaluate(
    `fetch(${JSON.stringify(path)},{method:${JSON.stringify(method)},headers:{'Content-Type':'application/json'},${body ? "body:" + JSON.stringify(JSON.stringify(body)) + "," : ""}}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(r.status+' '+d.error);return d;})`,
  );
}
async function mouseClick(selector) {
  const point = await evaluate(
    `(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({behavior:'instant',block:'center',inline:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})()`,
  );
  assert.ok(point.hit, "Another layer blocks " + selector);
  await call("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
  await call("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
}
const saved = fs.readFileSync(".data/local-admin.txt", "utf8"),
  credentials = {
    username: saved.match(/Username: (.+)/)[1].trim(),
    password: saved.match(/Password: (.+)/)[1].trim(),
  };
let socialBefore, firebaseBefore, postId, mediaId;
const recordIds = [];
try {
  await call("Page.enable");
  await call("Runtime.enable");
  await call("Page.bringToFront");
  await call("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navigate("/admin/login");
  await api("/api/auth/login", "POST", credentials);
  await navigate("/admin");
  await until(
    `Boolean(document.querySelector('nav[aria-label="Admin navigation"]'))`,
  );
  assert.equal(
    await evaluate(
      `Boolean(document.querySelector('nav[aria-label="Primary navigation"]'))`,
    ),
    false,
  );
  const links = await evaluate(
    `[...document.querySelectorAll('nav[aria-label="Admin navigation"] a')].map(a=>a.getAttribute("href"))`,
  );
  assert.ok(links.length >= 21);
  for (const href of links) {
    await navigate("/admin");
    await until(
      'document.body.innerText.includes("What would you like to do?")',
    );
    await mouseClick(
      'nav[aria-label="Admin navigation"] a[href="' + href + '"]',
    );
    await until("location.pathname===" + JSON.stringify(href));
    assert.equal(
      await evaluate(
        'document.body.innerText.includes("This page could not be found")',
      ),
      false,
    );
  }
  console.log(
    "PASS: all " +
      links.length +
      " admin sidebar links clicked from dashboard with real mouse events.",
  );
  for (const kind of ["client", "testimonial"]) {
    const collection = kind === "client" ? "clients" : "testimonials";
    await navigate("/admin/catalog/" + collection + "/new");
    await until('Boolean(document.querySelector("form"))');
    assert.equal(
      await evaluate(
        'document.querySelector("form").innerText.includes("Focus keyword")',
      ),
      false,
    );
    assert.equal(
      await evaluate(
        'document.querySelector("form").innerText.includes("Custom JSON-LD")',
      ),
      false,
    );
    const key = "local-ui-" + kind + "-" + Date.now();
    const payload =
      kind === "client"
        ? {
            name: "Temporary client",
            logo: "/image-placeholder.svg",
            website: "",
            industries: [],
            image_alt: "Client logo",
          }
        : {
            name: "Temporary testimonial",
            quote: "<p>Temporary quote</p>",
            role: "Tester",
            company: "Local check",
            rating: 5,
          };
    const record = (
      await api("/api/admin/content", "POST", {
        kind,
        key,
        slug: key,
        title: key,
        status: "draft",
        enabled: true,
        payload,
      })
    ).record;
    recordIds.push(record.id);
    await navigate("/admin/catalog/" + collection + "/" + record.id);
    await until('Boolean(document.querySelector("form"))');
    assert.equal(
      await evaluate(
        'document.querySelector("form").innerText.includes("Focus keyword")',
      ),
      false,
    );
  }
  await navigate("/admin/catalog/gallery");
  assert.equal(
    await evaluate(
      'document.querySelector("aside").nextElementSibling.innerText.includes("Focus keyword")',
    ),
    false,
  );
  firebaseBefore = (await api("/api/admin/firebase")).settings;
  await navigate("/admin/firebase");
  await until('Boolean(document.querySelector("input[pattern]"))');
  assert.equal(
    await evaluate(
      '[...document.querySelectorAll("button")].find(b=>b.textContent==="Check Firestore read").disabled',
    ),
    !firebaseBefore.enabled,
  );
  await mouseClick("form button");
  await until(
    'document.body.innerText.includes("Firebase connection settings saved")',
  );
  assert.deepEqual((await api("/api/admin/firebase")).settings, firebaseBefore);
  socialBefore = (await api("/api/admin/settings?scope=social")).settings;
  const platforms = [
    "Facebook",
    "Instagram",
    "LinkedIn",
    "YouTube",
    "X/Twitter",
    "WhatsApp",
    "Pinterest",
    "Other",
  ];
  await api("/api/admin/settings", "PUT", {
    scope: "social",
    settings: {
      shareBlog: true,
      items: platforms.map((platform, i) => ({
        id: "local-icon-" + i,
        platform,
        url: "https://example.com/social-" + i,
        enabled: true,
      })),
    },
  });
  await navigate("/contact");
  await until(
    `document.querySelectorAll('a[aria-label^="Follow on"] i.fa').length===16`,
  );
  await evaluate("document.fonts.ready.then(()=>true)");
  assert.ok(await evaluate('document.fonts.check("16px FontAwesome")'));
  const icons = await evaluate(
    `[...document.querySelectorAll('a[aria-label^="Follow on"] i.fa')].map(i=>({family:getComputedStyle(i).fontFamily,content:getComputedStyle(i,"::before").content,href:i.closest("a").href}))`,
  );
  assert.ok(
    icons.every(
      (i) =>
        i.family.includes("FontAwesome") &&
        !["none", "normal", '""'].includes(i.content) &&
        i.href.startsWith("https://example.com/social-"),
    ),
  );
  const image = await sharp({
    create: { width: 1920, height: 1080, channels: 3, background: "#2862ab" },
  })
    .jpeg()
    .toBuffer();
  const bytes = image.toString("base64");
  const upload = await evaluate(
    `(async()=>{const bytes=Uint8Array.from(atob(${JSON.stringify(bytes)}),c=>c.charCodeAt(0));const form=new FormData();form.set('image',new Blob([bytes],{type:'image/jpeg'}),'local-1920x1080.jpg');const r=await fetch('/api/admin/uploads',{method:'POST',body:form});const d=await r.json();if(!r.ok)throw Error(d.error);return d;})()`,
  );
  mediaId = upload.id;
  assert.equal(upload.width, 1920);
  assert.equal(upload.height, 1080);
  const author = (await api("/api/admin/authors")).authors.find(
      (a) => a.active,
    ),
    slug = "local-responsive-" + Date.now();
  const post = (
    await api("/api/admin/posts", "POST", {
      title: "Local responsive image check",
      slug,
      excerpt: "Temporary image dimensions check",
      content:
        '<p>Temporary article used to check responsive image dimensions and natural content image sizes.</p><p><img src="/image-placeholder.svg" alt="Natural inline image" data-size="small" data-align="center" /></p>',
      category: "industry_insights",
      category_ids: ["industry_insights"],
      author_id: author.id,
      image_url: upload.url,
      image_alt: "1920 by 1080 feature",
      status: "published",
      published_at: new Date(Date.now() - 1000).toISOString(),
    })
  ).post;
  postId = post.id;
  for (const width of [320, 375, 768, 1024, 1280, 1536]) {
    await call("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    for (const path of ["/blog", "/blog/" + slug]) {
      await navigate(path);
      await until(
        '[...document.querySelectorAll("img")].filter(i=>i.alt==="1920 by 1080 feature").every(i=>i.complete&&i.naturalWidth===1920)',
      );
      const metrics = await evaluate(
        '({w:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,feature:[...document.querySelectorAll("img")].filter(i=>i.alt==="1920 by 1080 feature"&&(i.closest("figure")||i.closest("article"))).map(i=>({w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height,fit:getComputedStyle(i).objectFit})),inline:[...document.querySelectorAll("img")].filter(i=>i.alt==="Natural inline image").map(i=>({w:i.getBoundingClientRect().width,parent:i.parentElement.getBoundingClientRect().width,style:i.style.width}))})',
      );
      assert.ok(metrics.scroll <= metrics.w + 2, JSON.stringify(metrics));
      assert.ok(metrics.feature.length);
      for (const feature of metrics.feature) {
        assert.ok(
          Math.abs(feature.w / feature.h - 16 / 9) < 0.02,
          JSON.stringify(feature),
        );
        assert.equal(feature.fit, "contain");
      }
      for (const inline of metrics.inline) {
        assert.equal(inline.style, "auto");
        assert.ok(inline.w <= inline.parent + 1);
      }
    }
  }
  assert.deepEqual(exceptions, []);
  assert.deepEqual(consoleErrors, []);
  console.log(
    "PASS: add/edit SEO hidden, Firebase local setup/save, all Font Awesome icons/fonts/links, 1920x1080 images at six widths, natural inline images, no overflow or console/runtime errors.",
  );
} catch (error) {
  console.error(
    "Browser diagnostic:",
    await evaluate(
      '({url:location.href,innerWidth,scrollX,scrollY,activeTag:document.activeElement?.tagName,activeHref:document.activeElement?.getAttribute("href")})',
    ),
  );
  const screenshot = await call("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    ".data/local-updates-failure.png",
    Buffer.from(screenshot.data, "base64"),
  );
  throw error;
} finally {
  if (postId) await api("/api/admin/posts/" + postId, "DELETE").catch(() => {});
  if (mediaId)
    await api("/api/admin/media?id=" + mediaId, "DELETE").catch(() => {});
  for (const key of recordIds)
    await api("/api/admin/content/" + key, "DELETE").catch(() => {});
  if (socialBefore)
    await api("/api/admin/settings", "PUT", {
      scope: "social",
      settings: socialBefore,
    }).catch(() => {});
  if (firebaseBefore)
    await api("/api/admin/firebase", "PUT", firebaseBefore).catch(() => {});
  socket.close();
}
