"use client";
import CmsField from "./CmsField";
import { FAQ_HEADING } from "@/cms/features";
export default function FaqEditor({ value, onChange, legacy = [] }) {
  const next = value || {
    heading: FAQ_HEADING,
    description: "",
    items: legacy.map((item, i) => ({
      ...item,
      id: "legacy-" + i,
      enabled: item.enabled !== false,
    })),
  };
  return (
    <details open className="border border-white/15 rounded-xl p-5 space-y-5">
      <summary className="font-semibold cursor-pointer">FAQs</summary>
      <CmsField
        label="FAQ section heading"
        value={next.heading}
        onChange={(heading) => onChange({ ...next, heading })}
      />
      <CmsField
        label="Optional short description"
        value={next.description}
        onChange={(description) => onChange({ ...next, description })}
      />
      <CmsField
        label="Questions and answers"
        name="faqItems"
        value={next.items}
        onChange={(items) => onChange({ ...next, items })}
      />
      <p className="text-xs text-white/50">
        Hidden on the website until there is an active question and answer.
        Answers use the same rich text editor as articles.
      </p>
    </details>
  );
}
