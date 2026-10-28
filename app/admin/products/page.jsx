"use client";

import React, { useEffect, useState } from "react";
import { useQuote } from "@/lib/QuoteContext";
import PageHeader from "@/components/shared/PageHeader";
import { Search, ArrowRight, X, Trash, Pen, LogOut, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import products_1 from "@assets/Unsplash/products-1.jpg";
import products_1_1 from "@assets/Unsplash/products-1.jpg";
import products_1_2 from "@assets/Unsplash/products-1.jpg";
// import products from "./products";
import Link from "next/link";
import { CATEGORIES } from "@/utils";
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

const Categories = [{ key: "all", label: "All Products" }, ...CATEGORIES];

export default function ProductsPage() {
  const { openQuote } = useQuote();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [isDeleteLoader, setDeleteLoader] = useState(false);
  const router = useRouter();

  const filtered = products.filter((p) => {
    const matchCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProductById = async (product) => {
    console.log("Deleting:", product?.id);
    try {
      setDeleteLoader(true);
      if (product.imageUrl) {
        const imageRef = ref(storage, product.imageUrl);
        await deleteObject(imageRef);
      }
      const q = query(
        collection(db, "products"),
        where("id", "==", product.id),
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(docSnap.ref);
      });
      console.log("Product deleted successfully");
      setDeleteLoader(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      setDeleteLoader(false);
    }
  };
  const handleLogout = () => {
    // Remove localStorage data
    localStorage.removeItem("admin");
    // Delete cookie immediately
    document.cookie = "admin=; path=/; max-age=0";
    // Redirect to login page
    router.push("/login");
  };

  return (
    <>
    <header className="relative z-10 bg-[#0a0f1e] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-white font-semibold text-sm">Admin Portal</span>
          <span className="text-white/20 text-xs ml-1">· Pakmo Testing Instrument</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white hover:text-red-400 transition-colors border border-white/10 rounded-lg px-3 py-1.5">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>
      <PageHeader
        title="Our Products"
        subtitle="200+ precision testing instruments for diverse industrial applications."
        breadcrumbs={[{ label: "Admin", path: '/admin' }, { label: "Products" }]}
        image={products_1?.src}
      />

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search instruments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 block">
                    Categories
                  </span>
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
                  {filtered.length} instruments found
                </p>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="group rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{position:'relative', paddingBottom: '40px'}}
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
                        {product.desc}
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
                    <div className="flex gap-3 w-[100%] mt-8 justify-evenly " style={{position:'absolute', bottom:10,}}>
                      <Button
                        onClick={() => setSelectedProduct(product)}
                        className="w-[44%] bg-red-600 hover:bg-red-900 text-primary-foreground h-10 text-sm font-semibold"
                      >
                        Delete <Trash className="w-2 h-4" />
                      </Button>
                      <Link href={"/admin/update/" + product.id} className="w-[44%]">
                        <Button
                          // onClick={""}
                          className="bg-primary w-[100%] text-primary-foreground h-10 text-sm font-semibold"
                        >
                          Update <Pen className="w-4 h-4" />
                        </Button>
                      </Link>
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
              <p className="mt-3 text-sm text-red-400">
                Are you sure you want to delete this product? This action will
                permanently remove the product and its associated image from
                storage. This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-8 justify-evenly">
                <Button
                  onClick={() => {
                    !isDeleteLoader && deleteProductById(selectedProduct);
                  }}
                  className="w-[90%] bg-red-600 hover:bg-red-900 text-primary-foreground h-10 text-sm font-semibold gap-2"
                >
                  {isDeleteLoader ? "Deleting" : "Confirm"}{" "}
                  <Trash className="w-2 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
