'use client';


/* cms:2910 */
import {useSiteSettings,useCmsBlock,cmsArray,cmsRender} from '@/components/cms/ContentProvider';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/shared/PageHeader';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import clients_1 from '@assets/Unsplash/clients-1.jpg';
import contact_1 from '@assets/Unsplash/contact-1.jpg';
const contactInfo = [
  { icon: MapPin, title: 'Head Office', detail: 'Plot No. 574, Aasharam Marg, Siddiq Nagar, Sihani Road, Ghaziabad 201001', color: 'bg-blue-50 text-blue-600' },
  { icon: Phone, title: 'Phone', href: 'tel:+918595362719', detail: '+918595362719', color: 'bg-green-50 text-green-600' },
  { icon: Mail, title: 'Email', href: "mailto:info@pakmoo.in", detail: 'info@pakmoo.in', color: 'bg-violet-50 text-violet-600' },
  { icon: Clock, title: 'Working Hours', detail: 'Mon – Sat: 9:00 AM – 6:00 PM (IST)', color: 'bg-amber-50 text-amber-600' },
];

const cmsSeed_contact_contactInfo=contactInfo;
export default function ContactPage() {
  const cms=useCmsBlock("contact","contact");
  const contact=useSiteSettings("contact");
  const contactInfo=cmsArray(cmsSeed_contact_contactInfo,cms.items_contactInfo).map((item,i)=>({...item,...(i===0?{detail:contact.address||item.detail}:i===1?{detail:contact.phones?.[0]?.number||item.detail,href:"tel:"+(contact.phones?.[0]?.number||"+918595362719")}:i===2?{detail:contact.emails?.[0]||item.detail,href:"mailto:"+(contact.emails?.[0]||"info@pakmoo.in")}:i===3?{detail:contact.hours||item.detail}:{} )}));

  const initialformObj = { name: '', email: '', phone: '', subject: '', message: '' }
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error,setError]=useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     console.log('Contact form submitted:', form);
  //     await new Promise((resolve) => setTimeout(resolve, 700));
  //     setSuccess(true);
  //     setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  //   } catch (error) {
  //     console.error('Contact submission failed:', error);
  //   } finally {
  //     setLoading(false);
  //     setTimeout(() => {
  //       setSuccess(false);
  //     }, 3000);
  //   }
  // };

    const handleSubmit=async e=>{e.preventDefault();setLoading(true);setError('');try{const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,source_url:location.href})});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to submit. Please try again.');setSuccess(true);setForm(initialformObj);setTimeout(()=>setSuccess(false),5000);}catch(e){setError(e.message);}finally{setLoading(false);}};

  return (
    <>
      <PageHeader
        title={cms.title_1??"Contact Us"}
        subtitle={cms.subtitle_2??"Get in touch with our team for inquiries, quotes, or technical support."}
        breadcrumbs={cmsArray([{ label: 'Contact' }],cms.list_3)}
      />

      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img
          src={cms.image_4??(clients_1?.src)}
          alt={cms.alt_5??"Our office"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <section className="py-12 sm:py-20 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <span className="section-label">{cmsRender(cms.text_6??"Get In Touch")}</span>
                <h2 className="text-2xl font-bold text-foreground mt-1 mb-3">{cmsRender(cms.text_7??"Contact Information")}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cmsRender(cms.text_8??"Have a question? Need a quote or technical support? Our experts are ready to help.")}</p>
              </div>

              <div className="space-y-3">
                {contactInfo.map((info, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${info.color}`}>
                      <info.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{info.title}</h4>
                      {
                        info.href ?
                          <a className="text-xs text-muted-foreground mt-0.5 leading-relaxed" href={info.href}>{info.detail}</a>
                          :
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{info.detail}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={"https://wa.me/"+(contact.whatsapp||"918595362719")+"?text="+encodeURIComponent(contact.whatsappMessage||"Hi, I need information about testing instruments")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 text-sm">{cmsRender(cms.text_10??"Chat on WhatsApp")}</p>
                  <p className="text-xs text-green-600">{cmsRender(cms.text_11??"Get instant reply from our team")}</p>
                </div>
              </a>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-foreground text-xl mb-2">{cmsRender(cms.text_12??"Send Us a Message")}</h3>
                <p className="text-sm text-muted-foreground mb-6">{cmsRender(cms.text_13??"We'll get back to you within 24 hours.")}</p>

                {success ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-bold text-foreground text-lg">{cmsRender(cms.text_14??"Message Sent Successfully!")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{cmsRender(cms.text_15??"Our team will contact you within 24 hours.")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
{error&&<p role="alert" className="text-red-600 text-sm">{error}</p>}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">{cmsRender(cms.text_16??"Full Name *")}</Label>
                        <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={cms.placeholder_17??"Enter Name"} className="h-11 text-sm rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">{cmsRender(cms.text_18??"Email *")}</Label>
                        <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={cms.placeholder_19??"Enter Email"} className="h-11 text-sm rounded-lg" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">{cmsRender(cms.text_20??"Phone *")}</Label>
                        <Input required type="number" onWheel={(e) => e.target.blur()} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={cms.placeholder_21??"Enter Phone No."} className="h-11 text-sm rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">{cmsRender(cms.text_22??"Subject")}</Label>
                        <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={cms.placeholder_23??"Product inquiry"} className="h-11 text-sm rounded-lg" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">{cmsRender(cms.text_24??"Message *")}</Label>
                      <Textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={cms.placeholder_25??"Describe your requirements in detail..."} className="h-36 text-sm resize-none rounded-lg" />
                    </div>
                    <Button type="submit" className="bg-primary text-white h-12 px-8 text-sm font-bold gap-2 rounded-full w-full sm:w-auto hover:bg-primary/90 shadow-lg shadow-primary/30" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> {cmsRender(cms.text_26??" Send Message")}</>}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-3 mb-5">

        <div className="hidden lg:block rounded-xl overflow-hidden h-[450px]">
          <img
            src={cms.image_27??(contact_1?.src)}
            alt={cms.alt_28??"Pakmoo team"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full h-[450px] rounded-2xl overflow-hidden" style={{border: '2px solid gray'}}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.9564514436584!2d77.42441507505502!3d28.69094927563284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf103375d329f%3A0xf11bece228800c11!2sMOVETECH%20ENGINEERS!5e0!3m2!1sen!2sin!4v1785333736009!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={cms.title_29??"Office Location"}
          />
        </div>

      </div>
    </>
  );
}
