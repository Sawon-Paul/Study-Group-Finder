// src/app/workspace/[id]/page.tsx
import { getGroupWorkspaceData, resolveRequest, addResource, reportUser } from '@/controllers/groupController'
import Link from 'next/link'
import { ArrowLeft, Users, MapPin, BookOpen, GraduationCap, Link as LinkIcon, AlertTriangle, Check, X } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic';

export default async function GroupWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspaceData = await getGroupWorkspaceData(id);

  if (!workspaceData) notFound();
  const course = workspaceData.courses as any;
  const isCreator = workspaceData.created_by === workspaceData.currentUserId;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-5xl mx-auto space-y-6 mt-8">
        
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
        </div>

        {/* ADMIN PANEL: Only visible to the group creator if there are requests */}
        {isCreator && workspaceData.pendingRequests.length > 0 && (
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
            <h2 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
              <Users size={20} /> Pending Join Requests
            </h2>
            <div className="space-y-3">
              {workspaceData.pendingRequests.map((req: any) => (
                <div key={req.requestId} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                  <div>
                    <p className="font-bold text-gray-900">{req.profile?.name}</p>
                    <p className="text-sm text-gray-500">{req.profile?.department}</p>
                  </div>
                  <div className="flex gap-2">
                    {/* Approve Button */}
                    <form action={resolveRequest}>
                      <input type="hidden" name="requestId" value={req.requestId} />
                      <input type="hidden" name="userId" value={req.userId} />
                      <input type="hidden" name="groupId" value={workspaceData.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"><Check size={18}/></button>
                    </form>
                    {/* Reject Button */}
                    <form action={resolveRequest}>
                      <input type="hidden" name="requestId" value={req.requestId} />
                      <input type="hidden" name="action" value="reject" />
                      <button className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"><X size={18}/></button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Resources & Location */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Meetup Location
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg text-gray-700 font-medium text-center">
                {workspaceData.location_preference}
              </div>
            </div>

            {/* NEW: Shared Resources Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="text-blue-600" size={20} /> Shared Resources
              </h2>
              
              {/* Resource List */}
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                {workspaceData.resources.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No resources shared yet.</p>
                ) : (
                  workspaceData.resources.map((res: any) => (
                    <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 transition-all text-sm font-medium text-gray-700">
                      {res.title}
                    </a>
                  ))
                )}
              </div>

              {/* Add Resource Form */}
              <form action={addResource} className="border-t border-gray-100 pt-4 space-y-3">
                <input type="hidden" name="groupId" value={workspaceData.id} />
                <input type="text" name="title" placeholder="Resource Title (e.g. Chapter 3 Notes)" required className="w-full text-sm p-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                <input type="url" name="url" placeholder="https://..." required className="w-full text-sm p-2 border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                <button type="submit" className="w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors text-sm">
                  Add Resource
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Member Roster */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="text-blue-600" /> Study Partners ({workspaceData.memberProfiles.length})
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {workspaceData.memberProfiles.map((profile: any, index: number) => (
                <div key={index} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:border-blue-200 transition-colors bg-gray-50/50">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold uppercase shrink-0">
                      {profile.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-gray-900 truncate">
                        {profile.name} {workspaceData.created_by === profile.id && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Creator</span>}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                        <GraduationCap size={14} /> {profile.department} • {profile.skill_level}
                      </p>
                    </div>
                  </div>

                  {/* NEW: Report User Button (Don't let users report themselves) */}
                  {profile.id !== workspaceData.currentUserId && (
                    <form action={reportUser}>
                      <input type="hidden" name="reportedId" value={profile.id} />
                      <input type="hidden" name="groupId" value={workspaceData.id} />
                      <button type="submit" title="Report User" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <AlertTriangle size={18} />
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}