'use client'

import React from 'react'
import { List, Avatar, Typography, Badge } from 'antd'
import { MessageOutlined, UserOutlined } from '@ant-design/icons'
import { ChatMessage } from '@/types'
import { formatDateTime } from '@/lib/utils'

const { Text } = Typography

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  onMessageClick?: (messageId: string) => void
}

interface MessagePreviewProps {
  message: ChatMessage
  isUnread: boolean
  currentUserId: string
  onClick?: () => void
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ 
  message, 
  isUnread, 
  currentUserId, 
  onClick 
}) => {
  const isOwnMessage = message.sender_id === currentUserId
  
  return (
    <List.Item
      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={onClick}
    >
      <List.Item.Meta
        avatar={
          <Badge dot={isUnread}>
            <Avatar 
              icon={<UserOutlined />} 
              className={isOwnMessage ? 'bg-blue-500' : 'bg-gray-500'}
            />
          </Badge>
        }
        title={
          <div className="flex items-center justify-between">
            <Text strong={isUnread}>
              {isOwnMessage ? 'You' : 'Other User'}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatDateTime(message.timestamp)}
            </Text>
          </div>
        }
        description={
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-gray-400" />
            <Text 
              className={`truncate ${isUnread ? 'font-medium' : ''}`}
              style={{ maxWidth: '200px' }}
            >
              {message.message}
            </Text>
          </div>
        }
      />
    </List.Item>
  )
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentUserId, 
  onMessageClick 
}) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageOutlined className="text-4xl text-gray-300 mb-4" />
        <Text className="text-gray-500">No messages yet</Text>
      </div>
    )
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={messages}
      renderItem={(message) => {
        const isUnread = !message.read_by.includes(currentUserId) && 
                        message.sender_id !== currentUserId
        
        return (
          <MessagePreview
            message={message}
            isUnread={isUnread}
            currentUserId={currentUserId}
            onClick={() => onMessageClick?.(message.id || '')}
          />
        )
      }}
    />
  )
}