import {htmlToDOM} from 'html-react-parser';
export function plainText(input){const walk=nodes=>nodes.map(n=>['script','style'].includes(n.name)?'':n.type==='text'?n.data:walk(n.children||[])+(['p','div','br','li'].includes(n.name)?'\n':'')).join('');return walk(htmlToDOM(String(input??''))).replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();}
export function testimonialText(input){return plainText(input).replace(/^[\s"“”‘’]+|[\s"“”‘’]+$/g,'');}
