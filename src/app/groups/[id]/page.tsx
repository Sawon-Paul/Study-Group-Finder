// src/app/groups/[id]/page.tsx
import { getCourseDetails, getGroupsByCourse } from '@/controllers/groupController'
import Link from 'next/link'
import { Users, MapPin, Plus, ArrowLeft, Lock, Globe } from 'lucide-react'
import { notFound } from 'next/navigation'
import JoinButton from '@/components/JoinButton' // Import our new button

export default async function CourseGroupsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourseDetails(id);
  const groups = await getGroupsByCourse(id);

  if (!course) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-4xl mx-auto space-y-6 mt-8">
        <Link href="/groups" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 w-fit transition-colors">
          <ArrowLeft size={20} /> Back to Courses
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.code}</h1>
            <p className="text-gray-600 mt-1">{course.name}</p>
          </div>
          <Link href={`/groups/${id}/create`} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus size={20} /> Create Group
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Active Study Groups
          </h2>

          {groups.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
              No study groups yet. Be the first to start one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium ${group.type === 'Private' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {group.type === 'Private' ? <Lock size={12} /> : <Globe size={12} />}
                      {group.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <MapPin size={16} className="text-gray-400" />
                    {group.location_preference}
                  </div>

                  {/* USE THE NEW BUTTON COMPONENT */}
                  <JoinButton groupId={group.id} groupType={group.type} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}