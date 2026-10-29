'use client';
import { useEffect, useMemo, useRef, useState, useId } from 'react';
import 'quill/dist/quill.snow.css';
import styles from './RichTextEditor.module.css';

export default function RichTextEditor({value,onChange,disabled=false,onBusyChange=()=>{},idPrefix='article'}) {
  const instanceId=useId();const fieldId=name=>idPrefix==='article'?name:idPrefix+instanceId+'-'+name;
  const editorRef=useRef(null),hostRef=useRef(null),dialogRef=useRef(null),selection=useRef(null);
  const valueRef=useRef(value),changeRef=useRef(onChange),lastHtml=useRef(value);
  valueRef.current=value;changeRef.current=onChange;
  const [file,setFile]=useState(null),[alt,setAlt]=useState(''),[caption,setCaption]=useState('');
  const [preview,setPreview]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [source,setSource]=useState(false),[sourceText,setSourceText]=useState('');
  const [ready,setReady]=useState(false),[editorError,setEditorError]=useState('');
  const sourceRef=useRef(null);
  const uploadHandler=useRef(null);
  useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
  useEffect(()=>{editorRef.current?.enable(!disabled && !busy);},[disabled,busy,ready]);
  function openUpload(image=null) {
    if(disabled || busy || source)return;
    selection.current=editorRef.current?.getSelection();
    setFile(image);setAlt('');setCaption('');setError('');dialogRef.current?.showModal();
  }
  uploadHandler.current=openUpload;
  const modules=useMemo(()=>({table:true,toolbar:{container:[[{header:[2,3,4,false]}],['bold','italic','underline','strike'],[{list:'ordered'},{list:'bullet'}],[{indent:'-1'},{indent:'+1'}],[{align:[]}],['blockquote','code-block'],['link','image'],['clean']],handlers:{image:()=>uploadHandler.current()}},history:{delay:500,maxStack:100,userOnly:true}}),[]);
  useEffect(()=>{
    let cancelled=false,editor,handleChange;
    const host=hostRef.current;
    import('quill').then(({default:Quill})=>{
      if(cancelled)return;
      const container=document.createElement('div');host.appendChild(container);
      editor=new Quill(container,{theme:'snow',modules,formats:['header','bold','italic','underline','strike','list','indent','align','blockquote','code-block','link','image','alt','width','height','table'],placeholder:'Write your article here. Use the toolbar to format text or upload an image.'});
      editor.clipboard.dangerouslyPasteHTML(valueRef.current,'silent');
      editor.root.setAttribute('aria-labelledby',fieldId('article-content-label'));editor.root.setAttribute('role','textbox');editor.root.setAttribute('aria-multiline','true');
      lastHtml.current=valueRef.current;
      handleChange=()=>{const html=editor.getSemanticHTML();lastHtml.current=html;changeRef.current(html);};
      editor.on('text-change',handleChange);editorRef.current=editor;setReady(true);
    }).catch(()=>setEditorError('The text editor could not load. Refresh this page and try again.'));
    return()=>{cancelled=true;if(editor){editor.off('text-change',handleChange);editor.disable();}editorRef.current=null;host.replaceChildren();};
  },[modules]);
  useEffect(()=>{if(editorRef.current && value!==lastHtml.current){const editor=editorRef.current;const range=editor.getSelection();editor.clipboard.dangerouslyPasteHTML(value,'silent');lastHtml.current=value;if(range)editor.setSelection(Math.min(range.index,editor.getLength()-1),0,'silent');}},[value,ready]);
  async function insertImage() {
    if(!file || !alt.trim()){setError('Choose an image and add descriptive alt text.');return;}
    if(file.size>5*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Choose a JPG, PNG, or WebP file up to 5 MB.');return;}
    setError('');setBusy(true);onBusyChange(true);
    try {
      const payload=new FormData();payload.set('image',file);
      const response=await fetch('/api/admin/uploads',{method:'POST',body:payload});const data=await response.json();
      if(!response.ok)throw Error(data.error || 'The upload failed.');
      const editor=editorRef.current;
      editor.enable(true);
      const index=selection.current?.index ?? Math.max(0,editor.getLength()-1);
      editor.insertEmbed(index,'image',data.url,'user');
      editor.formatText(index,1,'alt',alt.trim(),'user');
      editor.insertText(index+1,'\n'+(caption.trim()?caption.trim()+'\n':''),'user');
      editor.setSelection(index+2,0,'silent');
      onChange(editor.getSemanticHTML());
      dialogRef.current.close();setFile(null);
    }catch(e){setError(e.message);}finally{setBusy(false);onBusyChange(false);}
  }
  function switchMode() {
    if(source){onChange(sourceText);setSource(false);onBusyChange(false);}
    else{setSourceText(value);setSource(true);onBusyChange(true);}
  }
  function insertSourceTag(before,after) {
    const textarea=sourceRef.current;
    const start=textarea.selectionStart,end=textarea.selectionEnd;
    setSourceText(sourceText.slice(0,start)+before+sourceText.slice(start,end)+after+sourceText.slice(end));
    textarea.focus();
  }
  function insertTable(){const editor=editorRef.current;if(!editor||source)return;const rows=Math.min(10,Math.max(1,Number(window.prompt('Number of rows (1–10)','3'))||0)),columns=Math.min(8,Math.max(1,Number(window.prompt('Number of columns (1–8)','2'))||0));const html='<table><tbody>'+Array.from({length:rows},()=>'<tr>'+Array.from({length:columns},()=>'<td>Cell</td>').join('')+'</tr>').join('')+'</tbody></table><p><br></p>';const range=editor.getSelection(true);editor.clipboard.dangerouslyPasteHTML(range?.index||0,html,'user');onChange(editor.getSemanticHTML());}
  return <div className={styles.editor}>
    <div className={styles.editorHeader}><span id={fieldId("article-content-label")}>Article content *</span><div className={styles.modeActions}><button type="button" disabled={disabled||busy||!ready||source} onClick={insertTable}>Insert table</button><button type="button" disabled={disabled||busy||!ready||source} onClick={()=>editorRef.current?.history.undo()} aria-label="Undo" title="Undo">↶</button><button type="button" disabled={disabled||busy||!ready||source} onClick={()=>editorRef.current?.history.redo()} aria-label="Redo" title="Redo">↷</button><button type="button" disabled={disabled||busy||!ready} onClick={switchMode}>{source?'Apply HTML & return to editor':'Edit HTML source'}</button></div></div>
    {source&&<div className={styles.source}><p>HTML source mode. Apply your changes before saving the article.</p><div className={styles.modeActions}><button type="button" onClick={()=>insertSourceTag('<h2>','</h2>')}>H2</button><button type="button" onClick={()=>insertSourceTag('<p>','</p>')}>Paragraph</button></div><textarea ref={sourceRef} aria-label="Article HTML source" rows={16} maxLength={200000} value={sourceText} onChange={event=>setSourceText(event.target.value)} /></div>}
    <div hidden={source} onDragOver={event=>{if(Array.from(event.dataTransfer.types).includes('Files'))event.preventDefault();}} onPasteCapture={event=>{const image=Array.from(event.clipboardData?.files || []).find(item=>item.type.startsWith('image/'));if(image){event.preventDefault();event.stopPropagation();openUpload(image);}}} onDrop={event=>{const image=Array.from(event.dataTransfer.files || []).find(item=>item.type.startsWith('image/'));if(image){event.preventDefault();event.stopPropagation();openUpload(image);}}}>
      {!ready&&!editorError&&<p className="p-4 text-sm text-white/50">Loading text editor…</p>}{editorError&&<p role="alert" className="text-red-300">{editorError}</p>}<div ref={hostRef} />
    </div>
    <p className={styles.help}>Format headings, lists, and links with the toolbar. Use the image button to upload a photo, or paste/drop an image. Article content is sanitised when saved.</p>
    <dialog ref={dialogRef} className={styles.imageDialog} onCancel={event=>{if(busy)event.preventDefault();}} onKeyDown={event=>{if(event.key==='Enter' && event.target.tagName==='INPUT')event.preventDefault();}} aria-labelledby={fieldId("image-dialog-title")}>
      <div className="modal-content"><div className={styles.modalHeader}><h2 id={fieldId("image-dialog-title")}>Upload article image</h2><button type="button" className={styles.close} aria-label="Close image upload" disabled={busy} onClick={()=>dialogRef.current.close()}>×</button></div>
        <div className={styles.modalBody}><label htmlFor={fieldId("article-image-file")}>Image file</label><input id={fieldId("article-image-file")} className="form-control" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event=>setFile(event.target.files?.[0] || null)} /><small>JPG, PNG, or WebP. Maximum 5 MB.</small>{preview&&<img src={preview} alt="Selected upload preview" className={styles.preview} />}<label htmlFor={fieldId("article-image-alt")}>Alt text *</label><input id={fieldId("article-image-alt")} className="form-control" value={alt} onChange={event=>setAlt(event.target.value)} disabled={busy} maxLength={250} placeholder="Describe this image for readers and search engines" /><label htmlFor={fieldId("article-image-caption")}>Caption (optional)</label><input id={fieldId("article-image-caption")} className="form-control" value={caption} onChange={event=>setCaption(event.target.value)} disabled={busy} maxLength={500} placeholder="A short caption below the image" />{error&&<p role="alert" className={styles.error}>{error}</p>}</div>
        <div className={styles.modalFooter}><button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>dialogRef.current.close()}>Cancel</button><button type="button" className="btn btn-primary" disabled={busy} onClick={insertImage}>{busy?'Uploading…':'Upload & insert image'}</button></div>
      </div>
    </dialog>
  </div>;
}
