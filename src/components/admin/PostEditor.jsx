"use client";
import {adminFetch as fetch} from './admin-request';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageField from './ImageField';
import FaqEditor from "./FaqEditor";
import RichTextEditor from "./RichTextEditor";
import SeoScoreChecker from "./SeoScoreChecker";
import CmsField from "./CmsField";
import SchemaFields from "./SchemaFields";
import PostRevisions from "./PostRevisions";
import SeoFields, { AdminField, adminInput } from "./SeoFields";

const initial = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "industry_insights",
  author_id: "",
  image_url: "",
  image_alt: "",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  focus_keyword: "",
  meta_keywords: "",
  og_title: "",
  og_description: "",
  og_image: "",
  noindex: false,
  nofollow: false,
  status: "draft",
  extra_seo: {},
  schema: {},
  category_ids: [],
  published_at: "",
  featured_size: "full",
  featured_align: "center",
  featured_caption: "",
};
const categories = [
  ["quality_control", "Quality Control"],
  ["testing_standards", "Testing Standards"],
  ["manufacturing", "Manufacturing"],
  ["industry_insights", "Industry Insights"],
  ["product_updates", "Product Updates"],
];
const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
async function jsonResponse(response) {
  const data = await response.json();
  if (!response.ok) throw Error(data.error || "The request failed.");
  return data;
}

export default function PostEditor({ id }) {
  const [form, setForm] = useState(initial),
    [authors, setAuthors] = useState([]),
    [blogCategories, setBlogCategories] = useState([]),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState("");
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [saving, setSaving] = useState(false),
    [uploading, setUploading] = useState(false),
    [editorBusy, setEditorBusy] = useState(false),
    [slugTouched, setSlugTouched] = useState(Boolean(id)),
    [origin, setOrigin] = useState("");
  const router = useRouter();
  useEffect(() => {
    setOrigin(window.location.origin);
    const controller = new AbortController();
    async function load() {
      try {
        const [authorData, postData, categoryData] = await Promise.all([
          fetch("/api/admin/authors", {
            signal: controller.signal,
            cache: "no-store",
          }).then(jsonResponse),
          id
            ? fetch("/api/admin/posts/" + id, {
                signal: controller.signal,
                cache: "no-store",
              }).then(jsonResponse)
            : Promise.resolve(null),
          fetch("/api/admin/content?kind=blogcategory",{signal:controller.signal,cache:"no-store"}).then(jsonResponse),
        ]);
        setAuthors(authorData.authors);
        setBlogCategories(categoryData.records||[]);
        const next = {
          ...initial,
          published_at: new Date().toISOString(),
          ...(postData?.post || {}),
        };
        if(!(categoryData.records||[]).some(c=>c.key===next.category)){next.category=categoryData.records?.[0]?.key||"";next.category_ids=next.category?[next.category]:[];}
        if (!next.author_id)
          next.author_id =
            (
              authorData.authors.find(
                (author) => author.active && author.name === "PAKMOO",
              ) || authorData.authors.find((author) => author.active)
            )?.id || "";
        next.category_ids = next.category_ids?.length
          ? next.category_ids
          : [next.category];
        setForm(next);
      } catch (e) {
        if (e.name !== "AbortError") setLoadError(e.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [id]);
  const set = (key, value) => {
    setNotice("");
    setForm((previous) => ({
      ...previous,
      [key]: value,
      ...(key === "category_ids" && value.length ? { category: value[0] } : {}),
    }));
  };
  async function refreshAuthors() {
    setError("");
    try {
      setAuthors(
        (
          await fetch("/api/admin/authors", { cache: "no-store" }).then(
            jsonResponse,
          )
        ).authors,
      );
    } catch (e) {
      setError(e.message);
    }
  }
  async function upload(event, key = "image_url") {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      if (file.size > 5 * 1024 * 1024)
        throw Error("Choose an image no larger than 5 MB.");
      const payload = new FormData();
      payload.set("image", file);
      const data = await fetch("/api/admin/uploads", {
        method: "POST",
        body: payload,
      }).then(jsonResponse);
      set(key, data.url);
      if (data.warning) setNotice(data.warning);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  async function save(status) {
    if (saving || uploading || editorBusy) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const data = await fetch("/api/admin/posts" + (id ? "/" + id : ""), {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      }).then(jsonResponse);
      setForm({ ...initial, ...data.post });
      setNotice(
        status === "published"
          ? Date.parse(data.post.published_at) > Date.now()
            ? "Article scheduled for " +
              new Date(data.post.published_at).toLocaleString()
            : "Article published. It is now visible on the blog."
          : "Draft saved. It is private until you publish it.",
      );
      if (!id) router.replace("/admin/blogs/" + data.post.id);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  const field = (key, label, maxLength, placeholder = "", required = false) => (
    <AdminField
      key={key}
      id={key}
      label={label}
      value={form[key]}
      onChange={(value) => set(key, value)}
      maxLength={maxLength}
      placeholder={placeholder}
      required={required}
    />
  );
  const selectedAuthor = authors.find((author) => author.id === form.author_id);
  if (loading)
    return (
      <div className="bg-[#0a0f1e] text-white/60 p-12 min-h-screen">
        Loading article…
      </div>
    );
  if (loadError)
    return (
      <div className="bg-[#0a0f1e] text-white p-12 min-h-screen">
        <p role="alert" className="text-red-300">
          {loadError}
        </p>
        <Link href="/admin/blogs" className="text-blue-300 block mt-5">
          Back to blog posts
        </Link>
      </div>
    );
  return (
    <section className="min-h-screen bg-[#0a0f1e] text-white px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-5 text-sm text-blue-300">
          <Link href="/admin/blogs">← All blog posts</Link>
          <Link href="/admin/authors" target="_blank">
            Manage authors ↗
          </Link>
        </div>
        <div className="flex flex-wrap justify-between gap-4 items-center my-7">
          <div>
            <h1 className="text-3xl font-bold">
              {id ? "Edit article" : "New article"}
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Write visually, assign an author, and publish with search-friendly
              metadata.
            </p>
          </div>
          {id && (
            <Link
              href={"/admin/preview/" + id}
              target="_blank"
              className="border border-white/20 rounded-lg px-4 py-2 text-sm"
            >
              Preview saved article ↗
            </Link>
          )}
        </div>
        {error && (
          <p
            role="alert"
            className="mb-5 border border-red-500/30 bg-red-500/10 text-red-200 rounded-lg p-4 text-sm"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mb-5 border border-green-500/30 bg-green-500/10 text-green-200 rounded-lg p-4 text-sm"
          >
            {notice}
          </p>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save("published");
          }}
          className="space-y-6"
        >
          <section
            className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-7 space-y-5"
            aria-labelledby="article-heading"
          >
            <h2 id="article-heading" className="font-semibold">
              Article details
            </h2>
            <AdminField
              id="title"
              label="Article title"
              required
              maxLength={180}
              value={form.title}
              placeholder="Your article title"
              onChange={(title) => {
                setNotice("");
                setForm((previous) => ({
                  ...previous,
                  title,
                  ...(!slugTouched ? { slug: slugify(title) } : {}),
                }));
              }}
            />
            <AdminField
              id="slug"
              label="URL slug"
              required
              maxLength={160}
              value={form.slug}
              placeholder="your-article-title"
              onChange={(slug) => {
                setSlugTouched(true);
                set("slug", slugify(slug));
              }}
              help={
                "/blog/" +
                (form.slug || "your-article-title") +
                (id
                  ? " · Old URLs redirect automatically when the slug changes."
                  : "")
              }
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="author_id"
                  className="block space-y-2 text-xs text-white/70"
                >
                  <span>Author *</span>
                  <select
                    id="author_id"
                    name="author_id"
                    required
                    value={form.author_id || ""}
                    onChange={(event) => set("author_id", event.target.value)}
                    className={adminInput}
                  >
                    <option value="" className="bg-slate-900">
                      Select an author
                    </option>
                    {authors
                      .filter(
                        (author) =>
                          author.active || author.id === form.author_id,
                      )
                      .map((author) => (
                        <option
                          className="bg-slate-900"
                          key={author.id}
                          value={author.id}
                        >
                          {author.name}
                          {author.active
                            ? ""
                            : " (inactive — existing assignment)"}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="text-xs text-blue-300 flex flex-wrap gap-4 mt-2">
                  <Link href="/admin/authors/new" target="_blank">
                    + Create author ↗
                  </Link>
                  <button type="button" onClick={refreshAuthors}>
                    Refresh author list
                  </button>
                </div>
                {selectedAuthor?.job_title && (
                  <p className="text-xs text-white/40 mt-2">
                    {selectedAuthor.job_title}
                  </p>
                )}
              </div>
              <label
                htmlFor="category"
                className="block space-y-2 text-xs text-white/70"
              >
                <span>Category</span>
                <select
                  id="category"
                  value={form.category}
                  onChange={(event) => {
                    set("category", event.target.value);
                    set("category_ids", [event.target.value]);
                  }}
                  className={adminInput}
                >
                  {blogCategories.map((c) => [c.key,c.payload.name]).map(([key, label]) => (
                    <option className="bg-slate-900" key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset className="space-y-3">
              <legend>Additional blog categories</legend>
              <Link
                href="/admin/catalog/blog-categories"
                target="_blank"
                className="text-blue-300 text-sm"
              >
                Manage categories →
              </Link>
              <div className="flex flex-wrap gap-4">
                {blogCategories.map((c) => (
                  <label key={c.key}>
                    <input
                      type="checkbox"
                      checked={(form.category_ids || []).includes(c.key)}
                      onChange={(e) =>
                        set(
                          "category_ids",
                          e.target.checked
                            ? [
                                ...new Set([
                                  ...(form.category_ids || []),
                                  c.key,
                                ]),
                              ]
                            : (form.category_ids || []).filter(
                                (k) => k !== c.key,
                              ),
                        )
                      }
                    />{" "}
                    {c.payload.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              Publish date and time
              <input
                id="published_at"
                type="datetime-local"
                className={adminInput}
                value={
                  form.published_at
                    ? new Date(
                        Date.parse(form.published_at) -
                          new Date(form.published_at).getTimezoneOffset() *
                            60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  set(
                    "published_at",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  )
                }
              />
              <small>
                Times use your browser timezone. Future articles stay private
                until this time.
              </small>
            </label>
            <label
              htmlFor="excerpt"
              className="block space-y-2 text-xs text-white/70"
            >
              <span>Excerpt / short description *</span>
              <textarea
                id="excerpt"
                className={adminInput}
                rows={3}
                value={form.excerpt}
                maxLength={500}
                onChange={(event) => set("excerpt", event.target.value)}
                placeholder="A clear summary for your blog cards and search results."
              />
            </label>
            <RichTextEditor
              autoImageSize
              value={form.content}
              onChange={(content) => set("content", content)}
              disabled={saving || uploading}
              onBusyChange={setEditorBusy}
            />
          </section>
          <section
            className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-7 space-y-5"
            aria-labelledby="featured-heading"
          >
            <h2 id="featured-heading" className="font-semibold">
              Featured image
            </h2>
            <ImageField label="Featured image" value={form.image_url} onChange={v=>set('image_url',v)} alt={form.image_alt} onAltChange={v=>set('image_alt',v)} onBusyChange={setUploading} recommended="1920 × 1080 (16:9)."/>
          </section>
          <section className="border border-white/15 rounded-xl p-5 space-y-4">
            <h2>Featured image display</h2>
            {field("featured_caption", "Caption", 1000)}
            <div className="featured-preview w-full max-w-full">
              <img
                src={form.image_url || "/image-placeholder.svg"}
                alt={form.image_alt || "Crop preview"}
                width={1920} height={1080} className="w-full h-auto max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-white/50">
              Recommended: 1920 × 1080 (16:9), up to 5 MB. Featured images scale
              responsively without cropping. Content images use their natural size
              and scale down to fit the article.
            </p>
          </section>
          <FaqEditor
            value={form.faqSection}
            onChange={(value) => set("faqSection", value)}
          />
          <SeoFields
            form={form}
            set={set}
            origin={origin}
            onImageUpload={(event) => upload(event, "og_image")}
            uploading={uploading || saving}
          />
          <SeoScoreChecker
            title={form.meta_title || form.title}
            metaDescription={form.meta_description || form.excerpt}
            slug={form.slug}
            focusKeyword={form.focus_keyword}
            contentHtml={form.content}
            images={[{ alt: form.image_alt }]}
            isBlog
          />
          <details className="border border-white/15 rounded-xl p-5">
            <summary>Additional SEO fields</summary>
            <div className="mt-5 space-y-4">
              {[
                "relatedKeywords",
                "twitterTitle",
                "twitterDescription",
                "twitterImage",
                "breadcrumbTitle",
                "twitterCard",
              ].map((key) => (
                <CmsField
                  key={key}
                  name={key}
                  label={key.replace(/([A-Z])/g, " $1")}
                  value={form.extra_seo?.[key] || ""}
                  onChange={(value) =>
                    set("extra_seo", { ...form.extra_seo, [key]: value })
                  }
                />
              ))}
            </div>
          </details>
          <SchemaFields
            value={form.schema || {}}
            onChange={(value) => set("schema", value)}
          />
          {id && <PostRevisions id={id} />}
          <div className="flex flex-wrap gap-3 items-center pb-5">
            <button
              type="button"
              onClick={() => save("draft")}
              disabled={saving || uploading || editorBusy}
              className="px-5 py-3 rounded-lg border border-white/20 text-sm disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="submit"
              disabled={saving || uploading || editorBusy}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : form.status === "published"
                  ? "Update published article"
                  : "Publish article"}
            </button>
            <Link href="/admin/blogs" className="text-sm text-white/50 px-3">
              Back to posts
            </Link>
            {editorBusy && (
              <p className="w-full text-xs text-amber-200">
                Finish uploading or apply HTML source changes before saving.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
