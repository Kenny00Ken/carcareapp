'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from 'antd'
import { DatabaseService } from '@/services/database'
import { useAuth } from '@/contexts/AuthContext'

interface UnreadMessageBadgeProps {
  requestId: string
  children: React.ReactNode
  showZero?: boolean
}

export const UnreadMessageBadge: React.FC<UnreadMessageBadgeProps> = ({
  requestId,
  children,
  showZero = false
}) => {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!requestId || !user) return

    const loadUnreadCount = async () => {
      try {
        const count = await DatabaseService.getUnreadMessageCount(requestId, user.id)
        setUnreadCount(count)
      } catch (error) {
        console.error('Error loading unread count:', error)
      }
    }

    loadUnreadCount()

    // Subscribe to real-time updates
    const unsubscribe = DatabaseService.subscribeToMessages(requestId, (messages) => {
      const newUnreadCount = messages.filter(msg => 
        msg.sender_id !== user.id && !msg.read_by.includes(user.id)
      ).length
      setUnreadCount(newUnreadCount)
    })

    return unsubscribe
  }, [requestId, user])

  return (
    <Badge count={unreadCount} showZero={showZero} size="small">
      {children}
    </Badge>
  )
}