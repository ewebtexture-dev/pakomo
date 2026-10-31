'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Pencil,Trash2,Eye,Copy,Power} from 'lucide-react';
export function notify(message,error=false){window.dispatchEvent(new CustomEvent('cms:notice',{detail:{message,error}}));}
/** @param {{editHref?:string,onEdit?:()=>void,onDelete?:()=>any,viewHref?:string,onDuplicate?:()=>any,onToggle?:()=>any,disabled?:boolean}} props */
export default function ActionButtons({editHref,onEdit,onDelete,viewHref,onDuplicate,onToggle,disabled=false}){
 const [busy,setBusy]=useState(false);
 async function run(action,remove=false){if(remove&&!window.confirm('Are you sure? This cannot be undone'))return;setBusy(true);try{await action();notify(remove?'Deleted successfully.':'Changes saved.');window.dispatchEvent(new Event('cms:updated'));}catch(e){notify(e.message||'Please try again.',true);}finally{setBusy(false);}}
 const cls='inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 hover:bg-white/10 disabled:opacity-40 shrink-0';
 return <div className="flex gap-2 items-center" aria-label="Actions" aria-busy={busy}>{editHref?<Link className={cls} href={editHref} aria-label="Edit" title="Edit"><Pencil size={17}/></Link>:onEdit?<button type="button" className={cls} onClick={onEdit} aria-label="Edit" title="Edit"><Pencil size={17}/></button>:null}{viewHref&&<Link className={cls} href={viewHref} target="_blank" aria-label="Preview" title="Preview"><Eye size={17}/></Link>}{onToggle&&<button type="button" disabled={busy||disabled} className={cls} onClick={()=>run(onToggle)} aria-label="Toggle status" title="Toggle status"><Power size={17}/></button>}{onDuplicate&&<button type="button" disabled={busy||disabled} className={cls} onClick={()=>run(onDuplicate)} aria-label="Duplicate" title="Duplicate"><Copy size={17}/></button>}{onDelete&&<button type="button" disabled={busy||disabled} className={cls+' text-red-300'} onClick={()=>run(onDelete,true)} aria-label="Delete" title="Delete">{busy?'…':<Trash2 size={17}/>}</button>}</div>;
}
