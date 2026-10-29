"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import CmsField from "./CmsField";
import SafeImage from "@/components/shared/SafeImage";
export default function GalleryManager() {
  const [records, setRecords] = useState([]),
    [selected, setSelected] = useState([]),
    [progress, setProgress] = useState([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    const r = await fetch("/api/admin/content?kind=gallery"),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    setRecords(d.records);
  }
  useEffect(() => {
    load().catch((e) => setMessage(e.message));
  }, []);
  async function request(url, method, body) {
    const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
      d = await r.json();
    if (!r.ok) throw Error(d.error);
    return d;
  }
  async function upload(files) {
    if (busy) return;
    const list = Array.from(files).slice(0, 30);
    setBusy(true);
    setMessage("");
    setProgress(list.map((f) => ({ name: f.name, percent: 0 })));
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        if (
          !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
            file.type,
          ) ||
          file.size > 5 * 1024 * 1024
        )
          throw Error("Use JPG, PNG, WebP or AVIF up to 5 MB.");
        const body = new FormData();
        body.set("image", file);
        body.set("format", "webp");
        const data = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/admin/uploads");
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable)
              setProgress((p) =>
                p.map((item, n) =>
                  n === i
                    ? {
                        ...item,
                        percent: Math.round((e.loaded / e.total) * 100),
                      }
                    : item,
                ),
              );
          };
          xhr.onload = () => {
            try {
              const d = JSON.parse(xhr.responseText);
              xhr.status === 201 ? resolve(d) : reject(Error(d.error));
            } catch {
              reject(Error("Upload failed."));
            }
          };
          xhr.onerror = () => reject(Error("Network error. Retry this image."));
          xhr.send(body);
        });
        const key = crypto.randomUUID(),
          title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        await request("/api/admin/content", "POST", {
          kind: "gallery",
          key,
          slug: key,
          title,
          status: "draft",
          enabled: true,
          payload: {
            title,
            alt: "",
            image: data.url,
            caption: "",
            blurDataURL: data.blurDataURL,
          },
        });
        setProgress((p) =>
          p.map((item, n) =>
            n === i
              ? {
                  ...item,
                  percent: 100,
                  note: data.warning || "Uploaded. Add alt text, then publish.",
                }
              : item,
          ),
        );
      } catch (e) {
        setProgress((p) =>
          p.map((item, n) => (n === i ? { ...item, error: e.message } : item)),
        );
      }
    }
    await load();
    setBusy(false);
  }
  async function save(record, status) {
    setBusy(true);
    try {
      await request("/api/admin/content/" + record.id, "PUT", {
        ...record,
        title: record.payload.title,
        status,
      });
      setMessage(status === "published" ? "Image published." : "Draft saved.");
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(ids) {
    if (
      !ids.length ||
      !window.confirm("Delete " + ids.length + " gallery item(s)?")
    )
      return;
    setBusy(true);
    try {
      for (const id of ids) await request("/api/admin/content/" + id, "DELETE");
      setSelected([]);
      await load();
      setMessage("Gallery items deleted.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  const update = (id, patch) =>
    setRecords((items) =>
      items.map((r) =>
        r.id === id ? { ...r, payload: { ...r.payload, ...patch } } : r,
      ),
    );
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Gallery</h1>
      <Link href="/admin/settings" className="text-blue-300 block my-3">
        Gallery section settings → Site Settings → gallery
      </Link>
      <div
        className="border-2 border-dashed border-white/30 rounded-xl p-8 my-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        <label className="block">
          Drop images here or select multiple files
          <input
            aria-label="Upload gallery images"
            className="block mt-4"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={busy}
            onChange={(e) => {
              upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <p className="text-sm text-white/60 mt-3">
          Up to 30 images per batch, 5 MB each. Recommended: 1600 × 1200 (4:3),
          at least 640 × 480. Images convert to WebP; the previews show the
          gallery crop. Title and alt text are required to publish.
        </p>
      </div>
      {progress.map((p, i) => (
        <div key={i} className="my-3">
          <span>
            {p.name} — {p.percent}%
          </span>
          <progress className="block w-full" max="100" value={p.percent} />
          <p
            className={p.error ? "text-red-300" : "text-blue-300"}
            role="status"
          >
            {p.error || p.note}
          </p>
        </div>
      ))}
      {message && (
        <p role="status" className="my-4 text-amber-200">
          {message}
        </p>
      )}
      <div className="flex gap-5 my-5">
        <label>
          <input
            type="checkbox"
            checked={records.length > 0 && selected.length === records.length}
            onChange={(e) =>
              setSelected(e.target.checked ? records.map((r) => r.id) : [])
            }
          />{" "}
          Select all
        </label>
        <button
          disabled={busy || !selected.length}
          type="button"
          onClick={() => remove(selected)}
        >
          Delete selected ({selected.length})
        </button>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {records.map((record, index) => (
          <div
            key={record.id}
            className="border border-white/20 rounded-xl p-4 space-y-4 min-w-0"
            draggable
            onDragStart={(e) => {
              if (e.target.closest("input,textarea,button")) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData("text/plain", record.id);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const from = e.dataTransfer.getData("text/plain");
              if (!from || from === record.id) return;
              try {
                await request("/api/admin/content/" + from, "PUT", {
                  action: "reorder",
                  targetId: record.id,
                });
                await load();
              } catch (error) {
                setMessage(error.message);
              }
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={selected.includes(record.id)}
                onChange={(e) =>
                  setSelected((s) =>
                    e.target.checked
                      ? [...s, record.id]
                      : s.filter((id) => id !== record.id),
                  )
                }
              />{" "}
              Image {index + 1} · {record.status} · drag to reorder
            </label>
            <SafeImage
              src={record.payload.image}
              alt={record.payload.alt || "Gallery crop preview"}
              width={800}
              height={600}
              className="w-full aspect-[4/3] object-cover rounded-lg"
            />
            <CmsField
              label="Title *"
              value={record.payload.title}
              onChange={(title) => update(record.id, { title })}
            />
            <CmsField
              label="Alt text *"
              value={record.payload.alt}
              onChange={(alt) => update(record.id, { alt })}
            />
            {!record.payload.alt?.trim() && (
              <p className="text-amber-200 text-sm">
                Add alt text before publishing.
              </p>
            )}
            <CmsField
              label="Caption"
              value={record.payload.caption || ""}
              onChange={(caption) => update(record.id, { caption })}
            />
            <CmsField
              label="Replace image"
              uploadFormat="webp"
              name="image"
              type="image"
              value={record.payload.image}
              onChange={(image) => update(record.id, { image })}
            />
            <label className="block">
              <input
                type="checkbox"
                checked={record.enabled}
                onChange={(e) =>
                  setRecords((rows) =>
                    rows.map((r) =>
                      r.id === record.id
                        ? { ...r, enabled: e.target.checked }
                        : r,
                    ),
                  )
                }
              />{" "}
              Enabled
            </label>
            <div className="flex gap-4 flex-wrap">
              <button
                type="button"
                disabled={busy}
                onClick={() => save(record, "draft")}
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={busy}
                className="text-blue-300"
                onClick={() => save(record, "published")}
              >
                Publish
              </button>
              <button
                type="button"
                disabled={busy}
                className="text-red-300"
                onClick={() => remove([record.id])}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
