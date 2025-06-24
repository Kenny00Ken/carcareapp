'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Typography, Row, Col, Form, Input, Space } from 'antd'
import { CarOutlined, ToolOutlined, ShopOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { redirectToDashboard } from '@/utils/navigation'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

const { Title, Paragraph } = Typography

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

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
  }

  const handleSubmit = async (values: any) => {
    if (!selectedRole || !firebaseUser) {
      console.error('Missing selectedRole or firebaseUser')
      return
    }

    setLoading(true)
    try {
      console.log('Submitting role selection:', selectedRole, values)
      
      await updateUserProfile({
        role: selectedRole,
        name: values.name,
        phone: firebaseUser.phoneNumber || values.phone,
        email: firebaseUser.email || values.email,
        address: values.address,
        created_at: new Date().toISOString(),
      })

      console.log('Profile updated successfully, redirecting immediately...')

      // Immediate redirect to dashboard
      redirectToDashboard(router, selectedRole)
      
    } catch (error) {
      console.error('Error updating profile:', error)
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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Title level={1} className="!mb-4">Choose Your Role</Title>
          <Paragraph className="!text-lg text-gray-600 dark:text-gray-300">
            Select how you'd like to use Car Care Connect
          </Paragraph>
        </div>

        {!selectedRole ? (
          <Row gutter={[24, 24]}>
            {roleCards.map((roleCard) => (
              <Col xs={24} lg={8} key={roleCard.role}>
                <Card
                  className={`!h-full cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === roleCard.role ? 'border-2 !border-blue-500' : ''
                  }`}
                  onClick={() => handleRoleSelect(roleCard.role)}
                >
                  <div className="text-center mb-6">
                    {roleCard.icon}
                    <Title level={3} className="!mt-4 !mb-2">{roleCard.title}</Title>
                    <Paragraph className="text-gray-600 dark:text-gray-300">
                      {roleCard.description}
                    </Paragraph>
                  </div>
                  <div className="space-y-2">
                    {roleCard.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="primary"
                    block
                    className="!mt-6"
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
                <Title level={3}>Complete Your Profile</Title>
                <Paragraph>You selected: <strong>{selectedRole}</strong></Paragraph>
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
                  <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter your email (optional)" />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Please enter your address' }]}
                >
                  <Input.TextArea 
                    placeholder="Enter your address"
                    rows={3}
                  />
                </Form.Item>

                <Space className="w-full" direction="vertical">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    size="large"
                  >
                    Complete Setup
                  </Button>
                  <Button
                    type="text"
                    block
                    onClick={() => setSelectedRole(null)}
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