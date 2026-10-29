import { z } from "zod";
export const FAQ_HEADING = "Frequently Asked Questions (FAQ's)";
export const faqSchema = z.object({
  heading: z.string().max(250).default(FAQ_HEADING),
  description: z.string().max(1000).default(""),
  items: z
    .array(
      z.object({
        id: z.string().max(100).optional(),
        q: z.string().trim().min(1).max(500),
        a: z.string().trim().min(1).max(50000),
        enabled: z.boolean().default(true),
      }),
    )
    .max(100),
});
export const socialPlatforms = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "YouTube",
  "X/Twitter",
  "WhatsApp",
  "Pinterest",
  "Other",
];
export const socialSchema = z.object({
  shareBlog: z.boolean().default(false),
  items: z
    .array(
      z.object({
        id: z.string().max(100),
        platform: z.enum(socialPlatforms),
        url: z
          .string()
          .url()
          .max(2000)
          .refine((v) => v.startsWith("https://"), "Use HTTPS"),
        enabled: z.boolean(),
      }),
    )
    .max(30),
});
export const gallerySettingsSchema = z.object({
  enabled: z.boolean(),
  tag: z.string().max(100),
  heading: z.string().max(250),
  description: z.string().max(1000),
  homeCount: z.coerce.number().int().min(1).max(60),
  buttonText: z.string().max(100),
  buttonLink: z
    .string()
    .max(2000)
    .refine(
      (v) => /^\/(?!\/)/.test(v) || /^https:\/\//.test(v),
      "Use an internal path or HTTPS URL",
    ),
});
export const galleryDefaults = {
  enabled: true,
  tag: "Our Gallery",
  heading: "Gallery",
  description: "A closer look at our instruments and expertise.",
  homeCount: 6,
  buttonText: "View all",
  buttonLink: "/gallery",
};
export const activeFaqs = (value) =>
  (value?.items || []).filter(
    (item) =>
      item.enabled !== false &&
      item.q?.trim() &&
      item.a?.replace(/<[^>]*>/g, "").trim(),
  );

export function faqPlainText(value = "") {
  const entities = {
    nbsp: " ",
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
  };
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(
      /&(nbsp|amp|quot|apos|lt|gt);/gi,
      (_, key) => entities[key.toLowerCase()],
    )
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) => {
      const point =
        code[0].toLowerCase() === "x"
          ? parseInt(code.slice(1), 16)
          : Number(code);
      return point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}
