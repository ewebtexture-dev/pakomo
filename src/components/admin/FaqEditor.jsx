'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowUp,ArrowDown,GripVertical} from 'lucide-react';
import CmsField from './CmsField';
import RichTextEditor from './RichTextEditor';
import ActionButtons,{notify} from './ActionButtons';
import {adminFetch as fetch} from './admin-request';
import {FAQ_HEADING} from '@/cms/features';
import {BLOG_FAQ_HEADING,importFaqText} from '@/cms/blog-faq';
const input='w-full bg-white/5 border border-white/20 rounded-lg p-3 text-sm';
export default function FaqEditor({value,onChange,legacy=[],allowPostImport=false,postId,onBusyChange}){
  const next=value||{heading:allowPostImport?BLOG_FAQ_HEADING:FAQ_HEADING,description:'',items:legacy.map((item,i)=>({...item,id:'legacy-'+i,enabled:item.enabled!==false}))};
  const [sources,setSources]=useState([]),[source,setSource]=useState(''),[paste,setPaste]=useState(''),[copying,setCopying]=useState(false),dragged=useRef(null),busy=useRef(new Set());
  useEffect(()=>{if(!allowPostImport)return;let alive=true;fetch('/api/admin/posts',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);if(alive)setSources(d.posts.filter(p=>p.id!==postId));}).catch(e=>notify(e.message,true));return()=>{alive=false;};},[allowPostImport,postId]);
  const setItem=(i,patch)=>onChange({...next,items:next.items.map((v,n)=>n===i?{...v,...patch}:v)});
  const itemId=(item,i)=>item.id||'faq-'+i;
  function move(from,to){if(to<0||to>=next.items.length)return;const items=[...next.items];items.splice(to,0,items.splice(from,1)[0]);onChange({...next,items});}
  function append(items){if(!items.length)throw Error('No complete questions and answers found.');if(next.items.length+items.length>100)throw Error('A post supports up to 100 FAQs.');onChange({...next,items:[...next.items,...items.map(item=>({...item,id:crypto.randomUUID()}))]});notify('FAQs added. Save the post to apply them.');}
  async function copy(){setCopying(true);try{const r=await fetch('/api/admin/posts/'+source,{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error);append(d.post.faqSection?.items||[]);}catch(e){notify(e.message,true);}finally{setCopying(false);}}
  return <details open className="border border-white/15 rounded-xl p-5 space-y-5" data-faq-editor><summary className="font-semibold cursor-pointer">FAQs</summary>
    <CmsField label="FAQ section heading" value={next.heading} onChange={heading=>onChange({...next,heading})}/>
    <CmsField label="Optional sub-heading" value={next.description} onChange={description=>onChange({...next,description})}/>
    {!allowPostImport?<CmsField label="Questions and answers" name="faqItems" value={next.items} onChange={items=>onChange({...next,items})}/>:<>
      <div className="space-y-5">{next.items.map((item,i)=>{const id=itemId(item,i);return <fieldset key={id} className="p-4 border border-white/15 rounded-xl space-y-4 min-w-0" onDragOver={e=>{if(dragged.current!==null)e.preventDefault();}} onDrop={e=>{if(dragged.current!==null){e.preventDefault();move(dragged.current,i);dragged.current=null;}}}>
        <legend className="text-sm">FAQ {i+1}</legend><div className="flex flex-wrap items-center gap-3">
          <button type="button" draggable onDragStart={()=>{dragged.current=i;}} onDragEnd={()=>{dragged.current=null;}} aria-label="Drag to reorder FAQ" title="Drag to reorder"><GripVertical size={18}/></button>
          <button type="button" onClick={()=>move(i,i-1)} disabled={i===0} aria-label="Move FAQ up" title="Move up"><ArrowUp size={18}/></button>
          <button type="button" onClick={()=>move(i,i+1)} disabled={i===next.items.length-1} aria-label="Move FAQ down" title="Move down"><ArrowDown size={18}/></button>
          <label className="text-sm flex gap-2"><input type="checkbox" checked={item.enabled!==false} onChange={e=>setItem(i,{enabled:e.target.checked})}/> Enabled</label>
          <ActionButtons disabled={busy.current.has(id)} onEdit={()=>document.getElementById('faq-question-'+id)?.focus()} onDelete={()=>onChange({...next,items:next.items.filter((_,n)=>n!==i)})}/>
        </div>
        <label className="block text-sm" htmlFor={'faq-question-'+id}>Question<input id={'faq-question-'+id} className={input} maxLength={500} value={item.q} onChange={e=>setItem(i,{q:e.target.value})}/></label>
        <div><p className="text-sm mb-2">Answer</p><RichTextEditor idPrefix={'faq-answer-'+id} value={item.a} onChange={a=>setItem(i,{a})} onBusyChange={active=>{if(active)busy.current.add(id);else busy.current.delete(id);onBusyChange?.(busy.current.size>0);}}/></div>
      </fieldset>;})}</div>
      <button type="button" disabled={next.items.length>=100} className="px-4 py-2 border border-blue-400 text-blue-300 rounded-lg" onClick={()=>onChange({...next,items:[...next.items,{id:crypto.randomUUID(),q:'',a:'',enabled:true}]})}>Add FAQ</button>
      <details className="border border-white/15 p-4 rounded-lg"><summary>Duplicate FAQs from another post</summary><div className="space-y-3 mt-4"><select aria-label="Copy FAQs from post" className={input+' bg-slate-900'} value={source} onChange={e=>setSource(e.target.value)}><option value="">Choose a post…</option>{sources.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><button type="button" disabled={!source||copying} className="text-blue-300" onClick={copy}>{copying?'Copying…':'Copy FAQs'}</button></div></details>
      <details className="border border-white/15 p-4 rounded-lg"><summary>Import Q&amp;A text</summary><label className="block text-sm mt-4">Use Q: question and A: answer for each item.<textarea aria-label="Paste Q and A text" rows={6} className={input} maxLength={100000} value={paste} onChange={e=>setPaste(e.target.value)} placeholder={'Q: What does this instrument measure?\nA: It measures material strength.'}/></label><button type="button" className="text-blue-300 mt-3" onClick={()=>{try{append(importFaqText(paste));setPaste('');}catch(e){notify(e.message,true);}}}>Import FAQs</button></details>
    </>}
    <p className="text-xs text-white/50">Hidden until at least one enabled question and answer exists. Save or publish the post to apply changes.</p>
  </details>;
}
