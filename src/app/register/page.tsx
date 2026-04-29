'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const student_id = formData.get('student_id') as string
    const department = formData.get('department') as string
    const semester = formData.get('semester') as string
    const skill_level = formData.get('skill_level') as string

    try {
      // 1. Create the user securely in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // 2. Save their academic details into our 'profiles' table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name,
            student_id,
            department,
            semester,
            skill_level,
          })

        if (profileError) {
          setError("Account created, but failed to save profile details: " + profileError.message)
          setLoading(false)
          return
        }
      }

      // 3. Success!
      setSuccess(true)
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (err) {
      // This catches the "Failed to fetch" network error
      console.error("Network or Setup Error:", err)
      setError("Failed to connect to the database. Please ensure your .env.local file is correct and your server was restarted.")
    } finally {
      if (!success) {
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-xl shadow-md text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600">Registration Successful!</h2>
          <p className="text-gray-600">Welcome to Study Group Finder. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Join the Platform</h2>
        
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Student ID</label>
            <input type="text" name="student_id" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input type="text" name="department" placeholder="e.g., CSE" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <input type="text" name="semester" placeholder="e.g., Fall 2026" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Skill Level</label>
          <select name="skill_level" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white text-gray-900">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <hr className="my-6 border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" name="email" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" required minLength={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Registering...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}