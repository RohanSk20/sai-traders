import React from 'react'
import type { Metadata } from 'next'
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumbs } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/lib/config'
import { getCategories } from '@/lib/db'

export const metadata: Metadata = {
  title: `Contact Us – Phone, WhatsApp &amp; Location | ${siteConfig.name}`,
  description: `Get in touch with ${siteConfig.name}. Reach our customer support on WhatsApp, phone, or visit our retail store.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/contact`,
  },
}

export default async function ContactPage() {
  const categories = await getCategories()
  const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    'Hello Sai Traders! I have a question regarding an order / delivery.'
  )}`

  return (
    <>
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8 pb-16">
        <div className="container-custom space-y-12">
          {/* Breadcrumbs */}
          <Breadcrumbs items={[{ label: 'Contact Us' }]} />

          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5ee] text-[#1a6b3a] text-xs font-bold uppercase tracking-wider">
              We&apos;re Here to Help
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#1a2517]">
              Get in Touch with Sai Traders
            </h1>
            <p className="text-[#6b7c69] text-base leading-relaxed">
              Have questions about an upcoming order, need bulk grocery delivery, or want to check
              pincode availability? Reach out via WhatsApp, phone, or email.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <div className="bg-white p-8 rounded-3xl border border-[#dce8d8] text-center space-y-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#25d366]/10 text-[#25d366] flex items-center justify-center mx-auto">
                <MessageCircle className="h-7 w-7 fill-current" />
              </div>
              <h3 className="font-bold text-lg text-[#1a2517]">WhatsApp Support</h3>
              <p className="text-xs text-[#6b7c69] leading-relaxed">
                Fastest response! Chat with us directly for instant order queries and product updates.
              </p>
              <Button asChild variant="primary" className="bg-[#25d366] hover:bg-[#20ba5a]">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp &rarr;
                </a>
              </Button>
            </div>

            {/* Phone */}
            <div className="bg-white p-8 rounded-3xl border border-[#dce8d8] text-center space-y-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#e8f5ee] text-[#1a6b3a] flex items-center justify-center mx-auto">
                <Phone className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg text-[#1a2517]">Phone Call</h3>
              <p className="text-xs text-[#6b7c69] leading-relaxed">
                Direct phone inquiries available during business hours.
              </p>
              <p className="font-mono font-bold text-sm text-[#1a6b3a]">
                {siteConfig.contactPhone}
              </p>
              <Button asChild variant="outline">
                <a href={`tel:${siteConfig.contactPhone.replace(/\s+/g, '')}`}>
                  Call Now
                </a>
              </Button>
            </div>

            {/* Email & Hours */}
            <div className="bg-white p-8 rounded-3xl border border-[#dce8d8] text-center space-y-4 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#fff8e1] text-[#f57f17] flex items-center justify-center mx-auto">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg text-[#1a2517]">Email Support</h3>
              <p className="text-xs text-[#6b7c69] leading-relaxed">
                For commercial inquiries, wholesale orders, and supplier partnerships.
              </p>
              <p className="font-mono text-xs text-[#1a2517]">
                {siteConfig.contactEmail}
              </p>
              <Button asChild variant="outline">
                <a href={`mailto:${siteConfig.contactEmail}`}>
                  Send Email
                </a>
              </Button>
            </div>
          </div>

          {/* Store Location & Hours Map Block */}
          <div className="bg-white rounded-3xl border border-[#dce8d8] p-8 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a6b3a]">
                Visit Our Hub
              </span>
              <h2 className="text-2xl font-bold font-heading text-[#1a2517]">
                Store Headquarters &amp; Packing Facility
              </h2>
              <div className="space-y-3 text-sm text-[#1a2517] pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#1a6b3a] flex-shrink-0 mt-0.5" />
                  <span>{siteConfig.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#1a6b3a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{siteConfig.businessHours.days}</p>
                    <p className="text-xs text-[#6b7c69]">
                      {siteConfig.businessHours.open} to {siteConfig.businessHours.close}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#1a6b3a] flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-[#6b7c69]">
                    Registered grocery business adhering to Indian food safety standards.
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded Visual Map representation */}
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-[#dce8d8] bg-[#f0f9f4] flex items-center justify-center text-center p-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#1a6b3a] text-white flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="h-6 w-6" />
                </div>
                <p className="font-bold text-sm text-[#1a2517]">{siteConfig.name}</p>
                <p className="text-xs text-[#6b7c69] max-w-xs">{siteConfig.address}</p>
                <p className="text-[11px] font-semibold text-[#1a6b3a] pt-1">
                  Serving City &amp; Surrounding Zones
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
