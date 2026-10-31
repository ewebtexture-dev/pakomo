import {publicAlbum} from '@/cms/gallery';
import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureCmsSeed,publicCmsSnapshot } from "@/server/bootstrap";
import { listContent } from "@/server/cms";
import { getSettings } from "@/server/settings";
import { faqForPath } from "@/server/cms-seo";
import { activeFaqs, galleryDefaults } from "@/cms/features";
import { apiError } from "@/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request) {
  try {
    ensureCmsSeed();
    const url = new URL(request.url),
      scope = z
        .enum(["faq", "gallery", "social", "snapshot"])
        .parse(url.searchParams.get("scope"));
    let value;
    if(scope==='snapshot')value=publicCmsSnapshot();
    else if (scope === "faq") {
      const path = z
        .string()
        .max(2000)
        .refine((v) => {
          try {
            decodeURIComponent(v);
            return (
              /^\/(?!\/)/.test(v) && !/^\/(admin|api|login|_next)(\/|$)/.test(v)
            );
          } catch {
            return false;
          }
        }, "Choose a public path.")
        .parse(url.searchParams.get("path"));
      const faq = faqForPath(path),
        items = activeFaqs(faq);
      value = items.length
        ? { heading: faq.heading, description: faq.description, items }
        : null;
    } else if (scope === "gallery")
      value = {
        settings: { ...galleryDefaults, ...getSettings("gallery") },
        images: listContent("gallery", true).map((row) => ({
          ...publicAlbum(row.payload),
          _slug:row.slug,
          _cmsId: row.id,
        })),
      };
    else {
      const social = getSettings("social");
      value = {
        shareBlog: Boolean(social.shareBlog),
        items: (social.items || [])
          .filter((item) => item.enabled)
          .map(({ id, platform, url, enabled }) => ({
            id,
            platform,
            url,
            enabled,
          })),
      };
    }
    return NextResponse.json(
      { value },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
