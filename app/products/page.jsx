"use client";


/* cms:2910 */
import {useCmsBlock,useCmsCollection,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React, {useState} from "react";
import { useQuote } from "@/lib/QuoteContext";
import PageHeader from "@/components/shared/PageHeader";
import { Search, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import products_1 from "@assets/Unsplash/products-1.jpg";
import products_1_1 from "@assets/Unsplash/products-1.jpg";
import products_1_2 from "@assets/Unsplash/products-1.jpg";
import Link from "next/link";


import { CATEGORIES } from '@/utils';

const Categories = [{ key: "all", label: "All Products" }, ...CATEGORIES]

const cmsSeed_listing_Categories=Categories;
export default function ProductsPage({initialCategory="all"}) {
  const cms=useCmsBlock("products","listing");
  const Categories=cmsArray(cmsSeed_listing_Categories,cms.items_Categories);

  const { openQuote } = useQuote();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const products=useCmsCollection("product");

  const filtered = products.filter((p) => {
    const matchCategory =
      activeCategory === "all" || (p.category_ids?.includes(activeCategory)||p.category===activeCategory);
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });
  
  

  return (
    <>
      <PageHeader
        title={cms.title_1??"Our Products"}
        subtitle={cms.subtitle_2??"200+ precision testing instruments for diverse industrial applications."}
        breadcrumbs={cmsArray([{ label: "Products" }],cms.list_3)}
        image={cms.image_4??(products_1?.src)}
      />

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={cms.placeholder_5??"Search instruments..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                    {cmsRender(cms.text_6??"Categories")}</span>
                  {Categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        activeCategory === cat.key
                          ? "bg-primary text-primary-foreground rounded-lg"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs text-muted-foreground font-mono">
                  {filtered.length} {cmsRender(cms.text_7??" instruments found")}</p>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="group rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-[4/3] bg-secondary overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-sm">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {cmsRender(product.desc)}
                      </p>
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                        {Object.entries(product.specs)
                          .slice(0, 3)
                          .map(([key, val]) => (
                            <div key={key}>
                              <span className="block text-[11px] font-mono font-semibold text-foreground">
                                {key}
                              </span>
                              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                                {val}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[16/9] bg-secondary relative">
              <img
                src={selectedProduct?.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground">
                {selectedProduct.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {cmsRender(selectedProduct.desc)}
              </p>

              <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-foreground mt-6 mb-3">
                {cmsRender(cms.text_8??"Technical Specifications")}</h4>
              <div className="grid grid-cols-3 gap-4 p-4 bg-secondary border border-border">
                {Object.entries(selectedProduct.specs).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {key}
                    </span>
                    <span className="block text-sm font-mono font-bold text-foreground mt-0.5">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-foreground mt-6 mb-3">
                {cmsRender(cms.text_9??"Features")}</h4>
              <ul className="space-y-1.5">
                {selectedProduct.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1 h-1 bg-primary shrink-0" />
                    {cmsRender(f)}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 mt-8">
                <Button
                  onClick={cms.button_link_1?()=>window.location.assign(cms.button_link_1):openQuote}
                  className="flex-1 bg-primary text-primary-foreground h-10 text-sm font-semibold gap-2"
                >
                  {cmsRender(cms.text_10??"Request Quote ")}<ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                  className="h-10 text-sm"
                >
                  {cmsRender(cms.text_11??"Close")}</Button>
              </div>
              <div>
                <Button className="flex-1 w-full mt-3 bg-primary text-primary-foreground h-10 text-sm font-semibold gap-2">
                  <Link href={"/products/" + (selectedProduct._slug||selectedProduct.id)}>
                    {cmsRender(cms.text_12??"View Full Detail")}{" "}
                  </Link>{" "}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
