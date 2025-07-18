'use client'

import React, { useState } from 'react'
import { Card, Form, Input, Button, Avatar, Row, Col, Typography, Space, Divider, Badge, Tooltip, Statistic, message, Select, Switch } from 'antd'
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
  ShopOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ExperimentFilled
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { ImageUpload } from '@/components/common/ImageUpload'
import { AddressSelector } from '@/components/location/AddressSelector'
import { motion } from 'framer-motion'
import type { Address, GeolocationCoords } from '@/types/location'
import type { User } from '@/types'
import { SERVICE_TYPES, VEHICLE_BRANDS, EXPERIENCE_LEVELS, CERTIFICATIONS } from '@/constants/mechanic'

const { Title, Text, Paragraph } = Typography

// Helper function to remove undefined fields recursively
const removeUndefinedFields = <T,>(obj: T): T | undefined => {
  if (obj === null) {
    return null as T
  }
  
  if (obj === undefined) {
    return undefined
  }
  
  if (Array.isArray(obj)) {
    const cleanedArray = obj.map(removeUndefinedFields).filter(item => item !== undefined)
    return cleanedArray.length > 0 ? (cleanedArray as T) : undefined
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const cleaned: Record<string, unknown> = {}
    let hasValidFields = false
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = removeUndefinedFields(value)
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue
          hasValidFields = true
        }
      }
    }
    
    return hasValidFields ? (cleaned as T) : undefined
  }
  
  return obj
}

interface ProfileFormValues {
  name: string
  email: string
  phone: string
  address: Address | string
  mechanic_specializations?: {
    service_types: string[]
    vehicle_brands: string[]
    experience_years?: number
    certifications?: string[]
    emergency_services?: boolean
  }
}

// Type guard for Address objects
const isAddressObject = (address: unknown): address is Address => {
  return typeof address === 'object' && 
         address !== null && 
         'formatted_address' in address &&
         'coordinates' in address
}

export default function ProfilePage() {
  const { user, firebaseUser, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null)
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (user) {
      // Reconstruct address object from user data if location_data exists
      let addressValue: Address | string | null = null
      
      if (user.location_data && user.location_data.coordinates) {
        // Create Address object from stored location_data
        addressValue = {
          formatted_address: user.address || '',
          coordinates: user.location_data.coordinates,
          address_components: user.location_data.address_components,
          place_id: user.location_data.place_id,
          city: user.location_data.city,
          country: user.location_data.country
        }
        setCurrentAddress(addressValue)
      } else if (user.address) {
        // Handle legacy string addresses
        addressValue = user.address
      }

      form.setFieldsValue({
        name: user.name,
        email: user.email || firebaseUser?.email,
        phone: user.phone,
        address: addressValue,
        mechanic_specializations: user.mechanic_specializations || {
          service_types: [],
          vehicle_brands: [],
          experience_years: 1,
          certifications: [],
          emergency_services: false
        }
      })
      setProfileImage(firebaseUser?.photoURL || null)
    }
  }, [user, firebaseUser, form])

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user) return

    setLoading(true)
    try {
      // Handle address object if present
      const processedValues = { ...values }
      if (values.address && isAddressObject(values.address)) {
        const addressObj = values.address
        processedValues.address = addressObj.formatted_address
        
        // Build location_data object carefully, only adding defined fields
        const locationData: Partial<User['location_data']> = {}
        
        if (addressObj.coordinates) {
          locationData.coordinates = addressObj.coordinates
        }
        
        if (addressObj.address_components) {
          locationData.address_components = addressObj.address_components
        }
        
        if (addressObj.place_id) {
          locationData.place_id = addressObj.place_id
        }
        
        if (addressObj.city) {
          locationData.city = addressObj.city
        }
        
        if (addressObj.country) {
          locationData.country = addressObj.country
        }
        
        // Only add location_data if it has content
        if (Object.keys(locationData).length > 0) {
          processedValues.location_data = locationData
        }
      }

      // Handle mechanic specializations if present
      if (user?.role === 'Mechanic' && values.mechanic_specializations) {
        const specializations = values.mechanic_specializations
        
        // Validate required fields for mechanics
        if (!specializations.service_types || specializations.service_types.length === 0) {
          message.error('Please select at least one service specialization')
          setLoading(false)
          return
        }
        
        if (!specializations.vehicle_brands || specializations.vehicle_brands.length === 0) {
          message.error('Please select at least one vehicle brand')
          setLoading(false)
          return
        }
        
        // Clean up specializations data
        processedValues.mechanic_specializations = {
          service_types: specializations.service_types,
          vehicle_brands: specializations.vehicle_brands,
          experience_years: specializations.experience_years || 1,
          certifications: specializations.certifications || [],
          emergency_services: specializations.emergency_services || false
        }
      }

      // Remove any undefined values from the processed values recursively
      const cleanedValues = removeUndefinedFields(processedValues)

      console.log('Processed values before cleaning:', processedValues)
      console.log('Cleaned values for update:', cleanedValues)

      // Final safety check: ensure no undefined values in the final object
      const finalValues = JSON.parse(JSON.stringify({
        ...cleanedValues,
        updated_at: new Date().toISOString(),
      }))

      console.log('Final values after JSON serialization:', finalValues)

      await updateUserProfile(finalValues)
      message.success('Profile updated successfully!')
    } catch (error: unknown) {
      console.error('Error updating profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      message.error(errorMessage)
    }
    setLoading(false)
  }

  const handleImageUpload = async (url: string | null): Promise<void> => {
    setProfileImage(url)
    // Optionally update the profile image in the database
    if (url && user) {
      try {
        await updateUserProfile({
          profile_image: url,
          updated_at: new Date().toISOString(),
        })
        message.success('Profile image updated!')
      } catch (error: unknown) {
        console.error('Error updating profile image:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to update profile image'
        message.error(errorMessage)
      }
    }
  }

  // Helper function to get role icon
  const getRoleIcon = (role?: string): React.ReactNode => {
    switch (role) {
      case 'CarOwner': return <CarOutlined className="text-blue-500" />
      case 'Mechanic': return <ToolOutlined className="text-green-500" />
      case 'Dealer': return <ShopOutlined className="text-purple-500" />
      default: return <UserOutlined />
    }
  }

  // Helper function to get role color
  const getRoleColor = (role?: string): string => {
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
                    
                    {user.address && (
                      <div className="flex items-center justify-center gap-2 text-gray-600 max-w-xs mx-auto">
                        <EnvironmentOutlined />
                        <Text type="secondary" className="text-center text-xs leading-relaxed">
                          {user.address}
                        </Text>
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
                      {user.role === 'Mechanic' ? 'Professional Status' : 'Account Status'}
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
                          title={user.role === 'Mechanic' ? 'Specializations' : 'Profile'}
                          value={user.role === 'Mechanic' ? 
                            (user.mechanic_specializations?.service_types?.length || 0) : 
                            'Verified'
                          }
                          prefix={user.role === 'Mechanic' ? <ToolOutlined /> : <SafetyOutlined />}
                          valueStyle={{ fontSize: '14px', color: user.role === 'Mechanic' ? '#1890ff' : '#52c41a' }}
                          className="dark:[&_.ant-statistic-content-value]:!text-green-400 dark:[&_.ant-statistic-title]:!text-slate-300"
                        />
                      </Col>
                    </Row>
                    
                    {user.role === 'Mechanic' && user.mechanic_specializations && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {user.mechanic_specializations.service_types?.slice(0, 3).map((service, index) => (
                            <Badge key={index} color="green" text={service} className="text-xs" />
                          ))}
                          {(user.mechanic_specializations.service_types?.length || 0) > 3 && (
                            <Badge color="blue" text={`+${(user.mechanic_specializations.service_types?.length || 0) - 3} more`} className="text-xs" />
                          )}
                        </div>
                      </div>
                    )}
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
                    rules={[{ 
                      required: true, 
                      message: 'Please enter your address',
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.reject('Please select your address')
                        }
                        if (typeof value === 'string' && value.trim().length > 0) {
                          // Handle legacy string addresses
                          return Promise.resolve()
                        }
                        if (typeof value === 'object' && value !== null && value.formatted_address) {
                          return Promise.resolve()
                        }
                        return Promise.reject('Please select a valid address')
                      }
                    }]}
                    tooltip="Enter your primary address for better service recommendations"
                  >
                    <AddressSelector
                      placeholder="Search for your address or use current location"
                      showCurrentLocation={true}
                      allowManualEntry={true}
                      value={currentAddress}
                      onChange={(address) => {
                        setCurrentAddress(address)
                        form.setFieldValue('address', address)
                      }}
                      className="w-full"
                    />
                  </Form.Item>

                  {/* Mechanic Specializations Section */}
                  {user.role === 'Mechanic' && (
                    <>
                      <Divider>
                        <Title level={4} className="!mb-0 !text-green-600 dark:!text-green-400">
                          <ToolOutlined className="mr-2" />
                          Professional Specializations
                        </Title>
                      </Divider>

                      <Row gutter={[24, 16]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name={['mechanic_specializations', 'service_types']}
                            label={
                              <span className="font-medium text-gray-700 dark:text-slate-300">
                                <SettingOutlined className="mr-2" />
                                Service Specializations
                              </span>
                            }
                            rules={[{ required: true, message: 'Please select at least one service type' }]}
                            tooltip="Select the types of automotive services you specialize in"
                          >
                            <Select
                              mode="multiple"
                              placeholder="Select service types you specialize in"
                              size="large"
                              className="w-full"
                              maxTagCount={3}
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {SERVICE_TYPES.map((service) => (
                                <Select.Option key={service} value={service}>
                                  {service}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name={['mechanic_specializations', 'vehicle_brands']}
                            label={
                              <span className="font-medium text-gray-700 dark:text-slate-300">
                                <CarOutlined className="mr-2" />
                                Vehicle Brands
                              </span>
                            }
                            rules={[{ required: true, message: 'Please select at least one vehicle brand' }]}
                            tooltip="Select the vehicle brands you have expertise with"
                          >
                            <Select
                              mode="multiple"
                              placeholder="Select vehicle brands you work with"
                              size="large"
                              className="w-full"
                              maxTagCount={3}
                              showSearch
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              {VEHICLE_BRANDS.map((brand) => (
                                <Select.Option key={brand} value={brand}>
                                  {brand}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[24, 16]}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            name={['mechanic_specializations', 'experience_years']}
                            label={
                              <span className="font-medium text-gray-700 dark:text-slate-300">
                                <ExperimentFilled className="mr-2" />
                                Experience
                              </span>
                            }
                            rules={[{ required: true, message: 'Please select your experience level' }]}
                            tooltip="Years of professional automotive repair experience"
                          >
                            <Select
                              placeholder="Select experience level"
                              size="large"
                              className="w-full"
                            >
                              {EXPERIENCE_LEVELS.map((level) => (
                                <Select.Option key={level.value} value={level.value}>
                                  {level.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name={['mechanic_specializations', 'emergency_services']}
                            label={
                              <span className="font-medium text-gray-700 dark:text-slate-300">
                                <ThunderboltOutlined className="mr-2" />
                                Emergency Services
                              </span>
                            }
                            tooltip="Available for emergency and roadside assistance"
                          >
                            <Switch
                              checkedChildren="Available"
                              unCheckedChildren="Not Available"
                              size="default"
                              className="mt-1"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <div className="text-center p-4 bg-green-50 dark:bg-slate-700 rounded-lg">
                            <ThunderboltOutlined className="text-2xl text-green-500 mb-2" />
                            <Text strong className="block text-gray-700 dark:text-slate-200 text-sm">
                              Match Priority
                            </Text>
                            <Text type="secondary" className="text-xs">
                              Higher specialization = Better matches
                            </Text>
                          </div>
                        </Col>
                      </Row>

                      <Form.Item
                        name={['mechanic_specializations', 'certifications']}
                        label={
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            <SafetyCertificateOutlined className="mr-2" />
                            Professional Certifications
                          </span>
                        }
                        tooltip="Select any professional certifications you hold"
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select your certifications (optional)"
                          size="large"
                          className="w-full"
                          maxTagCount={2}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {CERTIFICATIONS.map((cert) => (
                            <Select.Option key={cert} value={cert}>
                              {cert}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  )}

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
            <Row gutter={[16, 16]} className="mb-6">
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

            {/* Address Information */}
            {user.address && (
              <div className="bg-orange-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <EnvironmentOutlined className="text-xl text-orange-500 mt-1" />
                  <div className="flex-1">
                    <Text strong className="block text-gray-700 dark:text-slate-200 text-sm sm:text-base mb-2">
                      Current Address
                    </Text>
                    <Text className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                      {user.address}
                    </Text>
                    {user.location_data && (user.location_data.city || user.location_data.country) && (
                      <div className="flex gap-2 mt-2">
                        {user.location_data.city && (
                          <Badge color="blue" text={user.location_data.city} />
                        )}
                        {user.location_data.country && (
                          <Badge color="green" text={user.location_data.country} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}