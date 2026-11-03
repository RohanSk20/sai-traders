import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Leaf, Award, Heart, ShieldCheck, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Breadcrumbs, SectionHeading, FeatureCard } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/lib/config'
import { getCategories } from '@/lib/db'

export const metadata: Metadata = {
  title: `About Us – Farm Direct Quality | ${siteConfig.name}`,
  description:
    'Learn about Sai Traders, our mission to deliver unadulterated farm-fresh organic groceries, and our direct partnership with Indian farmers.',
  alternates: {
    canonical: `${siteConfig.siteUrl}/about`,
  },
}

export default async function AboutPage() {
  const categories = await getCategories()

  return (
    <>
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8 pb-16">
        <div className="container-custom space-y-16">
          {/* Breadcrumbs */}
          <Breadcrumbs items={[{ label: 'About Us' }]} />

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5ee] text-[#1a6b3a] text-xs font-bold uppercase tracking-wider">
                <Leaf className="h-4 w-4" /> Our Story &amp; Philosophy
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#1a2517] leading-tight">
                Bringing Nature&apos;s Purest Harvest Straight to Your Kitchen
              </h1>
              <p className="text-base text-[#6b7c69] leading-relaxed">
                Founded with a straightforward mission: deliver genuine, unadulterated farm produce
                directly to urban families without middleman delays or artificial chemical ripening.
              </p>
              <p className="text-base text-[#1a2517] leading-relaxed">
                At <strong>{siteConfig.name}</strong>, we partner closely with organic cooperative
                farms across Maharashtra, Himachal, Madhya Pradesh, and South India. Every crate of mangoes,
                every bunch of spinach, and every jar of Vedic bilona ghee is sourced with uncompromising dedication
                to natural health and freshness.
              </p>
              <div className="pt-2">
                <Button asChild size="lg">
                  <Link href="/shop">
                    Explore Our Farm Produce <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-[#dce8d8] shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh organic grocery harvest"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Pillars */}
          <div className="space-y-8">
            <SectionHeading
              pill="Core Values"
              title="What Sets Sai Traders Apart"
              subtitle="Three pillars of promise we guarantee with every single order."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Award className="h-7 w-7" />}
                title="Direct Farmer Sourcing"
                description="We eliminate wholesale mandi stockpiling. Fruits and greens are harvested upon your order and sent directly to your home."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-7 w-7" />}
                title="Zero Harmful Chemicals"
                description="No calcium carbide ripening for mangoes, no synthetic wax on apples, and no toxic pesticides on daily greens."
              />
              <FeatureCard
                icon={<Heart className="h-7 w-7" />}
                title="Eco-Friendly Mindset"
                description="Packed in breathable corrugated cardboard boxes and recyclable paper punnets rather than single-use polythene bags."
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
