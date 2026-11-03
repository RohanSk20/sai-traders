// Store configuration - Pan-India Delivery & International Exports
export const siteConfig = {
  name: 'Sai Traders',
  tagline: 'Farm-Fresh Pan-India & Global Agricultural Exports',
  description:
    'Sai Traders delivers premium farm-fresh organic groceries, fruits, vegetables, dairy, grains, and dry fruits across India and exports worldwide with APEDA phytosanitary compliance.',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://saitraders.in',
  contactEmail: 'exports@saitraders.in',
  contactPhone: '+91 98765 43210',
  address: 'Sai Traders Central Hub, India',
  socialLinks: {
    instagram: 'https://instagram.com/saitraders',
    facebook: 'https://facebook.com/saitraders',
  },
  // Delivery & Export configuration
  delivery: {
    freeDeliveryThreshold: 500, // ₹500 across India
    deliveryFee: 40, // ₹40 standard delivery
    sameDayCutoffHour: 14, // 2 PM cutoff for local express
    panIndiaSupported: true,
    internationalExportsSupported: true,
    exportDestinations: [
      { code: 'AE', name: 'United Arab Emirates (UAE / Dubai)' },
      { code: 'SA', name: 'Saudi Arabia' },
      { code: 'QA', name: 'Qatar' },
      { code: 'OM', name: 'Oman' },
      { code: 'KW', name: 'Kuwait' },
      { code: 'SG', name: 'Singapore' },
      { code: 'MY', name: 'Malaysia' },
      { code: 'GB', name: 'United Kingdom (UK)' },
      { code: 'US', name: 'United States (USA)' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' },
      { code: 'OTHER', name: 'Other International Destination' },
    ],
  },
  businessHours: {
    open: '8:00 AM',
    close: '9:00 PM',
    days: 'Monday - Saturday',
  },
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num)
}

// Any valid 6-digit Indian PIN code (100000 - 999999) is serviceable Pan-India
export const isServiceablePincode = (pincode: string): boolean => {
  const clean = pincode.trim()
  return /^[1-9][0-9]{5}$/.test(clean)
}

export const calculateDeliveryFee = (subtotal: number): number => {
  if (subtotal >= siteConfig.delivery.freeDeliveryThreshold) return 0
  return siteConfig.delivery.deliveryFee
}

export const isSameDayAvailable = (): boolean => {
  const now = new Date()
  return now.getHours() < siteConfig.delivery.sameDayCutoffHour
}
