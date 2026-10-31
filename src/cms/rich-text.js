export function editorLinkUrl(value = "") {
  let url = String(value).trim();
  if (/^www\./i.test(url)) url = "https://" + url;
  if (!url || url.length > 2048 || /[\s\\\u0000-\u001f\u007f]/.test(url)) return null;
  if (!/^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#|\.\.?\/|\?)/i.test(url)) return null;
  try {
    const parsed = new URL(url, "https://editor.invalid");
    if (!["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) return null;
    if (["mailto:", "tel:"].includes(parsed.protocol) && !parsed.pathname) return null;
    return url;
  } catch {
    return null;
  }
}

// Normalize pasted/exported spaces without trimming text while the user types.
// Keep article subsection headings in the site's h2/h3 hierarchy.
export function normalizeRichHtml(value = "") {
  return String(value)
    .replace(/\u00a0|&nbsp;|&#0*160;|&#x0*a0;/gi, " ")
    .replace(/<h4([^>]*)>([\s\S]*?)<\/h4>/gi, (all, attrs, inner) =>
      /^(?:tensile strength|yield strength|maximum load|breaking load|extensometer|modulus)$/i.test(
        inner.replace(/<[^>]*>/g, "").trim(),
      )
        ? "<h3" + attrs + ">" + inner + "</h3>"
        : all,
    );
}
