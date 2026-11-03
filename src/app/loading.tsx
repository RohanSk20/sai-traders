import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-[#fdfbf5] flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#e8f5ee] flex items-center justify-center text-3xl animate-bounce">
        🌿
      </div>
      <p className="mt-4 font-heading text-lg font-bold text-[#1a6b3a]">
        Loading fresh groceries...
      </p>
      <p className="text-xs text-[#6b7c69] mt-1">
        Gathering seasonal harvest from our database
      </p>
    </div>
  )
}
