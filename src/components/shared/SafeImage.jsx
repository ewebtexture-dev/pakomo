"use client";
import { useState, useEffect } from "react";
export default function SafeImage({
  src,
  alt = "",
  loading = "lazy",
  blurDataURL = "",
  ...props
}) {
  const [failed, setFailed] = useState(false),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);
  const placeholder =
    blurDataURL || (typeof src === "object" ? src?.blurDataURL : "");
  return (
    <img
      {...props}
      style={{
        ...props.style,
        ...(!loaded && placeholder
          ? {
              backgroundImage: "url(" + placeholder + ")",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}),
      }}
      src={
        failed || !src
          ? "/image-placeholder.svg"
          : typeof src === "object"
            ? src.src
            : src
      }
      alt={alt || "PAKMOO image"}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}
