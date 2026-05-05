// src/app/groups/page.tsx
export const dynamic = 'force-dynamic';
import { getAvailableCourses } from '@/controllers/courseController'
import Link from 'next/link'
import { BookOpen, Users, ChevronRight } from 'lucide-react'

export default async function GroupsPage() {
  // Fetch the courses through our controller
  const courses = await getAvailableCourses();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <main className="max-w-4xl mx-auto space-y-8 mt-8">

        <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 w-fit transition-colors mb-6">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        
        {/* Header */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-blue-600" /> Browse Study Groups
          </h1>
          <p className="text-gray-600 mt-2">
            Select a course below to view active study groups, or create your own to start collaborating.
          </p>
        </div>

        {/* Course List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-700">Available Courses</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {courses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No courses found.</div>
            ) : (
              courses.map((course) => (
                <Link 
                  key={course.id} 
                  href={`/groups/${course.id}`}
                  className="flex items-center justify-between p-6 hover:bg-blue-50/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {course.code}
                      </h3>
                      <p className="text-sm text-gray-500">{course.name}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  )
}