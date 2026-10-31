// Next.js static imports retain the original raster format for blur thumbnails.
// This exception applies to blurDataURL metadata, never to image/link URLs.
export function isSafeImagePlaceholder(value) {
  return typeof value === "string" && value.length <= 3000 &&
    /^data:image\/(?:jpeg|png|webp|avif);base64,[a-z0-9+/]+={0,2}$/i.test(value);
}
