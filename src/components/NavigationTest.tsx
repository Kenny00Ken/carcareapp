'use client'

import React from 'react'
import { Card, Typography, Tag, Space } from 'antd'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getDashboardRoute } from '@/utils/navigation'

const { Title, Text } = Typography

export const NavigationTest: React.FC = () => {
  const { user, firebaseUser, loading } = useAuth()
  const router = useRouter()

  const getNavigationStatus = () => {
    if (loading) return { status: 'Loading...', color: 'blue' }
    if (!firebaseUser) return { status: 'Not Authenticated', color: 'red' }
    if (!user) return { status: 'Authenticated, No Profile', color: 'orange' }
    if (!user.role) return { status: 'Profile Exists, No Role', color: 'orange' }
    
    const dashboardRoute = getDashboardRoute(user.role)
    return { 
      status: `Ready for ${user.role} Dashboard`, 
      color: 'green',
      route: dashboardRoute
    }
  }

  const navStatus = getNavigationStatus()

  return (
    <Card className="mb-4" size="small">
      <Title level={5}>🧭 Navigation Status</Title>
      <Space direction="vertical" size="small" className="w-full">
        <div className="flex items-center justify-between">
          <Text strong>Current Status:</Text>
          <Tag color={navStatus.color}>{navStatus.status}</Tag>
        </div>
        
        {navStatus.route && (
          <div className="flex items-center justify-between">
            <Text strong>Target Route:</Text>
            <Text code>{navStatus.route}</Text>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Text strong>Current Path:</Text>
          <Text code>{typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</Text>
        </div>

        {user && (
          <div className="flex items-center justify-between">
            <Text strong>User Role:</Text>
            <Tag color="blue">{user.role || 'No Role'}</Tag>
          </div>
        )}
      </Space>
    </Card>
  )
} 