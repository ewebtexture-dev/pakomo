"use client";
import { normalizeRichHtml } from "@/cms/rich-text";
import parse, { domToReact } from "html-react-parser";
import SafeImage from "./SafeImage";
export default function RichContent({ html = "", autoImageSize = false }) {
  const options = {
    replace(node) {
      if (["script", "style", "iframe", "object", "embed"].includes(node.name))
        return <></>;
      if (node.attribs) {
        delete node.attribs.style;
        for (const key of ["href", "src"])
          if (
            /^\s*(?:javascript|data|vbscript):/i.test(node.attribs[key] || "")
          )
            delete node.attribs[key];
        for (const key of Object.keys(node.attribs))
          if (/^on/i.test(key)) delete node.attribs[key];
      }
      if (node.name === "img") {
        const a = node.attribs || {};
        const size = ["small", "medium", "large", "full"].includes(
            a["data-size"],
          )
            ? a["data-size"]
            : "full",
          align = ["left", "center", "right"].includes(a["data-align"])
            ? a["data-align"]
            : "center";
        return (
          <span
            className={
              "block " +
              (autoImageSize ? "" : "image-size-" + size + " ") +
              "image-align-" +
              align
            }
          >
            <SafeImage
              src={a.src}
              alt={a.alt}
              data-size={size}
              data-align={align}
              style={
                autoImageSize
                  ? { width: "auto", height: "auto", maxWidth: "100%" }
                  : undefined
              }
            />
            {a["data-caption"] && (
              <span className="image-caption block">{a["data-caption"]}</span>
            )}
          </span>
        );
      }
      if (node.name === "table")
        return (
          <div
            className="max-w-full overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Content table"
          >
            <table>{domToReact(node.children, options)}</table>
          </div>
        );
    },
  };
  return (
    <div className="cms-rich">{parse(normalizeRichHtml(html), options)}</div>
  );
}
