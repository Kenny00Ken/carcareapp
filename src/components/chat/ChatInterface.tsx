'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input, Button, Card, Typography, Space, Avatar, Spin, Alert, Badge, Tooltip, Empty } from 'antd'
import { 
  SendOutlined, 
  UserOutlined, 
  CheckOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { ChatMessage, Request, User } from '@/types'
import { useChat } from '@/services/chat'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateTime } from '@/lib/utils'

const { Text, Title } = Typography
const { TextArea } = Input

interface ChatInterfaceProps {
  request: Request
  otherUser?: User // The other participant (mechanic for car owner, car owner for mechanic)
}

interface MessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  showAvatar?: boolean
  currentUserId: string
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isOwnMessage, 
  showAvatar = true,
  currentUserId 
}) => {
  const isRead = message.read_by && message.read_by.length > 1 // More than just sender
  const isDelivered = message.read_by && (message.read_by.includes(currentUserId) || !isOwnMessage)
  
  // Format message timestamp
  const messageTime = message.timestamp ? formatDateTime(message.timestamp) : 'Just now'
  const isRecent = message.timestamp && (Date.now() - new Date(message.timestamp).getTime()) < 60000 // Less than 1 minute

  return (
    <div className={`flex gap-3 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isOwnMessage && showAvatar && (
        <Avatar 
          icon={<UserOutlined />} 
          size="small" 
          className="mt-1 flex-shrink-0"
          style={{ backgroundColor: '#1890ff' }}
        />
      )}
      
      <div className={`max-w-[70%] min-w-[100px] ${isOwnMessage ? 'order-1' : ''}`}>
        <div
          className={`
            p-3 rounded-2xl relative break-words shadow-sm
            ${isOwnMessage 
              ? 'bg-blue-500 text-white ml-auto' 
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
            }
            ${isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md'}
            transition-all duration-200 hover:shadow-md
          `}
        >
          <Text 
            className={`${isOwnMessage ? 'text-white' : 'text-gray-900 dark:text-gray-100'} leading-relaxed`}
            style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
          >
            {message.message}
          </Text>
        </div>
        
        <div className={`flex items-center gap-2 mt-1 ${isOwnMessage ? 'justify-end' : ''}`}>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {messageTime}
            {isRecent && <span className="ml-1 text-green-500">•</span>}
          </Text>
          
          {isOwnMessage && (
            <Tooltip title={isRead ? 'Read' : isDelivered ? 'Delivered' : 'Sent'}>
              <div className="flex items-center">
                {isRead ? (
                  <CheckCircleOutlined className="text-blue-400 text-xs" />
                ) : isDelivered ? (
                  <CheckOutlined className="text-gray-400 text-xs" />
                ) : (
                  <ClockCircleOutlined className="text-gray-300 text-xs" />
                )}
              </div>
            </Tooltip>
          )}
        </div>
      </div>
      
      {isOwnMessage && showAvatar && (
        <Avatar 
          icon={<UserOutlined />} 
          size="small" 
          className="mt-1 flex-shrink-0"
          style={{ backgroundColor: '#52c41a' }}
        />
      )}
    </div>
  )
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ request, otherUser }) => {
  const { user } = useAuth()
  const { messages, loading, sendMessage, unreadCount, error } = useChat(request.id || '', request)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesContainerRef.current
      if (container) {
        const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1
        
        // Only auto-scroll if user is already at the bottom or it's a new message
        if (isScrolledToBottom || messages.length === 1) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return

    const messageText = newMessage.trim()
    
    try {
      setSending(true)
      setRetryCount(0)
      await sendMessage(messageText)
      setNewMessage('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Error sending message:', err)
      setRetryCount(prev => prev + 1)
      
      // Show user-friendly error
      if (retryCount < 2) {
        // Auto-retry up to 2 times
        setTimeout(() => handleSendMessage(), 1000)
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Early return for no user
  if (!user) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Text type="secondary">Authenticating...</Text>
          </div>
        </div>
      </Card>
    )
  }

  // Early return for no request ID
  if (!request.id) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <Alert
          message="Chat Unavailable"
          description="This chat session is not available. Please try refreshing the page."
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
        />
      </Card>
    )
  }

  const isCarOwner = user.id === request.owner_id
  const chatPartnerName = isCarOwner 
    ? (request.mechanic?.name || otherUser?.name || 'Mechanic')
    : (request.owner?.name || otherUser?.name || 'Car Owner')
    
  const chatTitle = `Chat with ${chatPartnerName}`
  const carInfo = request.car ? `${request.car.make} ${request.car.model}` : 'Vehicle'

  const getOnlineStatus = () => {
    // This could be enhanced with real online status tracking
    return isCarOwner ? request.mechanic?.name : request.owner?.name
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar 
              icon={<UserOutlined />} 
              size="default"
              style={{ backgroundColor: isCarOwner ? '#1890ff' : '#52c41a' }}
            />
            <div>
              <Title level={4} className="!mb-0">
                {chatTitle}
              </Title>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {carInfo} • {request.title}
              </Text>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge count={unreadCount} className="animate-pulse" />
            )}
            <div className="flex items-center text-green-500">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <Text className="text-xs text-gray-500">Online</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && !loading && (
        <div className="p-4">
          <Alert
            message="Connection Issue"
            description={
              <div>
                <Text>{error}</Text>
                {retryCount > 0 && (
                  <div className="mt-2">
                    <Button 
                      size="small" 
                      type="link" 
                      onClick={() => window.location.reload()}
                      icon={<ExclamationCircleOutlined />}
                    >
                      Retry Connection
                    </Button>
                  </div>
                )}
              </div>
            }
            type="warning"
            showIcon
            closable
          />
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0 bg-gray-50 dark:bg-gray-900 chat-scrollbar chat-container"
        style={{ scrollBehavior: 'smooth' }}
      >
        {loading ? (
          <div className="flex flex-col justify-center items-center h-40 space-y-4">
            <Spin size="large" />
            <Text type="secondary">Loading conversation...</Text>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-4">
            <ExclamationCircleOutlined className="text-4xl text-red-400" />
            <div>
              <Text strong className="text-gray-600 dark:text-gray-300">
                Unable to load messages
              </Text>
              <br />
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Please check your connection and try again
              </Text>
            </div>
            <Button 
              type="primary" 
              size="small"
              onClick={() => window.location.reload()}
              icon={<ReloadOutlined />}
            >
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <MessageOutlined className="text-2xl text-blue-500" />
            </div>
            <div>
              <Text strong className="text-gray-600 dark:text-gray-300 text-lg">
                Start the conversation
              </Text>
              <br />
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Send a message to begin chatting with {chatPartnerName}
              </Text>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender_id === user.id
              const previousMessage = index > 0 ? messages[index - 1] : null
              const showAvatar = !previousMessage || previousMessage.sender_id !== message.sender_id
              
              return (
                <MessageItem
                  key={message.id || `msg-${index}`}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={showAvatar}
                  currentUserId={user.id}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg">
        <div className="flex space-x-2">
          <TextArea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${chatPartnerName}...`}
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={sending || !!error}
            className="flex-1 resize-none"
            style={{ border: 'none', boxShadow: 'none' }}
          />
          <Button
            type="primary"
            icon={sending ? <Spin size="small" /> : <SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={!newMessage.trim() || sending || !!error}
            size="large"
            className="px-6"
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </Text>
          {retryCount > 0 && (
            <Text className="text-xs text-orange-500">
              Retrying... ({retryCount}/2)
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}