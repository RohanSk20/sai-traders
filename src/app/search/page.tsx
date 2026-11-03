import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Search as SearchIcon, ArrowRight, Sparkles } from 'lucide-react'
import { getCategories, getProducts } from '@/lib/db'
import { siteConfig } from '@/lib/config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { Breadcrumbs } from '@/components/ui/index'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search results for "${q}" | ${siteConfig.name}` : `Search Groceries | ${siteConfig.name}`,
    description: `Browse grocery search results for ${q || 'fresh items'} at Sai Traders.`,
    robots: {
      index: false, // Disallow search result pages from indexing per SEO guidelines
      follow: true,
    },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams
  const query = q.trim()

  const [categories, { products: searchResults }] = await Promise.all([
    getCategories(),
    query ? getProducts({ search: query, per_page: 48 }) : Promise.resolve({ products: [], total: 0 }),
  ])

  // Suggested products if results are empty or query is empty
  const suggestions = searchResults.length === 0 ? (await getProducts({ per_page: 8 })).products : []

  return (
    <>
      <Header categories={categories} />

      <main className="min-h-screen bg-[#fdfbf5] py-8">
        <div className="container-custom">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Shop', href: '/shop' },
                { label: `Search: "${query}"` },
              ]}
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading text-[#1a2517] mb-2 flex items-center gap-3">
              <SearchIcon className="h-8 w-8 text-[#1a6b3a]" />
              {query ? (
                <>
                  Results for &ldquo;<span className="text-[#1a6b3a]">{query}</span>&rdquo;
                </>
              ) : (
                'Search Our Products'
              )}
            </h1>
            <p className="text-[#6b7c69] text-sm">
              {query
                ? `Found ${searchResults.length} product${searchResults.length === 1 ? '' : 's'} matching your search.`
                : 'Enter a keyword above to find fresh fruits, vegetables, dairy, and grains.'}
            </p>
          </div>

          {/* Results Grid */}
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {/* Empty state box */}
              <div className="bg-white rounded-3xl border border-[#dce8d8] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mx-auto mb-4 text-3xl">
                  🔍
                </div>
                <h2 className="text-xl font-bold font-heading text-[#1a2517] mb-2">
                  No matching items found for &ldquo;{query}&rdquo;
                </h2>
                <p className="text-[#6b7c69] text-sm mb-6 leading-relaxed">
                  We couldn&apos;t find anything matching your exact query. Check for spelling mistakes,
                  try broader terms like &quot;mango&quot;, &quot;milk&quot;, or &quot;rice&quot;, or explore our popular categories below.
                </p>

                {/* Popular Search Suggestions */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {['Alphonso', 'Ghee', 'Tomatoes', 'Almonds', 'Basmati', 'Spinach'].map((term) => (
                    <Link
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="px-3 py-1.5 rounded-full bg-[#f0f9f4] text-[#1a6b3a] text-xs font-semibold hover:bg-[#1a6b3a] hover:text-white transition-colors"
                    >
                      {term}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a6b3a] text-white text-sm font-semibold hover:bg-[#155530] transition-colors"
                >
                  Browse All Products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Recommended Items */}
              {suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-5 w-5 text-[#f5c842]" />
                    <h2 className="text-xl font-bold font-heading text-[#1a2517]">
                      Popular Farm Fresh Picks
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {suggestions.slice(0, 8).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
