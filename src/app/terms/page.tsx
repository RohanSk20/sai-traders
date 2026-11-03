import React from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumbs } from '@/components/ui/index'
import { siteConfig } from '@/lib/config'
import { getCategories } from '@/lib/db'

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name}`,
  description: `Terms and conditions governing orders and deliveries with ${siteConfig.name}.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/terms`,
  },
}

export default async function TermsPage() {
  const categories = await getCategories()

  return (
    <>
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8 pb-16">
        <div className="container-custom max-w-4xl space-y-8">
          <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

          <div className="bg-white rounded-3xl border border-[#dce8d8] p-8 sm:p-12 shadow-xs space-y-6">
            <h1 className="text-3xl font-heading font-bold text-[#1a2517]">
              Terms of Service
            </h1>
            <p className="text-xs text-[#6b7c69]">
              Last updated: March 2026
            </p>

            <div className="space-y-4 text-sm text-[#1a2517] leading-relaxed">
              <p>
                Welcome to <strong>{siteConfig.name}</strong>. By accessing our catalog website and
                placing grocery orders via our WhatsApp ordering workflow, you agree to comply with
                these Terms of Service.
              </p>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                1. Ordering &amp; Confirmation
              </h2>
              <p>
                All orders initiated through our website cart generate a pre-filled WhatsApp message.
                An order is officially confirmed only when our support representative replies with
                confirmation and estimated dispatch time.
              </p>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                2. Pricing &amp; Currency
              </h2>
              <p>
                All prices are listed in Indian Rupees (₹) inclusive of applicable taxes. Fresh produce
                prices (especially seasonal fruits and vegetables) are subject to market fluctuations.
                The price confirmed in your WhatsApp message at the time of order confirmation will be honored.
              </p>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                3. Payment Terms
              </h2>
              <p>
                Payment is accepted via <strong>Cash on Delivery (COD)</strong> or instant UPI on delivery.
                Customers are encouraged to inspect goods before paying our delivery executive.
              </p>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                4. Service Availability
              </h2>
              <p>
                Deliveries are restricted to serviceable pincodes within our delivery radius. We reserve
                the right to decline or reschedule deliveries during extreme weather, local holidays,
                or unforeseen logistical constraints.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
