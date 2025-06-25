'use client'

import React, { useState } from 'react'
import { Card, Form, Input, Button, Select, Avatar, Upload, Row, Col, Typography, Space, Divider, message } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { ImageUpload } from '@/components/common/ImageUpload'
import { StorageService } from '@/services/storage'

const { Title, Text } = Typography

export default function ProfilePage() {
  const { user, firebaseUser, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email || firebaseUser?.email,
        phone: user.phone,
        address: user.address,
      })
      setProfileImage(firebaseUser?.photoURL || null)
    }
  }, [user, firebaseUser, form])

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!user) return

    setLoading(true)
    try {
      await updateUserProfile({
        ...values,
        updated_at: new Date().toISOString(),
      })
      message.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      message.error('Failed to update profile')
    }
    setLoading(false)
  }

  const handleImageUpload = async (url: string | null) => {
    setProfileImage(url)
    // Optionally update the profile image in the database
    if (url && user) {
      try {
        await updateUserProfile({
          profile_image: url,
          updated_at: new Date().toISOString(),
        })
        message.success('Profile image updated!')
      } catch (error) {
        console.error('Error updating profile image:', error)
        message.error('Failed to update profile image')
      }
    }
  }

  if (!user) {
    return (
      <DashboardLayout activeKey="profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Title level={2}>Profile Settings</Title>
          <Text type="secondary">
            Manage your account information and preferences
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Image Section */}
          <Col xs={24} lg={8}>
            <Card>
              <div className="text-center space-y-4">
                <Avatar
                  size={120}
                  src={profileImage}
                  icon={<UserOutlined />}
                  className="mb-4"
                />
                <div>
                  <Title level={4}>{user.name}</Title>
                  <Text type="secondary" className="capitalize">
                    {user.role?.replace('CarOwner', 'Car Owner')}
                  </Text>
                </div>
                
                <ImageUpload
                  value={profileImage || undefined}
                  onChange={handleImageUpload}
                  folder={`users/${user.id}/profile`}
                  buttonText="Change Photo"
                  className="w-full"
                />
              </div>
            </Card>
          </Col>

          {/* Profile Form Section */}
          <Col xs={24} lg={16}>
            <Card>
              <Title level={4}>Personal Information</Title>
              <Divider />
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-4"
              >
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
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
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />} 
                        placeholder="Enter your email"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12}>
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
                  </Col>
                  
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Role"
                    >
                      <Input 
                        value={user.role?.replace('CarOwner', 'Car Owner')}
                        disabled
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: 'Please enter your address' }]}
                >
                  <Input.TextArea 
                    placeholder="Enter your full address"
                    rows={3}
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      size="large"
                    >
                      Update Profile
                    </Button>
                    <Button 
                      onClick={() => form.resetFields()}
                      size="large"
                    >
                      Reset
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Account Information */}
        <Card>
          <Title level={4}>Account Information</Title>
          <Divider />
          
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <Text strong>Account Created:</Text>
                <br />
                <Text type="secondary">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12}>
              <div className="space-y-2">
                <Text strong>Last Updated:</Text>
                <br />
                <Text type="secondary">
                  {user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </DashboardLayout>
  )
} 