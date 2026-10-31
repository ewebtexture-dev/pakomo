import {activeFaqs,faqPlainText} from './features.js';
export const BLOG_FAQ_HEADING='Frequently Asked Questions';
const escape=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function faqContentHtml(value){return activeFaqs(value).map(item=>`<h3>${escape(faqPlainText(item.q))}</h3>${item.a}`).join('\n');}
export function importFaqText(text){
  const result=[];let current=null,answer=false;
  for(const raw of String(text).split(/\r?\n/)){
    const line=raw.trim(),q=line.match(/^(?:Q(?:uestion)?)(?:\s*\d+)?\s*[:.)-]\s*(.*)$/i),a=line.match(/^A(?:nswer)?\s*[:.)-]\s*(.*)$/i);
    if(q){if(current)result.push(current);current={q:q[1],a:'',enabled:true};answer=false;}
    else if(a&&current){current.a=a[1];answer=true;}
    else if(line&&current){if(answer)current.a+='\n'+line;else current.q+=' '+line;}
  }
  if(current)result.push(current);
  return result.filter(item=>item.q.trim()&&item.a.trim()).map(item=>({...item,a:'<p>'+escape(item.a).replace(/\n/g,'<br/>')+'</p>'}));
}
