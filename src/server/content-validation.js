import { faqSchema } from "../cms/features.js";
import {isSafeImagePlaceholder} from '../cms/image-placeholder.js';
import { z } from "zod";
const short = z.string().max(250),
  rich = z.string().max(200000),
  url = z
    .string()
    .max(2000)
    .refine(
      (v) =>
        !v ||
        (/^\/(?!\/)/.test(v) && !/[\r\n]/.test(v)) ||
        /^https:\/\/[^\s]+$/i.test(v) ||
        /^(?:tel:|mailto:)[^\s]+$/.test(v),
      "Use an internal path or valid HTTPS URL.",
    );
const image = z.union([url, z.object({ src: url }).passthrough()]);
export const seoSchema = z
  .object({
    focusKeyword: z.string().max(150).optional(),
    relatedKeywords: z.string().max(1000).optional(),
    title: z.string().max(180).optional(),
    metaDescription: z.string().max(320).optional(),
    canonicalUrl: z
      .string()
      .max(2000)
      .refine(
        (v) => !v || /^https?:\/\/[^\s]+$/.test(v),
        "Use an absolute HTTP or HTTPS canonical URL.",
      )
      .optional(),
    noindex: z.boolean().optional(),
    nofollow: z.boolean().optional(),
    ogTitle: z.string().max(180).optional(),
    ogDescription: z.string().max(320).optional(),
    ogImage: image.optional(),
    twitterTitle: z.string().max(180).optional(),
    twitterDescription: z.string().max(320).optional(),
    twitterImage: image.optional(),
    twitterCard: z.enum(["summary", "summary_large_image"]).optional(),
    breadcrumbTitle: short.optional(),
    includeInSitemap: z.boolean().optional(),
  })
  .passthrough();
const schema = z
  .object({
    type: z
      .enum([
        "WebPage",
        "AboutPage",
        "ContactPage",
        "CollectionPage",
        "Article",
        "BlogPosting",
        "Product",
        "Service",
        "FAQPage",
        "BreadcrumbList",
        "Organization",
        "LocalBusiness",
        "HowTo",
        "VideoObject",
      ])
      .optional(),
    fields: z.record(z.unknown()).optional(),
    customJson: z
      .string()
      .max(30000)
      .refine((v) => {
        if (!v) return true;
        try {
          const data = JSON.parse(v);
          return !!data && typeof data === "object";
        } catch {
          return false;
        }
      }, "Custom JSON-LD must be valid JSON.")
      .optional(),
  })
  .passthrough();
const common = {
    faqSection: faqSchema.optional(),
    seo: seoSchema.optional(),
    schema: schema.optional(),
  },
  list = z.array(rich).max(200),
  refs = z.array(z.string().max(180)).max(200);
const validators = {
  gallery: z
    .object({
      title: short,
      alt: short,
      image: url,
      cover:url.optional(),
      location:short.optional(),
      subtitle:short.optional(),
      description:rich.optional(),
      images:z.array(z.object({id:z.string().optional(),image:url,title:short,alt:short,enabled:z.boolean().default(true),status:z.enum(['draft','published']).default('published'),publishedAt:z.string().refine(v=>!v||Number.isFinite(Date.parse(v)),'Choose a valid date.').optional(),caption:short.optional()}).strip()).max(200).optional(),
      caption: short.optional(),
      blurDataURL: z
        .string()
        .max(3000)
        .refine(isSafeImagePlaceholder, 'Use a raster image blur thumbnail up to 3000 characters.')
        .optional(),
    })
    .strip(),
  blogcategory: z
    .object({ ...common, name: short.min(1), description: rich.optional() })
    .passthrough(),
  page: z
    .object({
      ...common,
      sections: z.record(z.record(z.unknown())).optional(),
      title: short.optional(),
      body: rich.optional(),
    })
    .passthrough(),
  product: z
    .object({
      ...common,
      name: short.min(1),
      model: short,
      desc: rich,
      full_description: rich.optional(),
      imageUrl: image,
      image_alt: short.optional(),
      category_ids: refs.optional(),
      standard_ids: refs.optional(),
      related_ids: refs.optional(),
      features: list,
      maintenance: list,
      applications: list,
      specs: z.record(z.string().max(2000)),
      faqs: z.array(z.object({ q: short, a: rich }).passthrough()).max(100),
      conclusion: rich,
      brochure: url.optional(),
      gallery: z
        .array(
          z.union([
            url,
            z
              .object({ image: image, alt: short, caption: short.optional() })
              .passthrough(),
          ]),
        )
        .max(30)
        .optional(),
      featured: z.boolean().optional(),
      price_on_request: z.boolean().optional(),
    })
    .passthrough(),
  category: z
    .object({
      ...common,
      name: short.min(1),
      key: short,
      description: rich.optional(),
      image: image.optional(),
    })
    .passthrough(),
  application: z
    .object({
      ...common,
      name: short.min(1),
      desc: rich,
      image: image,
      instruments: short,
      tests: rich,
      productsList: refs,
    })
    .passthrough(),
  standard: z
    .object({
      ...common,
      code: short.min(1),
      name: short.min(1),
      country: short,
      image: image,
      desc: rich,
      methods: list,
    })
    .passthrough(),
  client: z
    .object({
      name: short.min(1),
      logo: image,
      image_alt: short.optional(),
      industries: z.array(short).max(100).optional(),
      website: url.optional(),
    })
    .strip(),
  testimonial: z
    .object({
      name: short.min(1),
      quote: rich.min(1),
      role: short,
      company: short,
      rating: z.coerce.number().int().min(1).max(5),
    })
    .strip(),
  service: z
    .object({
      ...common,
      title: short.min(1),
      desc: rich,
      image: image,
      link: url,
      body: rich.optional(),
    })
    .passthrough(),
};
export function validateContentPayload(kind, payload) {
  return validators[kind].parse(payload);
}
