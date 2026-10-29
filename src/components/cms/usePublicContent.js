"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
const pending = new Map();
export default function usePublicContent(scope, initial, enabled = true) {
  const path = usePathname(),
    [data, setData] = useState(() => ({ path, value: initial }));
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const url =
      "/api/public/content?scope=" +
      scope +
      (scope === "faq" ? "&path=" + encodeURIComponent(path) : "");
    const key=url+"|"+path;
    const refresh = () => {
      if (!pending.has(key)) {
        const request = fetch(url, { cache: "no-store" })
          .then(async (r) => {
            if (!r.ok) throw Error("Content is temporarily unavailable.");
            return (await r.json()).value;
          })
          .finally(() => pending.delete(key));
        pending.set(key, request);
      }
      pending
        .get(key)
        .then((value) => {
          if (active) setData({ path, value });
        })
        .catch(() => {});
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
    };
  }, [path, scope, enabled]);
  return data.path === path ? data.value : scope === "faq" ? null : initial;
}
