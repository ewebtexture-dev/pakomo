import {plainText} from '../cms/plain-text.js';
import { getSettings } from "./settings.js";
import { listContent, publicContentBySlug } from "./cms.js";
import { ensureCmsSeed } from "./bootstrap.js";
import { publishedPost } from "./posts.js";
import { FAQ_HEADING } from "../cms/features.js";

import { siteUrl } from "./posts.js";
export function pageForPath(path) {
  ensureCmsSeed();
  const clean = path.split("?")[0].replace(/\/$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  if (
    segments.length === 3 &&
    segments[0] === "blog" &&
    segments[1] === "category"
  )
    return publicContentBySlug("blogcategory", decodeURIComponent(segments[2]));
  if (
    segments.length === 3 &&
    segments[0] === "products" &&
    segments[1] === "category"
  )
    return publicContentBySlug("category", decodeURIComponent(segments[2]));
  if (segments.length === 2) {
    if (segments[0] === "blog") {
      const post = publishedPost(decodeURIComponent(segments[1]));
      return post ? { kind: "post", title: post.title, payload: post } : null;
    }
    const kind = {
      products: "product",
      applications: "application",
      services: "service",
    }[segments[0]];
    if (kind) return publicContentBySlug(kind, decodeURIComponent(segments[1]));
  }
  const key = clean === "/" ? "home" : clean.slice(1);
  return listContent("page", true).find((p) => p.key === key) || null;
}
export function cmsMetadata(path) {
  ensureCmsSeed();
  const settings = getSettings("seo"),
    scripts = getSettings("scripts"),
    row = pageForPath(path),
    seo = row?.payload?.seo || {},
    base = siteUrl(),
    url = seo.canonicalUrl || base + path;
  const display =
    row?.payload.name ||
    row?.payload.title ||
    (row?.payload.sections
      ? Object.values(row.payload.sections).find((block) => block.title_1)
          ?.title_1
      : null) ||
    row?.title ||
    "PAKMOO Testing Instruments";
  const title =
      seo.title ||
      (path === "/"
        ? settings.siteName || "PAKMOO Testing Instruments"
        : row
          ? (
              settings.titleTemplate || "%title% | PAKMOO Testing Instruments"
            ).replace("%title%", display)
          : "PAKMOO Testing Instruments"),
    description =
      seo.metaDescription ||
      row?.payload.desc?.replace(/<[^>]*>/g, "").slice(0, 160) ||
      settings.defaultDescription ||
      "Precision testing instruments and industry-standard laboratory solutions.";
  const image = seo.ogImage || row?.payload.imageUrl || settings.defaultOgImage;
  return {
    metadataBase: new URL(base),
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index:
        !seo.noindex &&
        settings.allowIndex !== false &&
        !/^\/(admin|login|api)(\/|$)/.test(path),
      follow: !seo.nofollow,
    },
    openGraph: {
      title: plainText(seo.ogTitle || title),
      description: plainText(seo.ogDescription || description),
      url,
      siteName: settings.siteName || "PAKMOO Testing Instruments",
      type: "website",
      ...(image ? { images: [new URL(image, base).href] } : {}),
    },
    twitter: {
      card: seo.twitterCard || "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || title,
      description: seo.twitterDescription || seo.ogDescription || description,
      ...(seo.twitterImage || image
        ? { images: [new URL(seo.twitterImage || image, base).href] }
        : {}),
    },
    verification: {
      google: settings.googleVerification || undefined,
      other: settings.bingVerification
        ? { "msvalidate.01": settings.bingVerification }
        : undefined,
    },
    icons: { icon: scripts.favicon || "/favicon.ico" },
  };
}
export function schemaGraph(path) {
  const org = getSettings("schema"),
    contact = getSettings("contact"),
    base = siteUrl(),
    row = pageForPath(path),
    schema = row?.payload?.schema || {},
    graph = [];
  const organization = {
    "@type": ["Organization","LocalBusiness"],
    "@id": base + "/#organization",
    name: org.name || "PAKMOO Testing Instruments",
    url: base,
    logo: org.logo || undefined,
    legalName: org.legalName || undefined,
    address: contact.address || undefined,
    telephone: contact.phones?.[0]?.number,
    email: contact.emails?.[0],
    sameAs: (getSettings("social").items || [])
      .filter((s) => s.enabled && s.url)
      .map((s) => s.url),
    openingHours: org.openingHours || contact.hours || undefined,
    hasMap: contact.mapLink||'https://maps.app.goo.gl/fhGb3YTsKg9ZsC4z5',
    ...((contact.latitude||org.latitude) && (contact.longitude||org.longitude)
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: contact.latitude||org.latitude,
            longitude: contact.longitude||org.longitude,
          },
        }
      : {}),
  };
  graph.push(organization, {
    "@type": "WebSite",
    "@id": base + "/#website",
    url: base,
    name: getSettings("seo").siteName || organization.name,
    publisher: { "@id": organization["@id"] },
    ...(org.searchUrl
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: org.searchUrl,
            "query-input": "required name=search_term",
          },
        }
      : {}),
  });
  if (row) {
    const type =
        schema.type ||
        (row.kind === "product"
          ? "Product"
          : row.kind === "service"
            ? "Service"
            : "WebPage"),
      f = schema.fields || {},
      item = {
        "@type": type,
        "@id": base + path + "#" + type.toLowerCase(),
        url: base + path,
        name: f.name || row.payload.name || row.title,
        description: f.description || row.payload.desc || undefined,
        ...f,
      };
    for (const key of [
      "price",
      "priceCurrency",
      "availability",
      "ratingValue",
      "ratingCount",
      "questions",
      "steps",
      "breadcrumbs",
    ])
      delete item[key];
    if (type === "Product") {
      item.sku = f.sku || row.payload.model || undefined;
      if (f.brand) item.brand = { "@type": "Brand", name: f.brand };
      if (f.price && f.priceCurrency)
        item.offers = {
          "@type": "Offer",
          price: f.price,
          priceCurrency: f.priceCurrency,
          availability: f.availability || "https://schema.org/InStock",
          url: base + path,
        };
      if (Number(f.ratingValue) > 0 && Number(f.ratingCount) > 0)
        item.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: Number(f.ratingValue),
          ratingCount: Number(f.ratingCount),
        };
    }
    if (type === "FAQPage")
      item.mainEntity = (f.questions || [])
        .filter((q) => q.question && q.answer)
        .map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: { "@type": "Answer", text: q.answer },
        }));
    if (type === "HowTo")
      item.step = (f.steps || []).map((s) => ({
        "@type": "HowToStep",
        name: s.name,
        text: s.description,
      }));
    if (type === "BreadcrumbList")
      item.itemListElement = (f.breadcrumbs || []).map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url,
      }));
    graph.push(item);
    if (schema.customJson) {
      const custom = JSON.parse(schema.customJson);
      graph.push(
        ...(Array.isArray(custom) ? custom : custom["@graph"] || [custom]),
      );
    }
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph.filter((item) => ![].concat(item["@type"] || []).includes("FAQPage")),
  };
}

export function faqForPath(path) {
  const row = pageForPath(path);
  if (!row) return null;
  return (
    row.payload.faqSection ||
    (row.kind === "service"
      ? listContent("page", true).find((p) => p.key === "service-" + row.slug)
          ?.payload.faqSection
      : null) ||
    (row.payload.faqs
      ? { heading: FAQ_HEADING, description: "", items: row.payload.faqs }
      : null)
  );
}
