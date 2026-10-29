"use client";
import RichContent from "./RichContent";
import { useId } from "react";
import { Plus } from "lucide-react";
import { activeFaqs, FAQ_HEADING, faqPlainText } from "@/cms/features";
export default function FaqSection({ value }) {
  const id = useId(),
    items = activeFaqs(value);
  if (!items.length) return null;
  return (
    <section aria-labelledby={id} className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: faqPlainText(item.q),
              acceptedAnswer: { "@type": "Answer", text: faqPlainText(item.a) },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2
          id={id}
          className="text-2xl sm:text-3xl font-bold text-center text-foreground break-words"
        >
          {value.heading || FAQ_HEADING}
        </h2>
        {value.description && (
          <p className="text-center text-muted-foreground mt-3 mb-6 break-words">
            {value.description}
          </p>
        )}
        <div className="mt-8">
          {items.map((item, i) => (
            <details
              key={item.id || i}
              className="faq-item border-b border-border"
              onToggle={(e) => {
                e.currentTarget
                  .querySelector("summary")
                  ?.setAttribute("aria-expanded", String(e.currentTarget.open));
              }}
            >
              <summary
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.currentTarget.parentElement.open =
                      !e.currentTarget.parentElement.open;
                  }
                }}
                aria-controls={id + "-" + i}
                aria-expanded="false"
                className="flex items-center justify-between gap-4 py-5 font-semibold cursor-pointer list-none focus-visible:outline-primary"
              >
                <span className="min-w-0 break-words">{item.q}</span>
                <Plus aria-hidden className="w-5 h-5 shrink-0 faq-plus" />
              </summary>
              <div id={id + "-" + i} className="pb-5 faq-answer">
                <RichContent html={item.a} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
