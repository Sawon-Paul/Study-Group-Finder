// src/app/page.tsx
import Link from 'next/link'
import { Users, BookOpen, Target, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-extrabold text-blue-600 tracking-tight">StudyGroup Finder</div>
        <div className="flex gap-4">
          <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 transition-colors">
            Log In
          </Link>
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Never study <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">alone</span> again.
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Connect with classmates, form study groups for your specific courses, and crush your exams together. Built by students, for students.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 hover:shadow-lg transition-all">
              Get Started for Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Find Your Courses</h3>
            <p className="text-gray-600">Select the exact classes you are taking this semester to see available study groups.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Join a Squad</h3>
            <p className="text-gray-600">Browse open groups or request to join private ones based on your preferred study locations.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ace Your Exams</h3>
            <p className="text-gray-600">Coordinate meetups, share knowledge, and level up your academic skills together.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-500 text-sm mt-auto">
        <p>© {new Date().getFullYear()} StudyGroup Finder. Built for students.</p>
      </footer>
    </div>
  )
}