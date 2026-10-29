"use client";


/* cms:2910 */
import {useSiteSettings,useCmsBlock,useCmsCollection,cmsRender} from '@/components/cms/ContentProvider';
import React, {useState} from "react";
import { useQuote } from "@/lib/QuoteContext";
import {ArrowLeft,CheckCircle2,ChevronRight,Home,FileText,Phone,Wrench} from "lucide-react";
import { Button } from "@/components/ui/button";
import {motion} from "framer-motion";
import Link from "next/link";
import FAQSection from "./FAQ";
import products from "../products";




export default function ProductDetail({ params }) {
  const cms=useCmsBlock("product-template","detail");
  const contact=useSiteSettings("contact");
  

  const { openQuote } = useQuote();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.details;

  // const product = products.find(
  //     (p) => p.id === productId
  // );
  const catalog=useCmsCollection("product");
  const [galleryImage,setGalleryImage]=useState('');
  const product=catalog.find(p=>p.id===productId||p._slug===productId)||null;
  
  

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">{cmsRender(cms.text_1??"Product not found")}</h2>

        <Link href={cms.href_2??"/products"}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {cmsRender(cms.text_3??"Back to Products")}</Button>
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
              href={cms.href_4??"/"}
              className="hover:text-white/70 flex items-center gap-1"
            >
              <Home className="w-3 h-3" />
              {cmsRender(cms.text_5??"Home")}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={cms.href_6??"/products"} className="hover:text-white/70">
              {cmsRender(cms.text_7??"Products")}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70">{product.name}</span>
          </div>
          <span className="inline-block text-[10px] uppercase tracking-widest text-blue-400 mb-3 border border-blue-400/30 px-2.5 py-1 rounded-full">
            {product.categoryLabel}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            {product.name}
          </h1>
          <p className="text-white/55 mt-4 max-w-2xl text-sm">{cmsRender(product.full_description||product.desc)}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button onClick={()=>openQuote(product.quote_prefill||product.name)} className="bg-primary text-white gap-2">
              <FileText className="w-4 h-4" />
              {cmsRender(cms.text_8??"Request a Quote")}</Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white bg-transparent gap-2"
            >
              <a href={"tel:"+(contact.phones?.[0]?.number||"+918595362719")}>
                <Phone className="w-4 h-4" />
                {cmsRender(cms.text_10??"Call Us")}</a>
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
                  src={galleryImage||product.imageUrl}
                  alt={product.name}
                  // className="w-full aspect-[4/3] object-cover"
                  height={"100%"}
                  width={"100%"}
                />
              </motion.div>

              {product.gallery?.length>0&&<div className="flex gap-2 flex-wrap">{product.gallery.map((entry,index)=>{const image=typeof entry==='string'?entry:entry.image?.src||entry.image;return <button key={index} type="button" onClick={()=>setGalleryImage(image)}><img src={image} alt={entry.alt||product.name} className="h-16 w-20 object-contain border rounded-lg"/></button>;})}</div>}
              {product.brochure&&<a href={product.brochure} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-primary"><FileText className="w-4 h-4"/>Download brochure (PDF)</a>}
              {/* Specs */}
              <div className="rounded-2xl border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b bg-secondary font-bold">
                  {cmsRender(cms.text_11??"Technical Specifications")}</div>

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
                href={cms.href_12??"/products"}
                className="flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                {cmsRender(cms.text_13??"Back to all products")}</Link>
            </div>

            {/* Right */}
            <div className="lg:col-span-3 space-y-8">
              {/* Features */}
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-bold mb-5">{cmsRender(cms.text_14??"Key Features")}</h2>

                <ul className="space-y-3">
                  {product.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
                      <span>{cmsRender(f)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Maintanance */}
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-bold mb-5">{cmsRender(cms.text_15??"Maintenance Tips")}</h2>

                <ul className="space-y-3">
                  {product.maintenance?.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Wrench className="w-4 h-4 text-primary mt-1" />
                      <span>{cmsRender(f)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Applications */}
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="text-lg font-bold mb-5">{cmsRender(cms.text_16??"Applications")}</h2>

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
                <h3 className="font-bold">{cmsRender(cms.text_17??"Interested in this instrument?")}</h3>

                <p className="text-sm mt-2 mb-4">{cmsRender(cms.text_18??"Get a customized quote.")}</p>

                <div className="flex gap-3 flex-wrap">
                  <Button onClick={()=>openQuote(product.quote_prefill||product.name)} className="gap-2">
                    <FileText className="w-4 h-4" />
                    {cmsRender(cms.text_19??"Request a Quote")}</Button>

                  <Button asChild variant="outline">
                    <Link href={cms.href_20??"/contact"}>{cmsRender(cms.text_21??"Contact Our Team")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 mt-5">
            <h2 className="text-lg font-bold mb-5">{cmsRender(cms.text_22??"Conclusion")}</h2>
            <div>{cmsRender(product.conclusion)}</div>
          </div>
        </div>
      </section>

      <FAQSection faqs={product.faqs} />
    </>
  );
}
