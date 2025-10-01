'use client'

import React from 'react'
import { AuthProvider } from './AuthContext'
import { ThemeProvider } from './ThemeContext'
import { NotificationProvider } from './NotificationContext'
import { App } from 'antd'
import { HelpAssistant } from '@/components/help'

interface ProvidersProps {
  children: React.ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <App>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            {children}
            <HelpAssistant />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </App>
  )
} 