"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import usePublicContent from "@/components/cms/usePublicContent";
import SafeImage from "@/components/shared/SafeImage";
import {
  useCmsCollection,
  useSiteSettings,
} from "@/components/cms/ContentProvider";
import { galleryDefaults } from "@/cms/features";
export default function GallerySection({ full = false }) {
  const initial = {
    settings: { ...galleryDefaults, ...useSiteSettings("gallery") },
    images: useCmsCollection("gallery"),
  };
  const data = usePublicContent("gallery", initial),
    settings = data.settings,
    all = data.images;
  const [limit, setLimit] = useState(12),
    [active, setActive] = useState(-1),
    dialog = useRef(null),
    trigger = useRef(null);
  const images = full ? all.slice(0, limit) : all.slice(0, settings.homeCount);
  useEffect(() => {
    if (active >= 0) dialog.current?.showModal();
  }, [active]);
  if (!settings.enabled || !all.length)
    return full ? (
      <div className="max-w-7xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold">{settings.heading}</h1>
        <p className="mt-4 text-muted-foreground">
          No gallery images published yet.
        </p>
      </div>
    ) : null;
  const close = () => {
    dialog.current?.close();
    setActive(-1);
    trigger.current?.focus();
  };
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <span className="section-label">{settings.tag}</span>
        {full ? (
          <h1 className="text-3xl sm:text-4xl font-bold mt-2 break-words">
            {settings.heading}
          </h1>
        ) : (
          <h2 className="text-3xl sm:text-4xl font-bold mt-2">
            {settings.heading}
          </h2>
        )}
        <p className="text-muted-foreground mt-3 mb-8">
          {settings.description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((item, i) => (
            <button
              key={item._cmsId}
              type="button"
              className="text-left rounded-xl border border-border overflow-hidden group focus-visible:outline-primary"
              onClick={(e) => {
                trigger.current = e.currentTarget;
                setActive(i);
              }}
            >
              <SafeImage
                src={item.image}
                blurDataURL={item.blurDataURL}
                alt={item.alt}
                width={800}
                height={600}
                className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform"
              />
              <span className="block p-4 font-semibold break-words">
                {item.title}
              </span>
            </button>
          ))}
        </div>
        {full ? (
          limit < all.length && (
            <button
              type="button"
              className="mt-8 px-5 py-3 bg-primary text-white rounded-lg"
              onClick={() => setLimit(limit + 12)}
            >
              Load more
            </button>
          )
        ) : (
          <Link
            href={settings.buttonLink}
            className="inline-block mt-8 text-primary font-semibold"
          >
            {settings.buttonText} →
          </Link>
        )}
      </div>
      <dialog
        ref={dialog}
        className="gallery-lightbox"
        aria-label="Gallery image preview"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            close();
            return;
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            setActive((active + 1) % all.length);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setActive((active - 1 + all.length) % all.length);
          }
        }}
      >
        <div className="flex gap-4 justify-between items-center mb-4">
          <button
            type="button"
            onClick={() => setActive((active - 1 + all.length) % all.length)}
            aria-label="Previous image"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={close}
            aria-label="Close gallery preview"
          >
            Close ×
          </button>
          <button
            type="button"
            onClick={() => setActive((active + 1) % all.length)}
            aria-label="Next image"
          >
            Next →
          </button>
        </div>
        {active >= 0 && all[active] && (
          <>
            <SafeImage
              src={all[active].image}
              alt={all[active].alt}
              loading="eager"
              className="w-full max-h-[75vh] object-contain"
            />
            <p className="mt-3 text-center">{all[active].title}</p>
          </>
        )}
      </dialog>
    </section>
  );
}
