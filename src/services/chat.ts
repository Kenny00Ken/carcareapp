'use client'

import { DatabaseService } from './database'
import { ChatMessage, User, Request } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useCallback } from 'react'

export interface ChatContextType {
  messages: ChatMessage[]
  loading: boolean
  sendMessage: (message: string) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  unreadCount: number
  error: string | null
}

export class ChatService {
  static async sendMessage(
    requestId: string,
    senderId: string,
    senderType: 'CarOwner' | 'Mechanic',
    message: string
  ): Promise<string> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty')
    }

    return await DatabaseService.sendMessage({
      request_id: requestId,
      sender_id: senderId,
      sender_type: senderType,
      message: message.trim(),
      read_by: [senderId] // Sender has automatically read their own message
    })
  }

  static async getMessages(requestId: string): Promise<ChatMessage[]> {
    return await DatabaseService.getMessages(requestId)
  }

  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    return await DatabaseService.markMessageAsRead(messageId, userId)
  }

  static async getUnreadCount(requestId: string, userId: string): Promise<number> {
    return await DatabaseService.getUnreadMessageCount(requestId, userId)
  }

  static subscribeToMessages(
    requestId: string,
    callback: (messages: ChatMessage[]) => void
  ) {
    return DatabaseService.subscribeToMessages(requestId, callback)
  }

  static async markAllMessagesAsRead(requestId: string, userId: string): Promise<void> {
    const messages = await this.getMessages(requestId)
    const unreadMessages = messages.filter(msg => 
      msg.sender_id !== userId && !msg.read_by.includes(userId)
    )

    // Mark all unread messages as read
    await Promise.all(
      unreadMessages.map(msg => 
        msg.id ? this.markMessageAsRead(msg.id, userId) : Promise.resolve()
      )
    )
  }
}

// React Hook for Chat Functionality
export function useChat(requestId: string, request?: Request): ChatContextType {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Determine sender type based on user role and request
  const getSenderType = useCallback((): 'CarOwner' | 'Mechanic' => {
    if (!user || !request) return 'CarOwner'
    
    if (user.id === request.owner_id) return 'CarOwner'
    if (user.id === request.mechanic_id) return 'Mechanic'
    
    // Fallback based on user role
    return user.role === 'Mechanic' ? 'Mechanic' : 'CarOwner'
  }, [user, request])

  // Load initial messages
  useEffect(() => {
    if (!requestId || !user) {
      setLoading(false)
      return
    }

    const loadMessages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Loading messages timed out')), 10000)
        )
        
        const [initialMessages, initialUnreadCount] = await Promise.race([
          Promise.all([
            ChatService.getMessages(requestId),
            ChatService.getUnreadCount(requestId, user.id)
          ]),
          timeoutPromise
        ]) as [ChatMessage[], number]
        
        setMessages(initialMessages || [])
        setUnreadCount(initialUnreadCount || 0)
      } catch (err) {
        console.error('Error loading messages:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        
        if (errorMessage.includes('timeout')) {
          setError('Connection timeout. Please check your internet connection.')
        } else if (errorMessage.includes('permission')) {
          setError('Permission denied. Please refresh the page and try again.')
        } else if (errorMessage.includes('index')) {
          setError('Database configuration issue. Please contact support.')
        } else {
          setError('Failed to load messages. Please try again.')
        }
        
        // Set empty defaults to allow user to still send messages
        setMessages([])
        setUnreadCount(0)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [requestId, user])

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!requestId || !user) return

    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = ChatService.subscribeToMessages(requestId, (updatedMessages) => {
        try {
          setMessages(updatedMessages || [])
          setError(null) // Clear any previous errors when messages load successfully
          
          // Update unread count
          const newUnreadCount = updatedMessages.filter(msg => 
            msg.sender_id !== user.id && 
            msg.read_by && 
            !msg.read_by.includes(user.id)
          ).length
          setUnreadCount(newUnreadCount)
        } catch (err) {
          console.error('Error processing message updates:', err)
        }
      })
    } catch (err) {
      console.error('Error setting up message subscription:', err)
      setError('Failed to connect to real-time updates')
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch (err) {
          console.error('Error unsubscribing from messages:', err)
        }
      }
    }
  }, [requestId, user])

  // Mark messages as read when user views the chat
  useEffect(() => {
    if (!requestId || !user || messages.length === 0) return

    const markAsRead = async () => {
      try {
        await ChatService.markAllMessagesAsRead(requestId, user.id)
      } catch (err) {
        console.error('Error marking messages as read:', err)
      }
    }

    // Mark as read after a short delay to ensure user is actually viewing
    const timer = setTimeout(markAsRead, 1000)
    return () => clearTimeout(timer)
  }, [messages, requestId, user])

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!user || !requestId) {
      throw new Error('User not authenticated or request ID missing')
    }

    try {
      setError(null)
      await ChatService.sendMessage(
        requestId,
        user.id,
        getSenderType(),
        message
      )
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
      throw err
    }
  }, [user, requestId, getSenderType])

  const markAsRead = useCallback(async (messageId: string): Promise<void> => {
    if (!user) return

    try {
      await ChatService.markMessageAsRead(messageId, user.id)
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }, [user])

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    unreadCount,
    error
  }
}