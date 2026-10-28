'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

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

export default function QuoteModal({ open, onOpenChange }) {
  const initialformObj = { name: '', email: '', phone: '', company: '', industry: '', product_interest: '', message: '' }
  const [form, setForm] = useState(initialformObj);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailjs.send(
        'service_2gzianb',
        'template_iesyv4p',
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          industry: form.industry,
          product_interest: form.product_interest,
          message: form.message,
        },
        '3fi4jhrH147Bfxbzu'
      );
      setSuccess(true);
      setForm(initialformObj);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Quote submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Request a Quote</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Tell us about your testing requirements and we'll get back within 24 hours.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-foreground">Quote Request Submitted!</p>
            <p className="text-sm text-muted-foreground mt-1">Our team will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Full Name *</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter Name" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Email *</Label>
                <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter Email" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Phone *</Label>
                <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Enter Phone No." className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Company *</Label>
                <Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Industry</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Product Interest</Label>
                <Input value={form.product_interest} onChange={(e) => setForm({ ...form, product_interest: e.target.value })} placeholder="e.g. Tensile Tester" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Additional Details</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your testing requirements..." className="h-20 text-sm resize-none" />
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