'use client';

/* cms:2910 */
import {useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React, { useState, useEffect } from 'react';
import {useQuote} from '@/lib/QuoteContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Loader2 } from 'lucide-react';
const industries = [
  { value: 'packaging', label: 'Packaging' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'paper', label: 'Paper' },
  { value: 'textile', label: 'Textile' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
];

const cmsSeed_quote_industries=industries;
export default function QuoteModal({ open, onOpenChange }) {
  const cms=useCmsBlock("global","quote");
  const industries=cmsArray(cmsSeed_quote_industries,cms.items_industries);

  const initialformObj = { name: '', email: '', phone: '', company: '', industry: '', product_interest: '', message: '' }
  const [form, setForm] = useState(initialformObj);
  const {quotePrefill}=useQuote();
  useEffect(()=>{if(open)setForm(f=>({...f,product_interest:quotePrefill||''}));},[open,quotePrefill]);
  const [loading, setLoading] = useState(false);
  const [error,setError]=useState('');
  const [success, setSuccess] = useState(false);


  const handleSubmit=async e=>{e.preventDefault();setLoading(true);setError('');try{const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,source_url:location.href})});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to submit. Please try again.');setSuccess(true);setForm(initialformObj);setTimeout(()=>{setSuccess(false);onOpenChange(false);},2000);}catch(e){setError(e.message);}finally{setLoading(false);}};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{cmsRender(cms.text_1??"Request a Quote")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {cmsRender(cms.text_2??"Tell us about your testing requirements and we'll get back within 24 hours.")}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-foreground">{cmsRender(cms.text_3??"Quote Request Submitted!")}</p>
            <p className="text-sm text-muted-foreground mt-1">{cmsRender(cms.text_4??"Our team will contact you shortly.")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
{error&&<p role="alert" className="text-red-600 text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{cmsRender(cms.text_5??"Full Name *")}</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={cms.placeholder_6??"Enter Name"} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{cmsRender(cms.text_7??"Email *")}</Label>
                <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={cms.placeholder_8??"Enter Email"} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{cmsRender(cms.text_9??"Phone *")}</Label>
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={cms.placeholder_10??"Enter Phone No."} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{cmsRender(cms.text_11??"Company *")}</Label>
                <Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder={cms.placeholder_12??"Company name"} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{cmsRender(cms.text_13??"Industry")}</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={cms.placeholder_14??"Select industry"} /></SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{cmsRender(cms.text_15??"Product Interest")}</Label>
                <Input value={form.product_interest} onChange={(e) => setForm({ ...form, product_interest: e.target.value })} placeholder={cms.placeholder_16??"e.g. Tensile Tester"} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{cmsRender(cms.text_17??"Additional Details")}</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={cms.placeholder_18??"Describe your testing requirements..."} className="h-20 text-sm resize-none" />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground h-10" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Quote Request'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
