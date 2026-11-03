import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategories, getProducts } from '@/lib/db'
import { siteConfig } from '@/lib/config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Breadcrumbs } from '@/components/ui/index'
import type { ProductFilters as FilterType } from '@/types'

interface ShopPageProps {
  searchParams: Promise<{
    category?: string
    organic?: string
    in_stock?: string
    sale?: string
    min_price?: string
    max_price?: string
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
    page?: string
  }>
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams
  const isFiltered =
    !!resolvedParams.organic ||
    !!resolvedParams.in_stock ||
    !!resolvedParams.sale ||
    !!resolvedParams.min_price ||
    !!resolvedParams.max_price ||
    !!resolvedParams.sort

  return {
    title: 'Shop All Fresh Groceries | Sai Traders',
    description:
      'Browse our wide selection of 100% natural and organic groceries. Fruits, vegetables, dairy, grains, dry fruits, and beverages delivered to your doorstep.',
    alternates: {
      canonical: `${siteConfig.siteUrl}/shop`,
    },
    // Noindex if heavily filtered to preserve SEO crawl budget
    robots: isFiltered ? { index: false, follow: true } : { index: true, follow: true },
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams

  const page = parseInt(resolvedParams.page || '1', 10)
  const per_page = 24

  const filterOptions: FilterType = {
    category: resolvedParams.category,
    organic_only: resolvedParams.organic === 'true',
    in_stock_only: resolvedParams.in_stock === 'true',
    sale_only: resolvedParams.sale === 'true',
    min_price: resolvedParams.min_price ? parseFloat(resolvedParams.min_price) : undefined,
    max_price: resolvedParams.max_price ? parseFloat(resolvedParams.max_price) : undefined,
    sort: resolvedParams.sort || 'relevance',
    page,
    per_page,
  }

  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getProducts(filterOptions),
  ])

  const totalPages = Math.ceil(total / per_page)

  // ItemList JSON-LD
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        image: product.images?.[0]?.image_url,
        description: product.short_description || product.description,
        offers: {
          '@type': 'Offer',
          price: product.sale_price ?? product.price,
          priceCurrency: 'INR',
          availability:
            product.stock_status === 'in_stock'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Shop All' },
              ]}
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading text-[#1a2517] mb-2">
              All Products
            </h1>
            <p className="text-[#6b7c69] text-base max-w-2xl">
              From fresh seasonal fruits to pure A2 dairy and wholesome pantry staples — handpicked with love.
            </p>
          </div>

          {/* Layout: Sidebar + Grid */}
          <div className="lg:flex lg:gap-8 items-start">
            <ProductFilters
              categories={categories}
              totalProducts={total}
            />

            <div className="flex-1 w-full">
              {products.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#dce8d8] p-12 text-center my-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mx-auto mb-4 text-3xl">
                    🌿
                  </div>
                  <h3 className="text-xl font-bold font-heading text-[#1a2517] mb-2">
                    No matching products found
                  </h3>
                  <p className="text-[#6b7c69] text-sm max-w-md mx-auto mb-6">
                    Try relaxing your price filters or unchecking some preference boxes to see more items.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a6b3a] text-white text-sm font-semibold hover:bg-[#155530] transition-colors"
                  >
                    Reset All Filters
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1
                        const isCurrent = pageNum === page
                        return (
                          <Link
                            key={pageNum}
                            href={`/shop?page=${pageNum}`}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                              isCurrent
                                ? 'bg-[#1a6b3a] text-white shadow-md'
                                : 'bg-white border border-[#dce8d8] text-[#1a2517] hover:bg-[#e8f5ee]'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
