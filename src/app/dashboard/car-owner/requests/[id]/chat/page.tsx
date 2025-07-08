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

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [request, setRequest] = useState<Request | null>(null)
  const [mechanic, setMechanic] = useState<User | null>(null)
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

        // Verify user is authorized (owner or assigned mechanic)
        const isOwner = requestData.owner_id === user.id
        const isAssignedMechanic = requestData.mechanic_id === user.id
        
        if (!isOwner && !isAssignedMechanic) {
          setError('You are not authorized to view this chat')
          return
        }

        // Check if request has a mechanic assigned
        if (!requestData.mechanic_id) {
          setError('No mechanic assigned to this request yet')
          return
        }

        // Load mechanic details
        const mechanicData = await DatabaseService.getUser(requestData.mechanic_id)
        
        setRequest(requestData)
        setMechanic(mechanicData)
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
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="w-full sm:w-auto overflow-x-auto">
            <Breadcrumb
              className="whitespace-nowrap"
              items={[
                {
                  href: '/dashboard/car-owner',
                  title: <HomeOutlined />
                },
                {
                  href: '/dashboard/car-owner/requests',
                  title: <span className="text-xs sm:text-sm">Requests</span>
                },
                {
                  href: `/dashboard/car-owner/requests/${requestId}`,
                  title: <span className="text-xs sm:text-sm truncate max-w-32">{request.title}</span>
                },
                {
                  title: (
                    <span className="flex items-center gap-1 text-xs sm:text-sm">
                      <MessageOutlined />
                      Chat
                    </span>
                  )
                }
              ]}
            />
          </div>
          
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
            className="!w-full sm:!w-auto"
          >
            <span className="hidden sm:inline">Back</span>
            <span className="sm:hidden">Back to Request</span>
          </Button>
        </div>

        {/* Request Summary */}
        <Card size="small" className="mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex-1">
              <Title level={4} className="!mb-1 !text-base sm:!text-lg">
                {request.title}
              </Title>
              <Text className="text-gray-500 text-xs sm:text-sm">
                {request.car ? `${request.car.make} ${request.car.model}` : 'Vehicle'} • 
                Status: <span className="font-medium capitalize">{request.status?.replace('_', ' ')}</span>
              </Text>
            </div>
            
            {mechanic && (
              <div className="text-left sm:text-right">
                <Text strong className="text-sm">Mechanic</Text>
                <br />
                <Text className="text-sm">{mechanic.name}</Text>
              </div>
            )}
          </div>
        </Card>

        {/* Chat Interface */}
        <Card styles={{ body: { padding: 0 } }} className="shadow-lg !mx-0">
          <div className="h-[60vh] sm:h-[70vh]">
            <ChatInterface 
              request={request} 
              otherUser={mechanic || undefined}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 