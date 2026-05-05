// src/components/JoinButton.tsx
'use client'

import { useState, useEffect } from 'react'
import { joinGroup, checkMembership, sendJoinRequest } from '@/controllers/groupController'

export default function JoinButton({ groupId, groupType }: { groupId: string, groupType: string }) {
  const [status, setStatus] = useState<'none' | 'member' | 'pending'>('none')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkMembership(groupId).then((res) => {
      if (res.isMember) setStatus('member')
      else if (res.isPending) setStatus('pending')
      setLoading(false)
    })
  }, [groupId])

  async function handleJoin() {
    try {
      setLoading(true)
      if (groupType === 'Private') {
        await sendJoinRequest(groupId)
        setStatus('pending')
      } else {
        await joinGroup(groupId)
        setStatus('member')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="w-full py-2 bg-gray-100 rounded-lg animate-pulse" />

  if (status === 'member') {
    return <button disabled className="w-full py-2 font-medium rounded-lg border bg-green-50 text-green-600 border-green-200 cursor-default">You are a Member</button>
  }
  
  if (status === 'pending') {
    return <button disabled className="w-full py-2 font-medium rounded-lg border bg-amber-50 text-amber-600 border-amber-200 cursor-default">Request Pending...</button>
  }

  return (
    <button onClick={handleJoin} className="w-full py-2 font-medium rounded-lg border bg-gray-50 text-blue-600 border-gray-200 hover:bg-blue-50 transition-colors">
      {groupType === 'Private' ? 'Request to Join' : 'Join Group'}
    </button>
  )
}