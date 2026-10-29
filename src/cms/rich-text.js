// Normalize nonbreaking spaces pasted from office documents and keep article
// subsection headings in the site's h2/h3 hierarchy without changing the text.
export function normalizeRichHtml(value = "") {
  return String(value)
    .replace(/\u00a0|&nbsp;|&#160;/gi, " ")
    .replace(/<h4([^>]*)>([\s\S]*?)<\/h4>/gi, (all, attrs, inner) =>
      /^(?:tensile strength|yield strength|maximum load|breaking load|extensometer|modulus)$/i.test(
        inner.replace(/<[^>]*>/g, "").trim(),
      )
        ? "<h3" + attrs + ">" + inner + "</h3>"
        : all,
    );
}
