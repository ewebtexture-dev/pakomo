"use client";
import { usePathname } from "next/navigation";
import usePublicContent from "@/components/cms/usePublicContent";
import { useEffect, useState } from "react";
import { useSiteSettings } from "@/components/cms/ContentProvider";
const icons = {
  Facebook: "fa-facebook",
  Instagram: "fa-instagram",
  LinkedIn: "fa-linkedin",
  YouTube: "fa-youtube-play",
  "X/Twitter": "fa-twitter",
  WhatsApp: "fa-whatsapp",
  Pinterest: "fa-pinterest-p",
  Other: "fa-link",
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
        const icon = icons[item.platform] || icons.Other;
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
            <i className={"fa fa-fw " + icon} aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
