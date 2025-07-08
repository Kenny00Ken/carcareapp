'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Typography, Spin, Alert, Button, Breadcrumb } from 'antd'
import { ArrowLeftOutlined, HomeOutlined, MessageOutlined } from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { DatabaseService } from '@/services/database'
import { Request, User } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const { Title, Text } = Typography

export default function MechanicChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [request, setRequest] = useState<Request | null>(null)
  const [carOwner, setCarOwner] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestId = params.id as string

  useEffect(() => {
    const loadRequestData = async () => {
      if (!requestId || !user) return

      try {
        setLoading(true)
        setError(null)

        // Load request details
        const requestData = await DatabaseService.getRequest(requestId)
        if (!requestData) {
          setError('Request not found')
          return
        }

        // Verify user is the mechanic assigned to this request or request is claimed by this mechanic
        if (requestData.mechanic_id !== user.id && requestData.status === 'pending') {
          setError('You are not authorized to view this chat. Request must be claimed first.')
          return
        }
        
        // Allow access if request is claimed by this mechanic
        if (requestData.mechanic_id !== user.id && requestData.status !== 'pending') {
          setError('You are not authorized to view this chat')
          return
        }

        // Load car owner details
        const ownerData = await DatabaseService.getUser(requestData.owner_id)
        
        setRequest(requestData)
        setCarOwner(ownerData)
      } catch (err) {
        console.error('Error loading request data:', err)
        setError('Failed to load chat data')
      } finally {
        setLoading(false)
      }
    }

    loadRequestData()
  }, [requestId, user])

  if (loading) {
    return (
      <DashboardLayout activeKey="requests">
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout activeKey="requests">
        <div className="max-w-2xl mx-auto">
          <Alert
            message="Chat Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => router.back()}>
                Go Back
              </Button>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout activeKey="requests">
        <div className="max-w-2xl mx-auto">
          <Alert
            message="Request Not Found"
            description="The requested chat could not be found."
            type="warning"
            showIcon
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="requests">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              {
                href: '/dashboard/mechanic',
                title: <HomeOutlined />
              },
              {
                href: '/dashboard/mechanic/requests',
                title: 'Requests'
              },
              {
                href: `/dashboard/mechanic/requests/${requestId}`,
                title: request.title
              },
              {
                title: (
                  <span className="flex items-center gap-2">
                    <MessageOutlined />
                    Chat
                  </span>
                )
              }
            ]}
          />
          
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>

        {/* Request Summary */}
        <Card size="small" className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Title level={4} className="!mb-1">
                {request.title}
              </Title>
              <Text className="text-gray-500">
                {request.car ? `${request.car.make} ${request.car.model}` : 'Vehicle'} • 
                Status: <span className="font-medium capitalize">{request.status?.replace('_', ' ')}</span>
              </Text>
            </div>
            
            {carOwner && (
              <div className="text-right">
                <Text strong>Car Owner</Text>
                <br />
                <Text>{carOwner.name}</Text>
              </div>
            )}
          </div>
        </Card>

        {/* Chat Interface */}
        <Card styles={{ body: { padding: 0 } }} className="shadow-lg">
          <ChatInterface 
            request={request} 
            otherUser={carOwner || undefined}
          />
        </Card>
      </div>
    </DashboardLayout>
  )
} 