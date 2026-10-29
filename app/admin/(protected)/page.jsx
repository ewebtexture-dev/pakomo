"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import {BookOpen} from "lucide-react";
import { PlusCircle, RefreshCw, LogOut, UserCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from "next/navigation";


export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session').then(async response=>{
      if(!response.ok) { router.push('/login'); return; }
      setAdmin((await response.json()).admin);
    }).catch(()=>router.push('/login'));
  }, []);

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout',{method:'POST'});
    if(!response.ok)return;
    router.push("/login");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(59,130,246,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Top bar */}
      <header className="relative z-10 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-white font-semibold text-sm">Admin Portal</span>
          <span className="text-white/20 text-xs ml-1">· Pakmo Testing Instrument</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm border border-white/10 rounded-lg px-3 py-1.5">
            <UserCircle className="w-4 h-4 text-primary" />
            <span className="text-white font-medium">{admin.name}</span>
            <span className="text-white/30 text-xs">{admin.email}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors border border-white/10 rounded-lg px-3 py-1.5">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-12">
          <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-primary border border-primary/30 rounded-full px-3 py-1 mb-4">Dashboard</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">What would you like to do?</h1>
          <p className="text-white/40 text-sm mt-2">Manage your catalog and publish SEO-friendly blog articles.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-3xl">
          {/* grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-3xl */}
          {/* Add Product */}
          <button
            onClick={() => router.push('/admin/addproduct')}
            className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 p-8 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <PlusCircle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-white font-bold text-lg">Add New Products</h2>
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">Create a new product listing with full specifications, features, and FAQs.</p>
            <span className="mt-5 inline-flex items-center text-xs text-primary font-medium">
              Add New Product →
            </span>
          </button>

          {/* Update Product */}
          <button
            onClick={() => router.push('/admin/products')}
            className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-blue-500/10 hover:border-blue-400/40 transition-all duration-300 p-8 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
              <RefreshCw className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Update / Delete Product</h2>
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">Edit existing product details, update specifications, and manage content.</p>
            <span className="mt-5 inline-flex items-center text-xs text-blue-400 font-medium">
              Update / Delete Product →
            </span>
          </button>

          {/* Add Blog */}
          <button
            onClick={() => router.push('/admin/blogs')}
            className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-400/40 transition-all duration-300 p-8 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Manage Blog Posts</h2>
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">Create, edit, preview, and publish articles. Manage drafts, images, and SEO.</p>
            <span className="mt-5 inline-flex items-center text-xs text-emerald-400 font-medium">
              Go to Add Blog →
            </span>
          </button>
          <button onClick={()=>router.push('/admin/authors')} className="group relative rounded-2xl border border-white/10 bg-white/5 hover:bg-blue-500/10 hover:border-blue-400/40 transition-all duration-300 p-8 text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center mb-5"><UserCircle className="w-6 h-6 text-blue-400" /></div>
            <h2 className="text-white font-bold text-lg">Manage Authors</h2><p className="text-white/40 text-sm mt-1.5 leading-relaxed">Create author profiles, add photos and biographies, and assign authors to blog articles.</p><span className="mt-5 inline-flex items-center text-xs text-blue-400 font-medium">Manage authors →</span>
          </button>
        </div>
      </main>
    </div>
  );
}
