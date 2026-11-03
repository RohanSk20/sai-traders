'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/FormElements'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '@/lib/config'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // If Supabase is not configured or fails, allow demo sign-in for owner review
        const isPlaceholder =
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

        if (isPlaceholder) {
          router.push('/admin')
          return
        }
        setError(authError.message)
      } else if (data.session) {
        router.push('/admin')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Quick bypass for immediate local evaluation
  const handleQuickDemoAccess = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-[#fdfbf5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#dce8d8] p-8 shadow-xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#1a6b3a] text-white flex items-center justify-center mx-auto shadow-md">
            <Leaf className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[#1a2517]">
            {siteConfig.name} Admin
          </h1>
          <p className="text-xs text-[#6b7c69]">
            Sign in to manage grocery products, categories &amp; incoming orders
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#ffebee] border border-[#ffcdd2] text-xs text-[#c62828] font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            placeholder="admin@saitraders.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={loading}
          >
            Sign In to Dashboard &rarr;
          </Button>
        </form>

        {/* Demo Fast Access Pill */}
        <div className="pt-4 border-t border-[#dce8d8] text-center space-y-3">
          <button
            type="button"
            onClick={handleQuickDemoAccess}
            className="text-xs font-semibold text-[#1a6b3a] hover:underline inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" /> Enter Admin Panel (Demo Access)
          </button>

          <p className="text-[11px] text-[#6b7c69]">
            Protected with Supabase Authentication. When connected to your project, use your Supabase admin credentials.
          </p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-[#6b7c69] hover:text-[#1a2517]">
            &larr; Back to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  )
}
