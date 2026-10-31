"use client";
import {adminFetch as fetch} from './admin-request';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageContentForm from "./PageContentForm";
import CollectionContentForm from "./CollectionContentForm";
import CmsField from "./CmsField";
import { collectionDefinitions } from "@/cms/collection-definitions";
import FaqEditor from "./FaqEditor";
import SeoPanel from "./SeoPanel";
import SchemaFields from "./SchemaFields";
import {notify} from './ActionButtons';
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export default function ContentEditor({ id, kind, base }) {
  const router = useRouter(),
    [record, setRecord] = useState(null),
    [revisions, setRevisions] = useState([]),
    [relations, setRelations] = useState({}),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),[fieldErrors,setFieldErrors]=useState({});
  async function load() {
    if (id === "new") {
      setRecord({
        kind,
        key: "",
        title: "",
        slug: "",
        status: "draft",
        enabled: true,
        payload: structuredClone(collectionDefinitions[kind].defaults),
      });
      return;
    }
    const r = await fetch("/api/admin/content/" + id),
      data = await r.json();
    if (!r.ok) {
      setMessage(data.error);
      return;
    }
    setRecord(data.record);
    setRevisions(data.revisions);
    setDirty(false);
  }
  useEffect(() => {
    load();
    Promise.all(
      ["category", "standard", "product"].map(async (k) => {
        const r = await fetch("/api/admin/content?kind=" + k);
        const d = await r.json();
        return [
          k,
          (d.records || []).map((row) => ({
            id: k === "category" ? row.key : row.key,
            label: row.title,
          })),
        ];
      }),
    ).then((rows) =>
      setRelations({
        category_ids: rows[0][1],
        standard_ids: rows[1][1],
        related_ids: rows[2][1],
        productsList: rows[2][1],
      }),
    );
  }, [id, kind]);
  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const update = (patch) => {
    setRecord((r) => ({ ...r, ...patch }));
    setDirty(true);
  };
  async function save(status) {
    setBusy(true);
    setMessage("");
    setFieldErrors({});
    try {
      const r = await fetch(
          "/api/admin/content" + (id === "new" ? "" : "/" + id),
          {
            method: id === "new" ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...record,
              status,
              key: record.key || record.slug,
            }),
          },
        ),
        d = await r.json();
      if (!r.ok) {setFieldErrors(d.fieldErrors||{});throw Error(d.error);}
      setRecord(d.record);
      setDirty(false);
      notify(status==='published'?'Published. Public content updated.':'Draft saved. Click Publish to update the website.');
      window.dispatchEvent(new Event('cms:updated'));
      router.refresh();
      setMessage(
        status === "published"
          ? "Published. Public content updated."
          : "Draft saved. Published content is unchanged.",
      );
      if (id === "new") router.replace(base + "/" + d.record.id);
      else {
        const rev = await (await fetch("/api/admin/content/" + id)).json();
        setRevisions(rev.revisions || []);
      }
    } catch (e) {
      setMessage(e.message);
      notify(e.message,true);
    } finally {
      setBusy(false);
    }
  }
  async function action(body) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/content/" + id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setRecord(d.record);
      setDirty(false);
      setMessage(
        body.action === "restore"
          ? "Revision restored as a draft."
          : "Content unpublished.",
      );
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!record)
    return <div className="p-8">{message || "Loading content…"}</div>;
  const payload = record.payload;
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <Link href={base} className="text-blue-300 text-sm">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mt-4">
        {id === "new" ? "Create " + kind : record.title}
      </h1>
      <p className="text-xs text-white/50 mt-2">
        {record.updated_at &&
          "Updated " + new Date(record.updated_at).toLocaleString()}{" "}
        {record.updated_by && " · Admin #" + record.updated_by}
        {dirty ? " · Unsaved changes" : ""}
      </p>
      <form
        className="space-y-6 mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          save("published");
        }}
      >
        {Object.keys(fieldErrors).length>0&&<div role="alert" className="border border-red-400 p-4 rounded-lg"><p>Please correct these fields:</p>{Object.entries(fieldErrors).map(([field,error])=><p key={field} className="text-red-300" data-field-error={field}>{field}: {error}</p>)}</div>}
        <CmsField
          label="Admin title / name"
          value={record.title}
          required
          onChange={(title) =>
            update({ title, ...(!record.key ? { slug: slugify(title) } : {}) })
          }
        />
        {kind !== "page" && (
          <CmsField
            label="URL slug"
            value={record.slug}
            required
            onChange={(slug) => update({ slug })}
          />
        )}
        <CmsField
          label="Enabled"
          value={record.enabled}
          onChange={(enabled) => update({ enabled })}
        />
        {kind === "page" ? (
          <PageContentForm
            record={record}
            onChange={(payload) => update({ payload })}
          />
        ) : (
          <CollectionContentForm
            record={record}
            relations={relations}
            onChange={(payload) => update({ payload })}
          />
        )}
        {record.key !== "global" &&
          !["gallery", "testimonial", "client", "standard"].includes(kind) && (
            <FaqEditor
              value={payload.faqSection}
              legacy={payload.faqs}
              onChange={(faqSection) =>
                update({ payload: { ...payload, faqSection } })
              }
            />
          )}
        {!["gallery", "testimonial", "client"].includes(kind) && (
          <>
            <SeoPanel
              value={payload.seo || {}}
              onChange={(seo) => update({ payload: { ...payload, seo } })}
              title={record.title}
              slug={record.slug}
              content={JSON.stringify(payload)}
              images={[
                { alt: payload.image_alt || "", url: payload.imageUrl || "" },
              ]}
            />
            <SchemaFields
              value={payload.schema || {}}
              onChange={(schema) => update({ payload: { ...payload, schema } })}
            />
          </>
        )}
        {message && (
          <p
            role="status"
            className="p-4 border border-amber-300/30 text-amber-100 rounded-lg"
          >
            {message}
          </p>
        )}
        <div className="sticky bottom-0 bg-[#0a0f1e] border-t border-white/20 py-4 flex gap-3 flex-wrap">
          <button
            disabled={busy}
            type="button"
            onClick={() => save("draft")}
            className="px-5 py-3 border border-white/30 rounded-lg"
          >
            Save draft (private)
          </button>
          <button
            disabled={busy}
            type="submit"
            className="px-5 py-3 bg-blue-600 rounded-lg"
          >
            {busy ? "Saving…" : "Publish"}
          </button>
          {id !== "new" && (
            <button
              disabled={busy}
              type="button"
              onClick={() => action({ action: "unpublish" })}
            >
              Unpublish
            </button>
          )}
        </div>
      </form>
      {revisions.length > 0 && (
        <details className="border border-white/20 rounded-lg p-4 mt-6">
          <summary>Revision history (last 10)</summary>
          {revisions.map((rev) => (
            <div
              key={rev.id}
              className="flex gap-4 justify-between py-3 text-sm"
            >
              <span>
                {new Date(rev.created_at).toLocaleString()} · Admin #
                {rev.actor_id}
              </span>
              <button
                disabled={busy}
                onClick={() =>
                  action({ action: "restore", revisionId: rev.id })
                }
                className="text-blue-300"
              >
                Restore as draft
              </button>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
