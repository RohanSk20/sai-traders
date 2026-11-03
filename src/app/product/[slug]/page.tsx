import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getProductBySlug,
  getCategories,
  getRelatedProducts,
  getAllProductSlugs,
} from '@/lib/db'
import { siteConfig } from '@/lib/config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductDetailView } from '@/components/product/ProductDetailView'
import { Breadcrumbs, SectionHeading } from '@/components/ui/index'

export const revalidate = 60 // ISR revalidation every 60s

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return { title: 'Product Not Found' }

  const title = product.seo_title || `${product.name} – Buy Online | ${siteConfig.name}`
  const description =
    product.seo_description ||
    product.short_description ||
    product.description ||
    `Order fresh ${product.name} online from Sai Traders with WhatsApp checkout and same-day delivery.`

  const ogImage = product.images?.[0]?.image_url

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.siteUrl}/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.siteUrl}/product/${product.slug}`,
      siteName: siteConfig.name,
      images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const [categories, relatedProducts] = await Promise.all([
    getCategories(),
    getRelatedProducts(product.id, product.category_id, 4),
  ])

  // Structured Data (Product + BreadcrumbList)
  const productPrice = product.sale_price ?? product.price
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img) => img.image_url) || [],
    description: product.short_description || product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: productPrice,
      priceValidUntil: '2027-12-31',
      availability:
        product.stock_status === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: `${siteConfig.siteUrl}/shop`,
      },
      ...(product.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.category.name,
              item: `${siteConfig.siteUrl}/category/${product.category.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.name,
              item: `${siteConfig.siteUrl}/product/${product.slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: `${siteConfig.siteUrl}/product/${product.slug}`,
            },
          ]),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8 pb-24 lg:pb-12">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Shop', href: '/shop' },
                ...(product.category
                  ? [{ label: product.category.name, href: `/category/${product.category.slug}` }]
                  : []),
                { label: product.name },
              ]}
            />
          </div>

          {/* Main Product Section */}
          <ProductDetailView product={product} />

          {/* Related Products / You May Also Like */}
          {relatedProducts.length > 0 && (
            <section className="mt-20 pt-12 border-t border-[#dce8d8]">
              <div className="flex items-center justify-between mb-8">
                <SectionHeading
                  pill="Recommendations"
                  title="You May Also Like"
                  align="left"
                  as="h2"
                />
                {product.category && (
                  <Link
                    href={`/category/${product.category.slug}`}
                    className="text-sm font-semibold text-[#1a6b3a] hover:underline hidden sm:block"
                  >
                    More in {product.category.name} &rarr;
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
