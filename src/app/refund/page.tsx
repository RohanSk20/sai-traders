import React from 'react'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumbs } from '@/components/ui/index'
import { siteConfig } from '@/lib/config'
import { getCategories } from '@/lib/db'

export const metadata: Metadata = {
  title: `Refund &amp; Delivery Policy | ${siteConfig.name}`,
  description: `Delivery slots, same-day cutoff, and freshness replacement policy for ${siteConfig.name}.`,
  alternates: {
    canonical: `${siteConfig.siteUrl}/refund`,
  },
}

export default async function RefundPage() {
  const categories = await getCategories()

  return (
    <>
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8 pb-16">
        <div className="container-custom max-w-4xl space-y-8">
          <Breadcrumbs items={[{ label: 'Refund & Delivery Policy' }]} />

          <div className="bg-white rounded-3xl border border-[#dce8d8] p-8 sm:p-12 shadow-xs space-y-6">
            <h1 className="text-3xl font-heading font-bold text-[#1a2517]">
              Refund &amp; Delivery Policy
            </h1>
            <p className="text-xs text-[#6b7c69]">
              Fair, transparent policies for fresh perishables
            </p>

            <div className="space-y-4 text-sm text-[#1a2517] leading-relaxed">
              <h2 className="text-lg font-bold font-heading text-[#1a2517]">
                1. Delivery Timelines &amp; Cutoffs
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#6b7c69]">
                <li>
                  <strong>Same-Day Delivery:</strong> Available for orders confirmed before{' '}
                  {siteConfig.delivery.sameDayCutoffHour}:00 PM. Delivery takes place in the evening slot
                  (4:00 PM – 9:00 PM).
                </li>
                <li>
                  <strong>Next-Day Delivery:</strong> Orders placed after 2:00 PM are scheduled for
                  the following morning (8:00 AM – 11:00 AM) or evening as per customer preference.
                </li>
                <li>
                  <strong>Delivery Charges:</strong> Orders below ₹{siteConfig.delivery.freeDeliveryThreshold}{' '}
                  incur a nominal fee of ₹{siteConfig.delivery.deliveryFee}. Orders of ₹{siteConfig.delivery.freeDeliveryThreshold}{' '}
                  and above are delivered <strong>FREE</strong>.
                </li>
              </ul>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                2. On-the-Spot Inspection (No Questions Asked)
              </h2>
              <p>
                Because fresh produce is perishable, we encourage customers to inspect items in front of
                the delivery personnel. If any vegetable or fruit does not meet your quality expectations,
                you may simply return that item on the spot, and pay only for the remaining items.
              </p>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                3. Post-Delivery Replacements
              </h2>
              <p>
                If you discover a spoiled or unsatisfactory item within <strong>24 hours</strong> of
                delivery (e.g. internal mango browning or damaged seal):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#6b7c69]">
                <li>Snap a quick photo of the damaged product</li>
                <li>Send it to our WhatsApp number ({siteConfig.whatsappNumber})</li>
                <li>We will arrange a free immediate replacement on our next delivery run or adjust your bill</li>
              </ul>

              <h2 className="text-lg font-bold font-heading text-[#1a2517] pt-4">
                4. Cancellation Policy
              </h2>
              <p>
                You may cancel your order free of charge at any time prior to dispatch notification on
                WhatsApp. Once dispatched with our delivery executive, cancellations are not permitted
                for perishable goods.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
