// src/components/ReportButton.tsx
'use client'

import { AlertTriangle } from 'lucide-react'
import { reportUser } from '@/controllers/groupController'

export default function ReportButton({ reportedId, groupId }: { reportedId: string, groupId: string }) {
  async function handleReport() {
    const confirmReport = window.confirm("Are you sure you want to report this user to the admins?");
    if (confirmReport) {
      const formData = new FormData();
      formData.append('reportedId', reportedId);
      formData.append('groupId', groupId);
      
      await reportUser(formData);
      alert("Report submitted successfully. An admin will review this shortly.");
    }
  }

  return (
    <button onClick={handleReport} title="Report User" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
      <AlertTriangle size={18} />
    </button>
  )
}