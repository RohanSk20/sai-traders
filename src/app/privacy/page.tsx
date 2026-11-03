import React from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumbs } from '@/components/ui/index'
import { siteConfig } from '@/lib/config'
import { getCategories } from '@/lib/db'

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: `Privacy Policy and data protection terms for ${siteConfig.name}.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/privacy`,
  },
}

export default async function PrivacyPage() {
  const categories = await getCategories()

  return (
    <>
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8 pb-16">
        <div className="container-custom max-w-4xl space-y-8">
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

          <div className="bg-white rounded-3xl border border-[#dce8d8] p-8 sm:p-12 shadow-xs space-y-6">
            <h1 className="text-3xl font-heading font-bold text-[#1a2517]">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#6b7c69]">
              Last updated: March 2026 • Effective immediately
            </p>

            <div className="space-y-4 text-sm text-[#1a2517] leading-relaxed">
              <p>
                At <strong>{siteConfig.name}</strong>, we respect your privacy and are committed to
                protecting the personal information you share with us when browsing our website or
                placing grocery orders via WhatsApp.
              </p>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                1. Information We Collect
              </h2>
              <p>
                Because {siteConfig.name} operates on a direct WhatsApp ordering model without mandatory
                customer account logins or online card payments, we only collect:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#6b7c69]">
                <li>Name and contact phone number provided during cart checkout</li>
                <li>Delivery address, pincode, and optional delivery instructions</li>
                <li>Order item selections, quantities, and preferred delivery slots</li>
              </ul>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                2. How We Use Your Information
              </h2>
              <p>
                We use your details exclusively to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#6b7c69]">
                <li>Package and fulfill your fresh grocery order to the correct address</li>
                <li>Communicate with you on WhatsApp regarding delivery time and dispatch updates</li>
                <li>Verify Cash on Delivery payment receipt upon doorstep handover</li>
              </ul>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                3. Data Security &amp; Sharing
              </h2>
              <p>
                We never sell, rent, or trade your personal contact details to third-party advertisers.
                Customer order information is stored securely on encrypted database infrastructure.
              </p>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                4. Contact Us
              </h2>
              <p>
                If you have any questions about this privacy statement, please write to us at{' '}
                <a href={`mailto:${siteConfig.contactEmail}`} className="text-[#1a6b3a] font-semibold underline">
                  {siteConfig.contactEmail}
                </a>{' '}
                or reach our WhatsApp support.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
