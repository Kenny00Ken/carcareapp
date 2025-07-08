'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Typography, Row, Col, Form, Input, Space, Avatar, message } from 'antd'
import { CarOutlined, ToolOutlined, ShopOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { redirectToDashboard } from '@/utils/navigation'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

const { Title, Paragraph } = Typography

interface FormValues {
  name: string
  phone: string
  address: string
  specialization?: string
}

export default function RoleSelectionPage() {
  const { user, firebaseUser, updateUserProfile } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  
  // Handle navigation for users who already have roles
  useAuthRedirect({
    redirectOnAuth: false // Don't auto-redirect, we'll handle it manually
  })

  // Debug user state and handle existing users
  React.useEffect(() => {
    console.log('RoleSelection - user:', user)
    console.log('RoleSelection - firebaseUser:', firebaseUser)
    
    // If user already has a role, redirect them to their dashboard
    if (user && user.role) {
      console.log('User already has role:', user.role, 'redirecting to dashboard')
      redirectToDashboard(router, user.role)
    }
  }, [user, firebaseUser, router])
  //chekin
  const handleRoleSelect = async (role: string, location?: string) => {
    setSelectedRole(role as UserRole)
  }

  const handleSubmit = async (values: FormValues) => {
    if (!selectedRole || !firebaseUser) {
      console.error('Missing selectedRole or firebaseUser')
      return
    }

    try {
      setLoading(true)
      
      await updateUserProfile({
        name: values.name,
        phone: values.phone,
        address: values.address,
        role: selectedRole,
        email: firebaseUser.email || ''
      })
      
      // Navigate to appropriate dashboard
      const dashboardRoutes = {
        CarOwner: '/dashboard/car-owner',
        Mechanic: '/dashboard/mechanic', 
        Dealer: '/dashboard/dealer'
      }
      router.push(dashboardRoutes[selectedRole])
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const roleCards = [
    {
      role: 'CarOwner' as UserRole,
      title: 'Car Owner',
      icon: <CarOutlined className="text-4xl text-blue-600" />,
      description: 'Submit repair requests, track vehicle maintenance, and connect with trusted mechanics.',
      features: ['Submit repair requests', 'Track maintenance history', 'View cost analytics', 'Receive real-time updates']
    },
    {
      role: 'Mechanic' as UserRole,
      title: 'Mechanic',
      icon: <ToolOutlined className="text-4xl text-green-600" />,
      description: 'Claim repair requests, provide diagnoses, and manage your service workflow.',
      features: ['Claim repair requests', 'Create detailed diagnoses', 'Browse spare parts', 'Manage service history']
    },
    {
      role: 'Dealer' as UserRole,
      title: 'Parts Dealer',
      icon: <ShopOutlined className="text-4xl text-purple-600" />,
      description: 'List vehicle parts, manage inventory, and connect with mechanics for sales.',
      features: ['Manage parts inventory', 'Process transactions', 'View sales analytics', 'Connect with mechanics']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <Title level={1} className="!mb-4 !text-2xl sm:!text-3xl lg:!text-4xl">Choose Your Role</Title>
          <Typography.Text className="text-gray-600 !text-sm sm:!text-base">
            That&apos;s all the details we need for now. Let&apos;s get you connected to the automotive community in Ghana!
          </Typography.Text>
        </div>

        {!selectedRole ? (
          <Row gutter={[16, 16]} className="sm:gutter-24">
            {roleCards.map((roleCard) => (
              <Col xs={24} sm={12} lg={8} key={roleCard.role}>
                <Card
                  className={`!h-full cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === roleCard.role ? 'border-2 !border-blue-500' : ''
                  }`}
                  onClick={() => handleRoleSelect(roleCard.role)}
                >
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl">
                      {React.cloneElement(roleCard.icon, {
                        className: roleCard.icon.props.className.replace('text-4xl', 'text-3xl sm:text-4xl')
                      })}
                    </div>
                    <Title level={3} className="!mt-3 sm:!mt-4 !mb-2 !text-lg sm:!text-xl">{roleCard.title}</Title>
                    <Paragraph className="text-gray-600 dark:text-gray-300 !text-sm sm:!text-base">
                      {roleCard.description}
                    </Paragraph>
                  </div>
                  <div className="space-y-2">
                    {roleCard.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="primary"
                    block
                    size="large"
                    className="!mt-4 sm:!mt-6 !h-12"
                    onClick={() => handleRoleSelect(roleCard.role)}
                  >
                    Select {roleCard.title}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <div className="text-center mb-6">
                <Title level={3} className="!text-lg sm:!text-xl">Complete Your Profile</Title>
                <Paragraph className="!text-sm sm:!text-base">You selected: <strong>{selectedRole}</strong></Paragraph>
              </div>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  email: firebaseUser?.email || '',
                  phone: firebaseUser?.phoneNumber || '',
                }}
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Enter your full name" 
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input 
                    prefix={<PhoneOutlined />} 
                    placeholder="Enter your phone number" 
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Enter your email (optional)" 
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Please enter your address' }]}
                >
                  <Input.TextArea 
                    placeholder="Enter your address"
                    rows={3}
                    size="large"
                  />
                </Form.Item>

                <Space className="w-full" direction="vertical">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    size="large"
                    className="!h-12"
                  >
                    Complete Setup
                  </Button>
                  <Button
                    type="text"
                    block
                    size="large"
                    onClick={() => setSelectedRole(null)}
                    className="!h-12"
                  >
                    ← Back to role selection
                  </Button>
                </Space>
              </Form>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 