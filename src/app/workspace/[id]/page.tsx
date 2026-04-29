// src/app/workspace/[id]/page.tsx
import { getGroupWorkspaceData } from '@/controllers/groupController'
import Link from 'next/link'
import { ArrowLeft, Users, MapPin, BookOpen, GraduationCap } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function GroupWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspaceData = await getGroupWorkspaceData(id);

  if (!workspaceData) {
    notFound();
  }

  // Next.js returns the joined 'courses' data as an object or array depending on the setup.
  // We force it to be treated as a single object here.
  const course = workspaceData.courses as any;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-4xl mx-auto space-y-6 mt-8">
        
        {/* Back to Dashboard */}
        <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 w-fit transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        {/* Group Header Banner */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 bg-blue-500/50 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              {course.code} • {workspaceData.type} Group
            </div>
            <h1 className="text-4xl font-bold mb-2">{workspaceData.name}</h1>
            <p className="text-blue-100 flex items-center gap-2 text-lg">
              <BookOpen size={20} /> {course.name}
            </p>
          </div>
          {/* Decorative background shape */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
        </div>

        {/* Info & Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Group Details */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Meetup Location
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg text-gray-700 font-medium text-center">
                {workspaceData.location_preference}
              </div>
            </div>
          </div>

          {/* Right Column: Member Roster */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="text-blue-600" /> Study Partners ({workspaceData.memberProfiles.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspaceData.memberProfiles.map((profile: any, index: number) => (
                <div key={index} className="p-4 border border-gray-100 rounded-xl flex items-center gap-4 hover:border-blue-200 transition-colors bg-gray-50/50">
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold uppercase shrink-0">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-gray-900 truncate">{profile.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                      <GraduationCap size={14} /> {profile.department} • {profile.skill_level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}