'use client';
import {createContext,useContext,useEffect,useState} from 'react';
export const FieldErrorContext=createContext({});
export function FieldErrorsProvider({children}){const [errors,setErrors]=useState({});useEffect(()=>{const show=e=>setErrors(e.detail);window.addEventListener('cms:validation',show);return()=>window.removeEventListener('cms:validation',show);},[]);return <FieldErrorContext.Provider value={errors}>{children}</FieldErrorContext.Provider>;}
export default function FieldError({name}){const errors=useContext(FieldErrorContext),matches=Object.entries(errors).filter(([path])=>name&&(path===name||path.endsWith('.'+name)));return matches.length?<div role="alert" className="text-red-300 text-sm">{matches.map(([key,message])=><p key={key}>{message}</p>)}</div>:null;}
