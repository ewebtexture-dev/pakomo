import {z} from 'zod';
import {plainText} from './plain-text.js';

export const blogListingDefaults = {
  bannerHeading: 'Blogs', breadcrumbLabel: 'Blogs',
  introHeading: 'Insights for better quality testing',
  introDescription: 'Practical guides, testing standards and product insights from the PAKMOO team to help you make informed quality-control decisions.',
  continueReadingText: 'Continue reading...', allArticlesLabel: 'All Articles',
  publishedLabel: 'Published:', reviewerLabel: 'Verified By:',
  postsPerPage: 12, showCategories: true, showReviewer: true,
  emptyMessage: 'No articles published yet. Please check back soon.',
};
export const blogListingSchema = z.object({
  bannerHeading:z.string().trim().min(1).max(180), breadcrumbLabel:z.string().trim().min(1).max(100),
  introHeading:z.string().max(250), introDescription:z.string().max(1500),
  continueReadingText:z.string().trim().min(1).max(100), allArticlesLabel:z.string().trim().min(1).max(100),
  publishedLabel:z.string().max(100), reviewerLabel:z.string().max(100),
  postsPerPage:z.number().int().min(1).max(60), showCategories:z.boolean(), showReviewer:z.boolean(), emptyMessage:z.string().max(1000),
});
export function blogListingSettings(payload={}) {
  return {...blogListingDefaults,...payload.blogListing};
}
const profileUrl=z.string().max(2000).refine(value=>{
  if(!value)return true;
  try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}
},'Use a full HTTP or HTTPS profile URL.');
export const reviewerSchema=z.object({
  id:z.string().max(100).default(''), name:z.string().max(150).transform(plainText).default(''),
  role:z.string().max(150).transform(plainText).default(''), profileUrl:profileUrl.default(''),
});
export const reviewersSchema=z.object({items:z.array(reviewerSchema.extend({id:z.string().uuid(),name:z.string().trim().min(1).max(150).transform(plainText)})).max(100)}).superRefine((value,ctx)=>{
  const ids=new Set();value.items.forEach((item,i)=>{if(ids.has(item.id))ctx.addIssue({code:'custom',path:['items',i,'id'],message:'Reviewer IDs must be unique.'});ids.add(item.id);});
});
export const emptyReviewer={id:'',name:'',role:'',profileUrl:''};
export function pageNumber(value){const raw=Array.isArray(value)?value[0]:value;return /^\d+$/.test(String(raw||''))&&Number(raw)>0&&Number(raw)<=1000000?Number(raw):1;}
export function paginationItems(current,total){const pages=new Set([1,total]);for(let p=Math.max(1,current-2);p<=Math.min(total,current+2);p++)pages.add(p);const sorted=[...pages].sort((a,b)=>a-b),result=[];sorted.forEach((p,i)=>{if(i&&p-sorted[i-1]>1)result.push('ellipsis-'+p);result.push(p);});return result;}
export function listingDate(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';const parts=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).formatToParts(date);const part=type=>parts.find(p=>p.type===type)?.value||'';return `${part('day')} ${part('month')}, ${part('year')}`;}
