"use client";

import React, { useEffect, useState } from "react";
import { useQuote } from "@/lib/QuoteContext";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Home,
  FileText,
  Phone,
  Plus,
  Minus,
  Wrench,
  Delete,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import FAQSection from "./FAQ";
import products from "../products";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "@/firebase/config";
import { ref, deleteObject } from "firebase/storage";

export default function ProductDetail({ params }) {
  const { openQuote } = useQuote();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.details;

  // const product = products.find(
  //     (p) => p.id === productId
  // );
  const [product, setProduct] = useState([]);
  const fetchProduct = async (productId) => {
    const q = query(collection(db, "products"), where("id", "==", productId));

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };
    }

    return null;
  };
  useEffect(() => {
    const loadProduct = async () => {
      const product = await fetchProduct(productId);
      console.log(product, "product");
      setProduct(product);
    };

    loadProduct();
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Product not found</h2>

        <Link href="/products">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative bg-[#0a0f1e] pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={product?.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover opacity-15"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e]/90 via-[#0a0f1e]/75 to-blue-950/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1.5 mb-6 flex-wrap text-xs text-white/40">
            <Link
              href="/"
              className="hover:text-white/70 flex items-center gap-1"
            >
              <Home className="w-3 h-3" />
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-white/70">
              Products
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">{product.name}</span>
          </div>
          <span className="inline-block text-[10px] uppercase tracking-widest text-blue-400 mb-3 border border-blue-400/30 px-2.5 py-1 rounded-full">
            {product.categoryLabel}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {product.name}
          </h1>
          <p className="text-white/55 mt-4 max-w-2xl text-sm">{product.desc}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button onClick={openQuote} className="bg-primary text-white gap-2">
              <FileText className="w-4 h-4" />
              Request a Quote
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white bg-transparent gap-2"
            >
              <a href="tel:+918595362719">
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl overflow-hidden border"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  // className="w-full aspect-[4/3] object-cover"
                  height={"100%"}
                  width={"100%"}
                />
              </motion.div>

              {/* Specs */}
              <div className="rounded-2xl border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b bg-secondary font-bold">
                  Technical Specifications
                </div>

                <div className="divide-y">
                  {Object.entries(product?.specs || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between px-5 py-3">
                      <span>{key}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/products"
                className="flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all products
              </Link>
            </div>

            {/* Right */}
            <div className="lg:col-span-3 space-y-8">
              {/* Features */}
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-bold mb-5">Key Features</h2>

                <ul className="space-y-3">
                  {product.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Maintanance */}
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-bold mb-5">Maintenance Tips</h2>

                <ul className="space-y-3">
                  {product.maintenance?.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Wrench className="w-4 h-4 text-primary mt-1" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Applications */}
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-bold mb-5">Applications</h2>

                <div className="flex flex-wrap gap-2">
                  {product.applications?.map((app, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <h3 className="font-bold">Interested in this instrument?</h3>

                <p className="text-sm mt-2 mb-4">Get a customized quote.</p>

                <div className="flex gap-3 flex-wrap">
                  <Button onClick={openQuote} className="gap-2">
                    <FileText className="w-4 h-4" />
                    Request a Quote
                  </Button>

                  <Button asChild variant="outline">
                    <Link href="/contact">Contact Our Team</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 mt-5">
            <h2 className="text-lg font-bold mb-5">Conclusion</h2>
            <div>{product.conclusion}</div>
          </div>
        </div>
      </section>

      <FAQSection faqs={product.faqs} />
    </>
  );
}
