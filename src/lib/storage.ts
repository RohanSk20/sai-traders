import { createClient } from '@/lib/supabase/client'

export async function uploadImage(file: File, folder: 'products' | 'categories' = 'products'): Promise<{ url: string; error: string | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const isConfigured = url && !url.includes('your-project') && !url.includes('placeholder')

  // If Supabase is connected, upload to product-images bucket
  if (isConfigured) {
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${folder}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
      const filePath = `${folder}/${fileName}`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.warn('Supabase storage upload error:', error.message)
      } else if (data) {
        const { data: publicData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path)

        if (publicData?.publicUrl) {
          return { url: publicData.publicUrl, error: null }
        }
      }
    } catch (err: unknown) {
      console.warn('Storage upload fallback:', err)
    }
  }

  // Client-side Base64 fallback (works offline and for immediate preview)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({ url: reader.result as string, error: null })
    }
    reader.onerror = () => {
      resolve({ url: '', error: 'Failed to read image file' })
    }
    reader.readAsDataURL(file)
  })
}

export const uploadProductImage = (file: File) => uploadImage(file, 'products')
export const uploadCategoryImage = (file: File) => uploadImage(file, 'categories')

