import Link from 'next/link'
import {
  Leaf,
  Truck,
  Shield,
  Star,
  ShoppingBag,
  ArrowRight,
  Package,
  MessageCircle,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { Metadata } from 'next'
import { getCategories, getFeaturedProducts } from '@/lib/db'
import { siteConfig } from '@/lib/config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { CategoryCard, SectionHeading, FeatureCard, TrustBadge, Rating } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: `${siteConfig.name} – Fresh Organic Groceries Delivered`,
  description: siteConfig.description,
  keywords: ['organic groceries', 'fresh vegetables', 'fruits delivery', 'Sai Traders'],
  openGraph: {
    title: `${siteConfig.name} – Fresh Organic Groceries`,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    type: 'website',
  },
  alternates: {
    canonical: siteConfig.siteUrl,
  },
}

// JSON-LD structured data
function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.siteUrl}/#organization`,
        name: siteConfig.name,
        url: siteConfig.siteUrl,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: siteConfig.contactPhone,
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        },
        sameAs: [siteConfig.socialLinks.instagram, siteConfig.socialLinks.facebook],
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteConfig.siteUrl}/#business`,
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.siteUrl,
        telephone: siteConfig.contactPhone,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'India',
          addressCountry: 'IN',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '21:00',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.siteUrl}/#website`,
        url: siteConfig.siteUrl,
        name: siteConfig.name,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I place an order?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Add items to your cart, fill in your delivery details, then click "Order on WhatsApp". We will confirm your order via WhatsApp.',
            },
          },
          {
            '@type': 'Question',
            name: 'What areas do you deliver to?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We deliver to select pincodes. Enter your pincode during checkout to check serviceability.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is same-day delivery available?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Orders placed before 2 PM are eligible for same-day delivery.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I pay for my order?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We currently accept cash on delivery. No online payment is required.',
            },
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const trustItems = [
  { icon: <Leaf className="h-5 w-5" />, label: '100% Organic' },
  { icon: <Shield className="h-5 w-5" />, label: 'Secure Ordering' },
  { icon: <Package className="h-5 w-5" />, label: 'Eco Packaging' },
  { icon: <Star className="h-5 w-5" />, label: '4.8★ Happy Customers' },
]

const howItWorks = [
  { step: '01', icon: <ShoppingBag className="h-6 w-6" />, title: 'Browse Products', desc: 'Explore our fresh selection of organic fruits, vegetables, dairy, and more.' },
  { step: '02', icon: <Package className="h-6 w-6" />, title: 'Add to Cart', desc: 'Select your items and quantities. See prices with live totals.' },
  { step: '03', icon: <MessageCircle className="h-6 w-6" />, title: 'Order on WhatsApp', desc: 'Click the button and your order is sent to us instantly on WhatsApp.' },
  { step: '04', icon: <Truck className="h-6 w-6" />, title: 'Get Delivered', desc: 'We deliver fresh to your door the same day or the next morning.' },
]

const faqs = [
  { q: 'How do I place an order?', a: 'Add items to your cart, fill in your delivery details, then click "Order on WhatsApp". We will confirm your order and dispatch it.' },
  { q: 'Is same-day delivery available?', a: 'Yes! Orders placed before 2:00 PM qualify for same-day delivery within our service area.' },
  { q: 'What is your delivery fee?', a: `Delivery is ₹${siteConfig.delivery.deliveryFee}. FREE for orders above ₹${siteConfig.delivery.freeDeliveryThreshold}.` },
  { q: 'How do I pay?', a: 'We accept Cash on Delivery. No online payment is required.' },
  { q: 'Are all products organic?', a: 'Products labelled "Organic" are certified or naturally grown. All products are fresh and carefully sourced.' },
]

const testimonials = [
  { name: 'Priya S.', rating: 5, text: 'The freshest vegetables I have ever got delivered! Mangoes were divine. Will order every week now.' },
  { name: 'Rahul M.', rating: 5, text: 'Love the WhatsApp ordering — so simple. Delivery is fast and the packing is eco-friendly. Highly recommend!' },
  { name: 'Sunita K.', rating: 4, text: 'Great quality organic produce. The desi ghee is authentic and delicious. My family loves it!' },
]

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ])

  return (
    <>
      <JsonLd />
      <Header categories={categories} />
      <main>
        {/* ─── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-[#f0f9f4] via-[#fdfbf5] to-[#fff8e1] overflow-hidden py-16 lg:py-24" aria-labelledby="hero-heading">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="flex flex-col gap-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f5ee] text-[#1a6b3a] text-sm font-semibold w-fit">
                  <Leaf className="h-4 w-4" aria-hidden="true" />
                  100% Natural &amp; Organic
                </span>

                <h1 id="hero-heading" className="font-heading text-[#1a2517]">
                  Fresh From Nature,<br />
                  <span className="text-[#1a6b3a]">Delivered to You</span>
                </h1>

                <p className="text-[#6b7c69] text-lg leading-relaxed max-w-lg">
                  Farm-fresh organic groceries sourced directly from trusted farmers. Order on WhatsApp and get same-day delivery to your doorstep.
                </p>

                {/* Trust row */}
                <div className="flex flex-wrap gap-4">
                  <TrustBadge icon={<CheckCircle className="h-4 w-4" />} label="No Pesticides" />
                  <TrustBadge icon={<Truck className="h-4 w-4" />} label="Same Day Delivery" />
                  <TrustBadge icon={<Rating value={4.8} size="sm" />} label="4.8 stars" />
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild size="lg">
                    <Link href="/shop">
                      Shop Now <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/category/fruits">Explore Products</Link>
                  </Button>
                </div>
              </div>

              {/* Right: Hero image */}
              <div className="relative hidden lg:block">
                <div className="relative aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e8f5ee] to-[#f0f9f4] rounded-3xl" />
                  <div className="relative z-10 flex items-center justify-center h-full text-9xl" aria-hidden="true">
                    🛒
                  </div>
                  {/* Floating cards */}
                  <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 z-20">
                    <Leaf className="h-5 w-5 text-[#1a6b3a]" aria-hidden="true" />
                    <span className="text-sm font-semibold text-[#1a2517]">100% Natural</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-[#f5c842] rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 z-20">
                    <Truck className="h-5 w-5 text-[#1a2517]" aria-hidden="true" />
                    <span className="text-sm font-semibold text-[#1a2517]">Same Day Delivery</span>
                  </div>
                  <div className="absolute top-1/2 -right-8 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 z-20">
                    <Star className="h-4 w-4 text-[#f5c842] fill-current" aria-hidden="true" />
                    <span className="text-sm font-semibold text-[#1a2517]">4.8 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trust Strip ───────────────────────────────────────────────── */}
        <section className="bg-[#1a6b3a] py-4" aria-label="Key features">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustItems.map((item) => (
                <div key={item.label} className="flex items-center justify-center gap-2 text-white">
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Categories ────────────────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="py-16 bg-[#fdfbf5]" aria-labelledby="categories-heading">
            <div className="container-custom">
              <SectionHeading
                pill="Browse by Category"
                title="Shop by Category"
                subtitle="From farm-fresh fruits to wholesome grains — everything your kitchen needs."
                className="mb-10"
                as="h2"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── Featured Products ─────────────────────────────────────────── */}
        {featuredProducts.length > 0 && (
          <section className="py-16 bg-white" aria-labelledby="featured-heading">
            <div className="container-custom">
              <div className="flex items-end justify-between mb-10">
                <SectionHeading
                  pill="Handpicked for You"
                  title="Featured Products"
                  align="left"
                  as="h2"
                />
                <Link
                  href="/shop"
                  className="hidden sm:flex items-center gap-1 text-[#1a6b3a] font-semibold hover:gap-2 transition-all text-sm"
                >
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="flex justify-center mt-8 sm:hidden">
                <Button asChild variant="outline">
                  <Link href="/shop">View All Products</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ─── Why Choose Us ─────────────────────────────────────────────── */}
        <section className="py-16 bg-[#fdfbf5]" aria-labelledby="why-heading">
          <div className="container-custom">
            <SectionHeading
              pill="Why Sai Traders"
              title="Why Choose Us?"
              subtitle="We go beyond just delivering groceries — we bring you quality, trust, and freshness."
              className="mb-12"
              as="h2"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard icon={<Leaf className="h-7 w-7" />} title="100% Organic" description="Certified organic and naturally grown produce. No harmful pesticides or chemicals." />
              <FeatureCard icon={<Truck className="h-7 w-7" />} title="Same Day Delivery" description="Order before 2 PM and get your fresh groceries the same evening." />
              <FeatureCard icon={<Shield className="h-7 w-7" />} title="Quality Assured" description="Every product is hand-picked and quality-checked before delivery." />
              <FeatureCard icon={<MessageCircle className="h-7 w-7" />} title="WhatsApp Support" description="Direct communication with us via WhatsApp. Easy ordering, fast support." />
            </div>
          </div>
        </section>

        {/* ─── How It Works ──────────────────────────────────────────────── */}
        <section className="py-16 bg-[#1a2517]" aria-labelledby="how-heading">
          <div className="container-custom">
            <SectionHeading
              pill="Simple Process"
              title="How It Works"
              subtitle="Ordering fresh groceries has never been this easy."
              className="mb-12 text-white [&>span]:bg-[#2d3d2a] [&>span]:text-[#8ccbaa] [&>h2]:text-white [&>p]:text-[#8ccbaa]"
              as="h2"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step) => (
                <div key={step.step} className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-[#1a6b3a] flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#f5c842] text-[#1a2517] text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-[#8ccbaa] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ──────────────────────────────────────────────── */}
        <section className="py-16 bg-[#fdfbf5]" aria-labelledby="testimonials-heading">
          <div className="container-custom">
            <SectionHeading
              pill="Customer Love"
              title="What Our Customers Say"
              className="mb-10"
              as="h2"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <blockquote key={t.name} className="bg-white rounded-2xl border border-[#dce8d8] p-6 shadow-[0_2px_8px_rgba(26,107,58,0.08)]">
                  <Rating value={t.rating} showValue className="mb-4" />
                  <p className="text-[#1a2517] text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <footer className="text-[#6b7c69] text-sm font-medium">— {t.name}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────────────────────── */}
        <section className="py-16 bg-white" aria-labelledby="faq-heading">
          <div className="container-custom max-w-3xl">
            <SectionHeading
              pill="FAQ"
              title="Frequently Asked Questions"
              className="mb-10"
              as="h2"
            />
            <div className="divide-y divide-[#dce8d8]">
              {faqs.map((faq) => (
                <details key={faq.q} className="group py-4">
                  <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                    <span className="font-semibold text-[#1a2517] text-sm">{faq.q}</span>
                    <ChevronDown className="h-4 w-4 text-[#6b7c69] flex-shrink-0 group-open:rotate-180 transition-transform" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 text-[#6b7c69] text-sm leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ────────────────────────────────────────────────── */}
        <section className="py-16 bg-[#1a6b3a]" aria-label="Call to action">
          <div className="container-custom text-center">
            <h2 className="font-heading text-3xl text-white mb-4">
              Ready to Eat Fresh &amp; Healthy?
            </h2>
            <p className="text-[#8ccbaa] mb-8 text-lg">
              Join hundreds of happy families. Order your first fresh basket today!
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/shop">
                Start Shopping <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
