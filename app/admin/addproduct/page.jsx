"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CATEGORIES } from "@/utils";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase/config";

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors"
      >
        <span className="font-semibold text-sm text-foreground">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>
      )}
    </div>
  );
}

function StringList({ items, onChange, placeholder }) {
  const update = (i, val) => {
    const a = [...items];
    a[i] = val;
    onChange(a);
  };
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="text-sm h-9 flex-1"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> Add item
      </button>
    </div>
  );
}

function FAQList({ faqs, onChange }) {
  const update = (i, field, val) => {
    const a = [...faqs];
    a[i] = { ...a[i], [field]: val };
    onChange(a);
  };
  const add = () => onChange([...faqs, { q: "", a: "" }]);
  const remove = (i) => onChange(faqs.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="rounded-xl border border-border p-3 space-y-2 bg-secondary/30"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              FAQ {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <Input
            value={faq.q}
            onChange={(e) => update(i, "q", e.target.value)}
            placeholder="Question"
            className="text-sm h-9"
          />
          <textarea
            value={faq.a}
            onChange={(e) => update(i, "a", e.target.value)}
            placeholder="Answer"
            rows={2}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium"
      >
        <Plus className="w-3.5 h-3.5" /> Add FAQ
      </button>
    </div>
  );
}

function SpecsEditor({ specs, onChange }) {
  const entries = Object.entries(specs);
  const updateKey = (oldKey, newKey) => {
    const obj = {};
    Object.entries(specs).forEach(([k, v]) => {
      obj[k === oldKey ? newKey : k] = v;
    });
    onChange(obj);
  };
  const updateVal = (key, val) => onChange({ ...specs, [key]: val });
  const addRow = () => onChange({ ...specs, "": "" });
  const removeRow = (key) => {
    const obj = { ...specs };
    delete obj[key];
    onChange(obj);
  };
  return (
    <div className="space-y-2">
      {entries.map(([key, val], i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={key}
            onChange={(e) => updateKey(key, e.target.value)}
            placeholder="Spec name"
            className="text-sm h-9 w-2/5"
          />
          <Input
            value={val}
            onChange={(e) => updateVal(key, e.target.value)}
            placeholder="Value"
            className="text-sm h-9 flex-1"
          />
          <button
            type="button"
            onClick={() => removeRow(key)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> Add spec
      </button>
    </div>
  );
}

export default function AddProduct() {
  const formObj = {
    id: "",
    name: "",
    category: "",
    categoryLabel: "",
    model: "",
    image: "",
    imageFile: null,
    desc: "",
    conclusion: "",
    specs: {},
    features: [],
    maintenance: [],
    applications: [],
    faqs: [{ q: "", a: "" }],
  };
  const [formData, setFormData] = useState(formObj);
  const [upload, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const createID = () => {
    const id = formData.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_");

    return id;
  };

  const handleChange = (field, val) =>
    setFormData((f) => ({ ...f, [field]: val }));

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage("Product name is required");
      return false;
    }

    if (!formData.category) {
      setMessage("Category is required");
      return false;
    }

    if (!formData.model.trim()) {
      setMessage("Model number is required");
      return false;
    }

    if (!formData.imageFile) {
      setMessage("Product image is required");
      return false;
    }

    if (!formData.desc.trim()) {
      setMessage("Description is required");
      return false;
    }

    if (!formData.conclusion.trim()) {
      setMessage("Conclusion is required");
      return false;
    }

    // Specs validation
    if (Object.keys(formData.specs).length === 0) {
      setMessage("At least one specification is required");
      return false;
    }

    const invalidSpec = Object.entries(formData.specs).some(
      ([key, value]) => !key.trim() || !value.trim(),
    );

    if (invalidSpec) {
      setMessage("All specification fields are required");
      return false;
    }

    // Features validation
    if (
      formData.features.length === 0 ||
      formData.features.some((item) => !item.trim())
    ) {
      setMessage("All feature fields are required");
      return false;
    }

    // Applications validation
    if (
      formData.applications.length === 0 ||
      formData.applications.some((item) => !item.trim())
    ) {
      setMessage("All application fields are required");
      return false;
    }

    // Maintenance validation
    if (
      formData.maintenance.length === 0 ||
      formData.maintenance.some((item) => !item.trim())
    ) {
      setMessage("All maintenance fields are required");
      return false;
    }

    // FAQ validation
    const invalidFaq = formData.faqs.some(
      (faq) => !faq.q.trim() || !faq.a.trim(),
    );

    if (invalidFaq) {
      setMessage("All FAQ questions and answers are required");
      return false;
    }

    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setIsUploading(true);
      setMessage("Uploading image...");
      // 1. Upload image
      const file = formData.imageFile;
      let imageUrl = "";
      if (file) {
        const imageRef = ref(storage, `products/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(imageRef);
      }

      // 2. Create payload
      const payload = {
        ...formData,
        id: createID(),
        imageUrl,
      };

      // Remove local-only fields
      delete payload.imageFile;
      delete payload.image;

      // 3. Save to Firestore
      await addDoc(collection(db, "products"), payload);
      setFormData(formObj);

      setMessage("Product uploaded successfully.");
      setIsUploading(false);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed.");
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border mt-5 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            Add New Product
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Product Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder=""
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const cat = CATEGORIES.find((c) => c.key === e.target.value);
                  handleChange("category", e.target.value);
                  handleChange("categoryLabel", cat?.label || "");
                }}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Model No.
              </label>
              <Input
                value={formData.model}
                onChange={(e) => handleChange("model", e.target.value)}
                placeholder=""
                className="text-sm h-9"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Product Image
              </label>

              <input
                id="product-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  handleChange("image", URL.createObjectURL(file));
                  handleChange("imageFile", file);
                }}
              />

              <label htmlFor="product-image" className="block cursor-pointer">
                {formData.image ? (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/30 transition-colors">
                    <Plus className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">Click to upload image</p>
                    <p className="text-xs">PNG, JPG, WEBP</p>
                  </div>
                )}
              </label>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Description *
              </label>
              <textarea
                value={formData.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                rows={4}
                placeholder="Product description..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Conclusion
              </label>
              <textarea
                value={formData.conclusion}
                onChange={(e) => handleChange("conclusion", e.target.value)}
                rows={3}
                placeholder="Conclusion text..."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
        </Section>

        {/* Specifications */}
        <Section title="Technical Specifications">
          <SpecsEditor
            specs={formData.specs}
            onChange={(val) => handleChange("specs", val)}
          />
        </Section>

        {/* Features */}
        <Section title="Key Features">
          <StringList
            items={formData.features}
            onChange={(val) => handleChange("features", val)}
            placeholder="Enter a feature..."
          />
        </Section>

        {/* Applications */}
        <Section title="Applications">
          <StringList
            items={formData.applications}
            onChange={(val) => handleChange("applications", val)}
            placeholder="Enter an application..."
          />
        </Section>

        {/* Maintenance */}
        <Section title="Maintenance Tips" defaultOpen={false}>
          <StringList
            items={formData.maintenance}
            onChange={(val) => handleChange("maintenance", val)}
            placeholder="Enter a maintenance tip..."
          />
        </Section>

        {/* FAQs */}
        <Section title="FAQs" defaultOpen={false}>
          <FAQList
            faqs={formData.faqs}
            onChange={(val) => handleChange("faqs", val)}
          />
        </Section>

        {/* JSON Preview */}
        <Section title="JSON Preview" defaultOpen={false}>
          <pre className="text-[11px] font-mono bg-secondary/60 rounded-xl p-4 overflow-x-auto text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </Section>

        <div className="flex justify-end pb-8">
          <Button
            onClick={!upload ?  handleUpload : undefined}
            size="lg"
            className="gap-2 font-semibold px-8"
          >
            <Save className="w-4 h-4" />
            {upload ? "Upload in Progress" : "Save Product"}
          </Button>
        </div>
        {message && (
          <p className="text-sm text-red-500 text-center">{message}</p>
        )}
      </div>
    </div>
  );
}
