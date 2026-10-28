'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {AdminField,adminInput} from './SeoFields';

const empty={name:'',slug:'',bio:'',job_title:'',avatar_url:'',website_url:'',active:true};
const slugify=value=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,160);
async function json(response){const data=await response.json();if(!response.ok)throw Error(data.error || 'Unable to save author.');return data;}
export default function AuthorEditor({id}) {
  const [author,setAuthor]=useState(empty),[loading,setLoading]=useState(Boolean(id)),[loadError,setLoadError]=useState(''),[error,setError]=useState(''),[saving,setSaving]=useState(false),[uploading,setUploading]=useState(false),[slugTouched,setSlugTouched]=useState(Boolean(id));
  const router=useRouter();
  useEffect(()=>{if(!id)return;const controller=new AbortController();fetch('/api/admin/authors/'+id,{signal:controller.signal,cache:'no-store'}).then(json).then(data=>setAuthor(data.author)).catch(e=>{if(e.name!=='AbortError')setLoadError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[id]);
  const set=(key,value)=>setAuthor(previous=>({...previous,[key]:value}));
  async function upload(event){const file=event.target.files?.[0];if(!file)return;setUploading(true);setError('');try{if(file.size>5*1024*1024)throw Error('Choose a photo no larger than 5 MB.');const body=new FormData();body.set('image',file);const data=await fetch('/api/admin/uploads',{method:'POST',body}).then(json);set('avatar_url',data.url);}catch(e){setError(e.message);}finally{setUploading(false);event.target.value='';}}
  async function save(event){event.preventDefault();setError('');setSaving(true);try{await fetch('/api/admin/authors'+(id?'/'+id:''),{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(author)}).then(json);router.push('/admin/authors');router.refresh();}catch(e){setError(e.message);}finally{setSaving(false);}}
  if(loading)return <div className="min-h-screen bg-[#0a0f1e] text-white/60 p-12">Loading author…</div>;
  if(loadError)return <div className="min-h-screen bg-[#0a0f1e] text-white p-12"><p role="alert" className="text-red-300">{loadError}</p><Link className="text-blue-300 block mt-5" href="/admin/authors">Back to authors</Link></div>;
  return <section className="min-h-screen bg-[#0a0f1e] text-white px-4 sm:px-8 py-10"><div className="max-w-3xl mx-auto"><Link href="/admin/authors" className="text-blue-300 text-sm">← All authors</Link><h1 className="text-3xl font-bold mt-7">{id?'Edit author':'Create author'}</h1><p className="text-white/50 text-sm mt-2 mb-7">Create a reusable author profile and assign it to blog articles.</p>{error&&<p role="alert" className="rounded-lg p-4 mb-5 bg-red-500/10 text-red-200">{error}</p>}<form onSubmit={save} className="space-y-5 border border-white/10 rounded-xl p-5 sm:p-7 bg-white/5">
    <AdminField id="author-name" label="Author name" required value={author.name} maxLength={120} placeholder="Full name or organisation" onChange={name=>setAuthor(previous=>({...previous,name,...(!slugTouched?{slug:slugify(name)}:{})}))} />
    <AdminField id="author-slug" label="Author slug" required value={author.slug} maxLength={160} placeholder="author-name" onChange={slug=>{setSlugTouched(true);set('slug',slugify(slug));}} />
    <AdminField id="author-job" label="Job title / expertise" value={author.job_title} maxLength={160} placeholder="e.g. Quality Testing Specialist" onChange={value=>set('job_title',value)} />
    <label htmlFor="author-bio" className="block space-y-2 text-xs text-white/70"><span>Biography</span><textarea id="author-bio" className={adminInput} rows={5} maxLength={5000} value={author.bio} onChange={event=>set('bio',event.target.value)} placeholder="Professional background and areas of expertise" /></label>
    <AdminField id="author-website" label="Website / professional profile" type="url" value={author.website_url} maxLength={2000} placeholder="https://example.com" onChange={value=>set('website_url',value)} />
    <label htmlFor="author-photo-file" className="block space-y-2 text-xs text-white/70"><span>Upload author photo (JPG, PNG, WebP; up to 5 MB)</span><input id="author-photo-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading||saving} onChange={upload} className="block w-full text-sm" /></label>{uploading&&<p className="text-xs text-blue-300">Uploading photo…</p>}
    <AdminField id="author-photo" label="Photo URL" value={author.avatar_url} maxLength={2000} placeholder="Upload a photo or enter an HTTPS image URL" onChange={value=>set('avatar_url',value)} />{author.avatar_url&&<img src={author.avatar_url} alt={author.name || 'Author photo preview'} className="h-24 w-24 rounded-full object-cover" />}
    <label className="flex items-start gap-3 text-sm text-white/70"><input id="author-active" type="checkbox" checked={author.active} onChange={event=>set('active',event.target.checked)} className="mt-1" /><span>Active author<small className="block text-white/40 mt-1">Inactive authors keep their existing articles but cannot be assigned to new ones.</small></span></label>
    <div className="flex flex-wrap gap-4 items-center pt-2"><button type="submit" disabled={saving||uploading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg px-6 py-3 text-sm font-semibold">{saving?'Saving…':id?'Save author':'Create author'}</button><Link href="/admin/authors" className="text-sm text-white/50">Cancel</Link></div>
  </form></div></section>;
}
