// src/components/JoinButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { joinGroup, checkMembership } from '@/controllers/groupController'

export default function JoinButton({ groupId, groupType }: { groupId: string, groupType: string }) {
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMembership(groupId).then((res) => {
      setIsMember(res)
      setLoading(false)
    })
  }, [groupId])

  async function handleJoin() {
    if (groupType === 'Private') {
      alert("Request sent to group leader!")
      return
    }
    
    try {
      setLoading(true)
      await joinGroup(groupId)
      setIsMember(true)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="w-full py-2 bg-gray-100 rounded-lg animate-pulse" />

  return (
    <button 
      onClick={handleJoin}
      disabled={isMember}
      className={`w-full py-2 font-medium rounded-lg border transition-colors ${
        isMember 
        ? 'bg-green-50 text-green-600 border-green-200 cursor-default' 
        : 'bg-gray-50 text-blue-600 border-gray-200 hover:bg-blue-50'
      }`}
    >
      {isMember ? 'You are a Member' : groupType === 'Private' ? 'Request to Join' : 'Join Group'}
    </button>
  )
}