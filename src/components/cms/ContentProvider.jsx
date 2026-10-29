'use client';
import {createContext,useContext} from 'react';
import {Circle,Target,Eye,Award,Users,Factory,ShieldCheck,Crosshair,Cpu,HeadphonesIcon,Wrench,Settings2,Gauge,FileCheck,GraduationCap,Package,Plane,PanelsTopLeft,Car,Bath,FlaskConical,CircuitBoard,Palette,Thermometer,Cable,MapPin,Phone,Mail,Clock} from 'lucide-react';
import parse from 'html-react-parser';
const Icons={Circle,Target,Eye,Award,Users,Factory,ShieldCheck,Crosshair,Cpu,HeadphonesIcon,Wrench,Settings2,Gauge,FileCheck,GraduationCap,Package,Plane,PanelsTopLeft,Car,Bath,FlaskConical,CircuitBoard,Palette,Thermometer,Cable,MapPin,Phone,Mail,Clock};
const ContentContext=createContext({pages:{},collections:{},settings:{}});
export default function ContentProvider({value,children}){return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;}
export function useCmsBlock(page,block){return useContext(ContentContext).pages?.[page]?.sections?.[block]||{};}
export function useCmsCollection(kind,fallback=[]){return useContext(ContentContext).collections?.[kind]||fallback;}
export function useSiteSettings(scope){return useContext(ContentContext).settings?.[scope]||{};}
export function cmsArray(defaults,items){if(!Array.isArray(items))return defaults;return items.filter(item=>item?.enabled!==false).map((item,i)=>{if(!item||typeof item!=='object')return item;const match=defaults.find(d=>d&&typeof d==='object'&&((d.id&&d.id===item.id)||(d.code&&d.code===item.code)||(d.name&&d.name===item.name)))||defaults[i]||{};const value={...match,...Object.fromEntries(Object.entries(item).filter(([,v])=>v!==null))};if(typeof value.icon==='string')value.icon=Icons[value.icon]||match.icon||Icons.Circle;return value;});}
export function cmsRender(value){if(typeof value!=='string'||!value.includes('<'))return value;const inline=value.replace(/^<p[^>]*>/i,'').replace(/<\/p>$/i,'').replace(/<\/p>\s*<p[^>]*>/gi,'<br/><br/>');return parse(inline,{replace(node){if(['script','style','iframe','object','embed'].includes(node.name))return <></>;if(node.attribs){for(const key of Object.keys(node.attribs))if(/^on/i.test(key))delete node.attribs[key];for(const key of ['href','src'])if(/^\s*(javascript|data|vbscript):/i.test(node.attribs[key]||''))delete node.attribs[key];}}});}
