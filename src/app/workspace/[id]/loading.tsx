// src/app/workspace/[id]/loading.tsx
import { Loader2 } from 'lucide-react'

export default function LoadingWorkspace() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <h2 className="text-xl font-bold text-gray-700">Loading Workspace...</h2>
      <p className="text-gray-500">Decrypting study materials and fetching your squad.</p>
    </div>
  )
}