"use client";
import { useEffect } from "react";
export default function ImageSafety() {
  useEffect(() => {
    const fix = () =>
      document.querySelectorAll("main img,footer img").forEach((img) => {
        if (!img.getAttribute("loading")) img.loading = "lazy";
        if (!img.alt) img.alt = "PAKMOO testing instruments";
        if (
          img.complete &&
          !img.naturalWidth &&
          img.src &&
          !img.src.endsWith("/image-placeholder.svg")
        )
          img.src = "/image-placeholder.svg";
      });
    const error = (e) => {
      if (
        e.target instanceof HTMLImageElement &&
        !e.target.src.endsWith("/image-placeholder.svg")
      )
        e.target.src = "/image-placeholder.svg";
    };
    const observer = new MutationObserver(fix);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("error", error, true);
    fix();
    return () => {
      observer.disconnect();
      document.removeEventListener("error", error, true);
    };
  }, []);
  return null;
}
