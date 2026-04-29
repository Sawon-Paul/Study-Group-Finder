// src/app/groups/[id]/create/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

export default function CreateGroupPage() {
  const router = useRouter()
  // This grabs the course ID from the URL (e.g., /groups/123/create -> id is 123)
  const params = useParams() 
  const courseId = params.id as string

  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const location_preference = formData.get('location') as string

    try {
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("You must be logged in to create a group.")
        return
      }

      // 2. Save the new group to the database
      const { error: insertError } = await supabase
        .from('study_groups')
        .insert({
          course_id: courseId,
          created_by: user.id,
          name,
          type,
          location_preference,
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      // 3. Success! Send them back to the course page to see their new group
      router.push(`/groups/${courseId}`)
      router.refresh() // This forces Next.js to fetch the new group immediately

    } catch (err) {
      console.error("Failed to create group:", err)
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        
        <Link href={`/groups/${courseId}`} className="text-gray-500 hover:text-blue-600 flex items-center gap-2 w-fit transition-colors">
          <ArrowLeft size={20} /> Cancel
        </Link>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full mb-4">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Start a Study Group</h2>
            <p className="text-gray-500 mt-2">Fill in the details below to invite classmates.</p>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm text-center">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="e.g., Midterm Prep Squad" 
              required 
              className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
              <select name="type" required className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 bg-white text-gray-900">
                <option value="Open">Open (Anyone can join)</option>
                <option value="Private">Private (Request required)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select name="location" required className="block w-full rounded-md border-gray-300 shadow-sm border p-2.5 bg-white text-gray-900">
                <option value="Library">Library</option>
                <option value="Cafeteria">Cafeteria</option>
                <option value="Study Room">Study Room</option>
                <option value="Online">Online (Discord/Meet)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  )
}