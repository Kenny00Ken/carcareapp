'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { notification } from 'antd'
import { 
  CheckCircleOutlined, 
  InfoCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

interface NotificationOptions {
  title: string
  message: string
  duration?: number
}

interface NotificationContextType {
  showNotification: (type: NotificationType, options: NotificationOptions) => void
  showSuccess: (options: NotificationOptions) => void
  showInfo: (options: NotificationOptions) => void
  showWarning: (options: NotificationOptions) => void
  showError: (options: NotificationOptions) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification()

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
  }

  const showNotification = (type: NotificationType, options: NotificationOptions) => {
    api[type]({
      message: options.title,
      description: options.message,
      duration: options.duration || 4.5,
      icon: getIcon(type),
      placement: 'topRight',
    })
  }

  const showSuccess = (options: NotificationOptions) => {
    showNotification('success', options)
  }

  const showInfo = (options: NotificationOptions) => {
    showNotification('info', options)
  }

  const showWarning = (options: NotificationOptions) => {
    showNotification('warning', options)
  }

  const showError = (options: NotificationOptions) => {
    showNotification('error', options)
  }

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showInfo,
    showWarning,
    showError,
  }

  return (
    <NotificationContext.Provider value={value}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  )
} 