'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
export default function BlogListingRefresh(){const router=useRouter();useEffect(()=>{const refresh=()=>{if(document.visibilityState==='visible')router.refresh();};window.addEventListener('focus',refresh);window.addEventListener('cms:updated',refresh);return()=>{window.removeEventListener('focus',refresh);window.removeEventListener('cms:updated',refresh);};},[router]);return null;}
