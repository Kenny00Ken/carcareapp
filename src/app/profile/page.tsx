'use client'

import React, { useState } from 'react'
import { Card, Form, Input, Button, Avatar, Row, Col, Typography, Space, Divider, Badge, Tooltip, Statistic, message } from 'antd'
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined, 
  CameraOutlined, 
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  SafetyOutlined,
  StarFilled,
  CarOutlined,
  ToolOutlined,
  ShopOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { ImageUpload } from '@/components/common/ImageUpload'
import { AddressSelector } from '@/components/location/AddressSelector'
import { motion } from 'framer-motion'
import type { Address } from '@/types/location'

const { Title, Text, Paragraph } = Typography

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
      // Handle address object if present
      const processedValues = { ...values }
      if (values.address && typeof values.address === 'object') {
        const addressObj = values.address as Address
        processedValues.address = addressObj.formatted_address
        processedValues.location_data = {
          coordinates: addressObj.coordinates,
          address_components: addressObj.address_components,
          place_id: addressObj.place_id
        }
      }

      await updateUserProfile({
        ...processedValues,
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

  // Helper function to get role icon
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'CarOwner': return <CarOutlined className="text-blue-500" />
      case 'Mechanic': return <ToolOutlined className="text-green-500" />
      case 'Dealer': return <ShopOutlined className="text-purple-500" />
      default: return <UserOutlined />
    }
  }

  // Helper function to get role color
  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'CarOwner': return 'blue'
      case 'Mechanic': return 'green'
      case 'Dealer': return 'purple'
      default: return 'default'
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-4 sm:p-8 text-white"
        >
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div>
                <Title level={1} className="!text-white !mb-2 !text-2xl sm:!text-3xl">
                  Profile Settings
                </Title>
                <Paragraph className="!text-blue-100 !mb-0 text-sm sm:text-lg">
                  Manage your account information and preferences
                </Paragraph>
              </div>
              <div className="text-right">
                <Badge 
                  count={<CheckCircleOutlined className="text-green-400" />} 
                  offset={[-5, 5]}
                >
                  <Avatar
                    size={80}
                    src={profileImage}
                    icon={<UserOutlined />}
                    className="border-4 border-white/20 shadow-xl !w-14 !h-14 sm:!w-20 sm:!h-20"
                  />
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full blur-xl"></div>
        </motion.div>

        <Row gutter={[24, 24]}>
          {/* Profile Summary Card */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 dark:border dark:border-slate-600">
                <div className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="relative inline-block">
                    <Avatar
                      size={140}
                      src={profileImage}
                      icon={<UserOutlined />}
                      className="border-4 border-white shadow-2xl !w-20 !h-20 sm:!w-32 sm:!h-32"
                    />
                    <div className="absolute bottom-2 right-2">
                      <Badge 
                        status="success" 
                        dot 
                        className="w-4 h-4 border-2 border-white rounded-full"
                      />
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="space-y-3">
                    <div>
                      <Title level={3} className="!mb-1">
                        {user.name || 'User Name'}
                      </Title>
                      <Badge 
                        color={getRoleColor(user.role)} 
                        text={
                          <span className="text-sm font-medium">
                            {user.role?.replace('CarOwner', 'Car Owner')}
                          </span>
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <MailOutlined />
                      <Text type="secondary">{user.email || firebaseUser?.email}</Text>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <PhoneOutlined />
                        <Text type="secondary">{user.phone}</Text>
                      </div>
                    )}
                  </div>

                  {/* Profile Image Upload */}
                  <ImageUpload
                    value={profileImage || undefined}
                    onChange={handleImageUpload}
                    folder={`users/${user.id}/profile`}
                    buttonText="Change Photo"
                    className="w-full"
                  />

                  {/* Quick Stats */}
                  <div className="bg-white/80 dark:bg-slate-700/50 rounded-lg p-4 space-y-3">
                    <Title level={5} className="!mb-3 text-gray-700 dark:!text-gray-200">
                      Account Status
                    </Title>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Member Since"
                          value={user.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}
                          prefix={<CalendarOutlined />}
                          valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                          formatter={(value) => value?.toString() || 'N/A'}
                          className="dark:[&_.ant-statistic-content-value]:!text-blue-400 dark:[&_.ant-statistic-title]:!text-slate-300"
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Profile"
                          value="Verified"
                          prefix={<SafetyOutlined />}
                          valueStyle={{ fontSize: '14px', color: '#52c41a' }}
                          className="dark:[&_.ant-statistic-content-value]:!text-green-400 dark:[&_.ant-statistic-title]:!text-slate-300"
                        />
                      </Col>
                    </Row>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Profile Form Section */}
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card 
                className="shadow-lg border-0 dark:bg-slate-800 dark:border dark:border-slate-600"
                title={
                  <div className="flex items-center gap-2">
                    <EditOutlined className="text-blue-500" />
                    <span className="dark:text-slate-200">Personal Information</span>
                  </div>
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  className="space-y-4"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label={
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            <UserOutlined className="mr-2" />
                            Full Name
                          </span>
                        }
                        rules={[{ required: true, message: 'Please enter your name' }]}
                      >
                        <Input 
                          placeholder="Enter your full name"
                          size="large"
                          className="rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label={
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            <MailOutlined className="mr-2" />
                            Email Address
                          </span>
                        }
                        rules={[
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input 
                          placeholder="Enter your email"
                          size="large"
                          className="rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label={
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            <PhoneOutlined className="mr-2" />
                            Phone Number
                          </span>
                        }
                        rules={[{ required: true, message: 'Please enter your phone number' }]}
                      >
                        <Input 
                          placeholder="Enter your phone number"
                          size="large"
                          className="rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            {getRoleIcon(user.role)}
                            <span className="ml-2">Account Type</span>
                          </span>
                        }
                      >
                        <Input 
                          value={user.role?.replace('CarOwner', 'Car Owner')}
                          disabled
                          size="large"
                          className="rounded-lg bg-gray-50 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200"
                          suffix={
                            <Tooltip title="Account type cannot be changed">
                              <SafetyOutlined className="text-green-500" />
                            </Tooltip>
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="address"
                    label={
                      <span className="font-medium text-gray-700 dark:text-slate-300">
                        <EnvironmentOutlined className="mr-2" />
                        Address
                      </span>
                    }
                    rules={[{ required: true, message: 'Please enter your address' }]}
                  >
                    <AddressSelector
                      placeholder="Search for your address or use current location"
                      showCurrentLocation={true}
                      allowManualEntry={true}
                      onChange={(address) => {
                        form.setFieldValue('address', address)
                      }}
                    />
                  </Form.Item>

                  <Divider />

                  <Form.Item className="!mb-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          loading={loading}
                          size="large"
                          className="rounded-lg px-8 !w-full sm:!w-auto"
                          icon={<SaveOutlined />}
                        >
                          Update Profile
                        </Button>
                        <Button 
                          onClick={() => form.resetFields()}
                          size="large"
                          className="rounded-lg !w-full sm:!w-auto"
                        >
                          Reset Changes
                        </Button>
                      </div>
                      
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <Text type="secondary" className="text-xs sm:text-sm">
                          Last updated: {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}
                        </Text>
                      </div>
                    </div>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Account Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card 
            className="shadow-lg border-0 dark:bg-slate-800 dark:border dark:border-slate-600"
            title={
              <div className="flex items-center gap-2">
                <SafetyOutlined className="text-green-500" />
                <span className="dark:text-slate-200">Account Details</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
                  <CalendarOutlined className="text-xl sm:text-2xl text-blue-500 mb-2" />
                  <div>
                    <Text strong className="block text-gray-700 dark:text-slate-200 text-sm sm:text-base">Account Created</Text>
                    <Text type="secondary" className="text-xs sm:text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={8}>
                <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-slate-700 rounded-lg">
                  <CheckCircleOutlined className="text-xl sm:text-2xl text-green-500 mb-2" />
                  <div>
                    <Text strong className="block text-gray-700 dark:text-slate-200 text-sm sm:text-base">Profile Status</Text>
                    <Badge status="success" text="Verified & Active" />
                  </div>
                </div>
              </Col>
              
              <Col xs={24} sm={8}>
                <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-slate-700 rounded-lg">
                  <StarFilled className="text-xl sm:text-2xl text-purple-500 mb-2" />
                  <div>
                    <Text strong className="block text-gray-700 dark:text-slate-200 text-sm sm:text-base">Member Tier</Text>
                    <Badge color="purple" text="Standard Member" />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}