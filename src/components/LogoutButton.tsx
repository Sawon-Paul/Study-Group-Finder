// src/components/LogoutButton.tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // Clears the Next.js cache so the dashboard locks again
  }

  return (
    <button 
      onClick={handleLogout}
      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
    >
      <LogOut size={16} /> Logout
    </button>
  )
}