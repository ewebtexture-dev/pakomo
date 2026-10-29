"use client";
import { usePathname } from "next/navigation";
import { useCmsSnapshot } from "@/components/cms/ContentProvider";
import usePublicContent from "@/components/cms/usePublicContent";
import FaqSection from "./FaqSection";
import { FAQ_HEADING } from "@/cms/features";
function resolveFaq(path, { pages, collections }) {
  if (/^\/(admin|api|login)(\/|$)/.test(path)) return null;
  let segments;
  try {
    segments = path.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }
  if (segments.length === 2 && segments[0] === "blog") return null;
  let payload;
  if (segments.length === 3 && segments[1] === "category") {
    const kind =
      segments[0] === "blog"
        ? "blogcategory"
        : segments[0] === "products"
          ? "category"
          : null;
    payload = kind
      ? collections[kind]?.find((row) => row._slug === segments[2])
      : null;
  } else if (segments.length === 2) {
    const kind = {
      products: "product",
      applications: "application",
      services: "service",
    }[segments[0]];
    payload = kind
      ? collections[kind]?.find((row) => row._slug === segments[1])
      : null;
  } else payload = pages[segments[0] || "home"];
  let value = payload?.faqSection;
  if (!value && segments[0] === "services" && segments.length === 2)
    value = pages["service-" + segments[1]]?.faqSection;
  if (!value && payload?.faqs)
    value = { heading: FAQ_HEADING, description: "", items: payload.faqs };
  return value;
}

export default function RouteFaqSection() {
  const path = usePathname(),
    snapshot = useCmsSnapshot(),
    initial = resolveFaq(path, snapshot),
    enabled =
      !/^\/(admin|api|login)(\/|$)/.test(path) && !/^\/blog\/[^/]+$/.test(path),
    value = usePublicContent("faq", initial, enabled);
  return <FaqSection key={path} value={value} />;
}
