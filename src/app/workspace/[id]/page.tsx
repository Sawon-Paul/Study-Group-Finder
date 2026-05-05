// src/app/workspace/[id]/page.tsx
import { getGroupWorkspaceData, resolveRequest } from '@/controllers/groupController'
import Link from 'next/link'
import { ArrowLeft, Users, MapPin, BookOpen, GraduationCap, Paperclip, Check, X, Calendar } from 'lucide-react'
import { notFound } from 'next/navigation'
import { addResource } from '@/controllers/groupController'
import ReportButton from '@/components/ReportButton'

export const dynamic = 'force-dynamic';

export default async function GroupWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspaceData = await getGroupWorkspaceData(id);

  if (!workspaceData) notFound();
  const course = workspaceData.courses as any;
  const isCreator = workspaceData.created_by === workspaceData.currentUserId;
  const createdDate = new Date(workspaceData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-5xl mx-auto space-y-6 mt-8">
        
        <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 w-fit transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        {/* Group Header Banner */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/50 rounded-full text-sm font-medium backdrop-blur-sm">
                {course.code} • {workspaceData.type} Group
              </span>
              <span className="text-blue-200 text-sm flex items-center gap-1">
                <Calendar size={14} /> Created {createdDate}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{workspaceData.name}</h1>
            <p className="text-blue-100 flex items-center gap-2 text-lg">
              <BookOpen size={20} /> {course.name}
            </p>
          </div>
        </div>

        {/* ADMIN PANEL */}
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
                  </div>
                  <div className="flex gap-2">
                    <form action={resolveRequest}>
                      <input type="hidden" name="requestId" value={req.requestId} />
                      <input type="hidden" name="userId" value={req.userId} />
                      <input type="hidden" name="groupId" value={workspaceData.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"><Check size={18}/></button>
                    </form>
                    <form action={resolveRequest}>
                      <input type="hidden" name="requestId" value={req.requestId} />
                      <input type="hidden" name="action" value="reject" />
                      <button className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"><X size={18}/></button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Location
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg text-gray-700 font-medium text-center">
                {workspaceData.location_preference}
              </div>
            </div>

            {/* RESOURCE SHARING WITH FILE UPLOAD */}
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
              {workspaceData.resources.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No files shared yet.</p>
              ) : (
                workspaceData.resources.map((res: any) => (
                  <div key={res.id} className="group relative flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all">
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-blue-700 truncate">{res.title}</p>
                      <p className="text-xs text-gray-500 mt-1">Shared by {res.uploaderName}</p>
                    </a>
                    
                    {/* ONLY show the delete button if the logged-in user uploaded this specific file */}
                    {res.user_id === workspaceData.currentUserId && (
                      <form action={deleteResource} className="ml-2">
                        <input type="hidden" name="resourceId" value={res.id} />
                        <input type="hidden" name="fileUrl" value={res.url} />
                        <input type="hidden" name="groupId" value={workspaceData.id} />
                        <button type="submit" title="Delete File" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                          <X size={16} /> {/* Make sure 'X' is imported from 'lucide-react' at the top */}
                        </button>
                      </form>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Member Roster */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="text-blue-600" /> Study Partners
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {workspaceData.memberProfiles.map((profile: any, index: number) => (
                <div key={index} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:border-blue-200 transition-colors bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold uppercase shrink-0">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {profile.name} {workspaceData.created_by === profile.id && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Creator</span>}
                      </h3>
                      <p className="text-sm text-gray-500">{profile.department} • {profile.skill_level}</p>
                    </div>
                  </div>
                  {/* Interactive Report Button */}
                  {profile.id !== workspaceData.currentUserId && (
                    <ReportButton reportedId={profile.id} groupId={workspaceData.id} />
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