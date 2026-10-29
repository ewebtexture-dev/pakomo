"use client";
import { usePathname } from "next/navigation";
import usePublicContent from "@/components/cms/usePublicContent";
import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";
import { useSiteSettings } from "@/components/cms/ContentProvider";
const icons = {
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  "X/Twitter": Twitter,
  WhatsApp: MessageCircle,
  Pinterest: LinkIcon,
  Other: LinkIcon,
};
export default function SocialLinks({ share = false, title = "" }) {
  const initial = useSiteSettings("social"),
    settings = usePublicContent("social", initial),
    path = usePathname();
  const [currentUrl, setCurrentUrl] = useState("");
  useEffect(() => setCurrentUrl(window.location.href), [path]);
  if (share && !settings.shareBlog) return null;
  const items = (settings.items || []).filter((i) => i.enabled && i.url);
  if (!items.length) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-3 my-5"
      aria-label={share ? "Share article" : "Social media"}
    >
      {items.map((item) => {
        const Icon = icons[item.platform] || LinkIcon;
        let href = item.url;
        if (share && currentUrl) {
          const url = encodeURIComponent(currentUrl),
            text = encodeURIComponent(title);
          href =
            {
              Facebook: "https://www.facebook.com/sharer/sharer.php?u=" + url,
              "X/Twitter":
                "https://twitter.com/intent/tweet?url=" + url + "&text=" + text,
              LinkedIn:
                "https://www.linkedin.com/sharing/share-offsite/?url=" + url,
              WhatsApp: "https://wa.me/?text=" + text + "%20" + url,
              Pinterest:
                "https://pinterest.com/pin/create/button/?url=" +
                url +
                "&description=" +
                text,
            }[item.platform] || item.url;
        }
        return (
          <a
            key={item.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              (share ? "Share or follow on " : "Follow on ") + item.platform
            }
            className="w-8 h-8 flex items-center justify-center border border-current/20 rounded hover:text-primary focus-visible:outline-primary"
          >
            <Icon className="w-4 h-4" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
