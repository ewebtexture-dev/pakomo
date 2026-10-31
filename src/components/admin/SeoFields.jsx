'use client';
import ImageField from './ImageField';
import FieldError from './FieldErrors';
export const adminInput='w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50';

export function AdminField({id,label,value,onChange,maxLength,placeholder,type='text',required=false,help}) {
  return <label htmlFor={id} className="block space-y-2 text-xs text-white/70"><span>{label}{required?' *':''}</span><input id={id} name={id} type={type} className={adminInput} value={value || ''} onChange={event=>onChange(event.target.value)} maxLength={maxLength} placeholder={placeholder} required={required} /><FieldError name={id}/>{help&&<span className="block text-white/40 leading-relaxed">{help}</span>}</label>;
}

export default function SeoFields({form,set,origin,onImageUpload,uploading=false}) {
  const field=(key,label,maxLength,placeholder='',type='text')=><AdminField key={key} id={key} label={label} value={form[key]} onChange={value=>set(key,value)} maxLength={maxLength} placeholder={placeholder} type={type} />;
  const keyword=form.focus_keyword.trim().toLowerCase();
  const content=form.content.replace(/<[^>]*>/g,' '),words=content.trim().split(/\s+/).filter(Boolean).length;
  const title=form.meta_title || form.title,description=form.meta_description || form.excerpt;
  const checks=[['Focus keyword in article title',form.title.toLowerCase().includes(keyword)],['Focus keyword in description',description.toLowerCase().includes(keyword)],['Focus keyword in article content',content.toLowerCase().includes(keyword)]];
  return <section className="rounded-xl border border-white/10 bg-white/5 p-5 sm:p-7 space-y-5" aria-labelledby="seo-heading">
    <div><h2 id="seo-heading" className="font-semibold">SEO & sharing</h2><p className="text-xs text-white/40 mt-1">Set search metadata, control indexing, and customise shared links.</p></div>
    <div className="grid sm:grid-cols-2 gap-5">{field('focus_keyword','Focus keyword',150,'e.g. packaging quality testing')}{field('meta_keywords','Topic tags (comma separated)',500,'quality control, packaging, testing')}</div>
    {field('meta_title','SEO title',180,'Defaults to your article title')}
    <p className="text-xs text-white/40">{title.length} characters · Suggested length: 50–60 characters.</p>
    <label htmlFor="meta_description" className="block space-y-2 text-xs text-white/70"><span>Meta description</span><textarea id="meta_description" className={adminInput} rows={3} maxLength={320} value={form.meta_description} onChange={event=>set('meta_description',event.target.value)} placeholder="Defaults to the excerpt. Explain what readers will learn." /></label>
    <p className="text-xs text-white/40">{description.length} characters · Suggested length: 140–160 characters.</p>
    {field('canonical_url','Canonical URL',2000,'Defaults to this article’s public URL','url')}
    <div className="grid sm:grid-cols-2 gap-5"><label className="flex gap-3 items-start text-sm text-white/70"><input id="noindex" type="checkbox" checked={form.noindex} onChange={event=>set('noindex',event.target.checked)} className="mt-1" /><span>Hide from search engines (noindex)<small className="block text-white/40 mt-1">Excludes the article from the sitemap.</small></span></label><label className="flex gap-3 items-start text-sm text-white/70"><input id="nofollow" type="checkbox" checked={form.nofollow} onChange={event=>set('nofollow',event.target.checked)} className="mt-1" /><span>Do not follow page links (nofollow)<small className="block text-white/40 mt-1">Adds a nofollow directive for search crawlers.</small></span></label></div>
    <div className="rounded-lg bg-white p-5"><p className="text-xs text-slate-500 break-all">{form.canonical_url || origin+'/blog/'+(form.slug || 'your-article-title')}</p><p className="text-blue-800 text-xl mt-1 break-words">{title || 'Your article title'}</p><p className="text-sm text-slate-600 mt-1 break-words">{description || 'Your article description will appear here.'}</p><p className="text-[10px] text-slate-400 mt-3">Search preview · Actual search results may vary.</p></div>
    <details className="border border-white/10 rounded-lg p-4" open={Boolean(form.og_title || form.og_description || form.og_image)}><summary className="cursor-pointer text-sm font-medium">Social sharing / Open Graph & Twitter</summary><div className="space-y-4 mt-5">{field('og_title','Social title',180,'Defaults to SEO title')}<label htmlFor="og_description" className="block space-y-2 text-xs text-white/70"><span>Social description</span><textarea id="og_description" className={adminInput} rows={3} maxLength={320} value={form.og_description} onChange={event=>set('og_description',event.target.value)} placeholder="Defaults to meta description" /></label><ImageField label="Social sharing image" value={form.og_image} onChange={v=>set('og_image',v)} recommended="1200 × 630."/><p className="text-xs text-white/40">These overrides apply to link sharing on social networks. Leave blank to use the article’s SEO metadata and featured image.</p></div></details>
    <div className="border-t border-white/10 pt-4"><h3 className="text-sm font-medium">Content review</h3><p className="text-xs text-white/40 mt-2">{words} words · {Math.max(1,Math.ceil(words/200))} minute read</p>{keyword?<ul className="mt-3 space-y-2 text-xs">{checks.map(([label,passes])=><li key={label} className={passes?'text-green-300':'text-amber-200'}>{passes?'✓':'○'} {label}</li>)}</ul>:<p className="text-xs text-white/40 mt-2">Enter a focus keyword to review its use in the article.</p>}</div>
  </section>;
}
