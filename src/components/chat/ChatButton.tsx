'use client'

import React from 'react'
import { Button, Tooltip } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { Request } from '@/types'

interface ChatButtonProps {
  request: Request
  userRole: 'CarOwner' | 'Mechanic'
  size?: 'small' | 'middle' | 'large'
  type?: 'default' | 'primary' | 'link' | 'text'
  variant?: 'button' | 'icon-only'
  className?: string
  disabled?: boolean
  newTab?: boolean
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  request,
  userRole,
  size = 'small',
  type = 'default',
  variant = 'button',
  className = '',
  disabled = false,
  newTab = false
}) => {
  const router = useRouter()

  // Determine if chat is available
  const canChat = request.mechanic_id && request.owner_id
  const isDisabled = disabled || !canChat

  // Generate chat URL based on user role
  const chatUrl = userRole === 'CarOwner' 
    ? `/dashboard/car-owner/requests/${request.id}/chat`
    : `/dashboard/mechanic/requests/${request.id}/chat`

  const handleClick = () => {
    if (isDisabled) return

    if (newTab) {
      window.open(chatUrl, '_blank')
    } else {
      router.push(chatUrl)
    }
  }

  const getTooltipTitle = () => {
    if (!request.mechanic_id) {
      return 'Chat will be available once a mechanic is assigned'
    }
    return 'Open chat conversation'
  }

  if (variant === 'icon-only') {
    return (
      <Tooltip title={getTooltipTitle()}>
        <Button
          type={type}
          size={size}
          icon={<MessageOutlined />}
          onClick={handleClick}
          disabled={isDisabled}
          className={className}
        />
      </Tooltip>
    )
  }

  return (
    <Tooltip title={getTooltipTitle()}>
      <Button
        type={type}
        size={size}
        icon={<MessageOutlined />}
        onClick={handleClick}
        disabled={isDisabled}
        className={className}
      >
        Chat
      </Button>
    </Tooltip>
  )
}