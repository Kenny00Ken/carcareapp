'use client'

import React from 'react'
import { Card, Typography, Tag } from 'antd'

const { Title, Text } = Typography

import { useAuth } from '@/contexts/AuthContext'

export const FirebaseDebug: React.FC = () => {
  const { user, firebaseUser, loading } = useAuth()
  
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  return (
    <Card className="mb-4">
      <Title level={4}>Firebase Configuration & Auth Debug</Title>
      
      {/* Config Status */}
      <div className="mb-4">
        <Text strong>Configuration:</Text>
        <div className="space-y-1 mt-2">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <Text className="w-32">{key}:</Text>
              <Tag color={value ? 'green' : 'red'}>
                {value ? '✓ Loaded' : '✗ Missing'}
              </Tag>
              {value && <Text code className="text-xs">{String(value).substring(0, 20)}...</Text>}
            </div>
          ))}
        </div>
      </div>

      {/* Auth Status */}
      <div>
        <Text strong>Authentication Status:</Text>
        <div className="space-y-1 mt-2">
          <div className="flex items-center space-x-2">
            <Text className="w-32">Loading:</Text>
            <Tag color={loading ? 'blue' : 'green'}>{loading ? 'Yes' : 'No'}</Tag>
          </div>
          <div className="flex items-center space-x-2">
            <Text className="w-32">Firebase User:</Text>
            <Tag color={firebaseUser ? 'green' : 'red'}>
              {firebaseUser ? `✓ ${firebaseUser.email}` : '✗ Not signed in'}
            </Tag>
          </div>
          <div className="flex items-center space-x-2">
            <Text className="w-32">App User:</Text>
            <Tag color={user ? 'green' : 'orange'}>
              {user ? `✓ ${user.name} (${user.role})` : '⚠ Profile incomplete'}
            </Tag>
          </div>
        </div>
      </div>
    </Card>
  )
} 