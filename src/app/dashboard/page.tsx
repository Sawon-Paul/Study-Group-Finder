// src/app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Users, MapPin } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import { getUserGroups } from '@/controllers/groupController' // Import the new function

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch profile AND their joined groups in parallel
  const [ { data: profile }, myGroups ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getUserGroups()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold text-blue-600">StudyGroup Finder</div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-600 hidden sm:block">Logged in as {user.email}</span>
          <LogoutButton /> {/* Our new active component! */}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-8 space-y-8">
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.name || 'Student'}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              {profile?.department} Department • Semester: {profile?.semester} • {profile?.skill_level} Level
            </p>
          </div>
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
            {profile?.name?.charAt(0) || 'S'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/groups" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors cursor-pointer group block">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Find a Study Group</h2>
            </div>
            <p className="text-gray-600">Browse open groups for your courses or request to join a private group.</p>
          </Link>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
            </div>
            <p className="text-gray-600">View resources, schedules, and study partners for your current classes.</p>
          </div>
        </div>

        {/* NEW SECTION: My Active Groups */}
        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Active Groups</h2>
          
          {myGroups.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
              You haven't joined any study groups yet. Click "Find a Study Group" to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((membership: any) => {
                const group = membership.study_groups;
                return (
                  <Link href={`/workspace/${membership.group_id}`} key={membership.group_id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer block">
                    <div className="text-xs font-bold text-blue-600 mb-1">{group.courses.code}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{group.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      {group.location_preference}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}