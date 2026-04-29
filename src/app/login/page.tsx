// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Attempt to log the user in
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // Success! Send them to the dashboard
      router.push('/dashboard')

    } catch (err) {
      console.error("Login Error:", err)
      setError("Failed to connect to the database. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Welcome Back</h2>
        
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" name="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Create one here
          </Link>
        </div>
      </form>
    </div>
  )
}