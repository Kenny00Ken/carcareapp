'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Typography, 
  Switch,
  Button,
  Alert,
  Space,
  Divider,
  message,
  Row,
  Col,
  Tag,
  Tabs
} from 'antd'
import { 
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SettingOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  SafetyOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FCMService } from '@/services/fcm'
import { LocationSettings } from '@/components/settings/LocationSettings'
import { motion } from 'framer-motion'

const { Title, Text, Paragraph } = Typography

export default function SettingsPage() {
  const { user } = useAuth()
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('location')

  useEffect(() => {
    // Check current notification permission status
    setNotificationPermission(FCMService.getPermissionStatus())
  }, [])

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!enabled) {
      message.info('Notifications disabled. You can re-enable them anytime.')
      return
    }

    try {
      setLoading(true)
      
      if (notificationPermission === 'denied') {
        message.warning({
          content: 'Notifications are blocked in your browser. Please enable them in your browser settings.',
          duration: 5
        })
        return
      }

      if (notificationPermission === 'default') {
        const permission = await FCMService.requestPermission()
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
          message.success('Notifications enabled successfully!')
        } else if (permission === 'denied') {
          message.error('Notification permission denied. You can enable them later in browser settings.')
        }
      }
    } catch (error) {
      console.error('Error handling notification toggle:', error)
      message.error('Failed to update notification settings')
    } finally {
      setLoading(false)
    }
  }

  const getPermissionStatus = () => {
    switch (notificationPermission) {
      case 'granted':
        return { status: 'Enabled', color: 'success', icon: <CheckCircleOutlined /> }
      case 'denied':
        return { status: 'Blocked', color: 'error', icon: <WarningOutlined /> }
      default:
        return { status: 'Not set', color: 'warning', icon: <WarningOutlined /> }
    }
  }

  const permissionStatus = getPermissionStatus()

  // Create notification settings content
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card 
        className="dark:bg-slate-800 dark:border-slate-600"
        title={
          <Space>
            <BellOutlined />
            <span className="text-sm sm:text-base dark:text-slate-200">Notification Settings</span>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col xs={18} sm={20}>
                <Space direction="vertical" size="small">
                  <Text strong className="text-sm sm:text-base dark:text-slate-200">Push Notifications</Text>
                  <Text type="secondary" className="text-xs sm:text-sm dark:text-slate-400">
                    Receive notifications for new requests, messages, and updates
                  </Text>
                  <Space>
                    <Text className="text-xs sm:text-sm dark:text-slate-300">Status:</Text>
                    <Tag color={permissionStatus.color} icon={permissionStatus.icon} className="text-xs">
                      {permissionStatus.status}
                    </Tag>
                  </Space>
                </Space>
              </Col>
              <Col xs={6} sm={4} className="text-right">
                <Switch
                  checked={notificationPermission === 'granted'}
                  onChange={handleNotificationToggle}
                  loading={loading}
                  size="default"
                />
              </Col>
            </Row>
          </div>

          {notificationPermission === 'denied' && (
            <Alert
              message="Notifications Blocked"
              description={
                <div>
                  <p>Notifications are blocked in your browser. To enable them:</p>
                  <ol style={{ marginLeft: 16, marginTop: 8 }}>
                    <li>Click the lock icon in your address bar</li>
                    <li>Change notifications from "Block" to "Allow"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              }
              type="warning"
              showIcon
            />
          )}

          {notificationPermission === 'default' && (
            <Alert
              message="Enable Notifications"
              description="Turn on notifications to stay updated with new requests, messages, and important updates from the Auto Care platform."
              type="info"
              showIcon
            />
          )}

          {notificationPermission === 'granted' && (
            <Alert
              message="Notifications Enabled"
              description="You'll receive notifications for new requests, messages, and updates. You can disable them anytime."
              type="success"
              showIcon
            />
          )}
        </Space>
      </Card>

      {/* Notification Types */}
      <Card 
        className="dark:bg-slate-800 dark:border-slate-600"
        title={<span className="text-sm sm:text-base dark:text-slate-200">Notification Types</span>}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={18} sm={20}>
              <Space>
                <MessageOutlined className="text-blue-500" />
                <div>
                  <Text strong className="text-sm sm:text-base dark:text-slate-200">New Messages</Text>
                  <br />
                  <Text type="secondary" className="text-xs sm:text-sm dark:text-slate-400">Chat messages from customers or mechanics</Text>
                </div>
              </Space>
            </Col>
            <Col xs={6} sm={4} className="text-right">
              <Switch defaultChecked disabled={notificationPermission !== 'granted'} />
            </Col>
          </Row>

          <Divider className="!my-3" />

          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={18} sm={20}>
              <Space>
                <SettingOutlined className="text-green-500" />
                <div>
                  <Text strong className="text-sm sm:text-base dark:text-slate-200">Request Updates</Text>
                  <br />
                  <Text type="secondary" className="text-xs sm:text-sm dark:text-slate-400">Status changes on your service requests</Text>
                </div>
              </Space>
            </Col>
            <Col xs={6} sm={4} className="text-right">
              <Switch defaultChecked disabled={notificationPermission !== 'granted'} />
            </Col>
          </Row>

          <Divider className="!my-3" />

          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={18} sm={20}>
              <Space>
                <PhoneOutlined className="text-purple-500" />
                <div>
                  <Text strong className="text-sm sm:text-base dark:text-slate-200">New Requests</Text>
                  <br />
                  <Text type="secondary" className="text-xs sm:text-sm dark:text-slate-400">New service requests in your area (Mechanics only)</Text>
                </div>
              </Space>
            </Col>
            <Col xs={6} sm={4} className="text-right">
              <Switch defaultChecked disabled={notificationPermission !== 'granted'} />
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  )

  const tabItems = [
    {
      key: 'location',
      label: (
        <span className="flex items-center gap-2">
          <EnvironmentOutlined />
          Location Services
        </span>
      ),
      children: <LocationSettings className="mt-4" />
    },
    {
      key: 'notifications',
      label: (
        <span className="flex items-center gap-2">
          <BellOutlined />
          Notifications
        </span>
      ),
      children: renderNotificationSettings()
    },
    {
      key: 'privacy',
      label: (
        <span className="flex items-center gap-2">
          <SafetyOutlined />
          Privacy & Security
        </span>
      ),
      children: (
        <Card className="mt-4">
          <div className="text-center py-8">
            <SafetyOutlined className="text-4xl text-gray-400 mb-4" />
            <Title level={4}>Privacy & Security</Title>
            <Text type="secondary">
              Privacy and security settings will be available soon.
            </Text>
          </div>
        </Card>
      )
    },
    {
      key: 'account',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          Account
        </span>
      ),
      children: (
        <Card className="mt-4">
          <div className="text-center py-8">
            <UserOutlined className="text-4xl text-gray-400 mb-4" />
            <Title level={4}>Account Settings</Title>
            <Text type="secondary">
              Account management options will be available soon.
            </Text>
            <div className="mt-4">
              <Button 
                type="link" 
                onClick={() => window.location.href = '/profile'}
              >
                Go to Profile Settings
              </Button>
            </div>
          </div>
        </Card>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="settings">
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
                <Title level={1} className="!text-white !mb-2 !text-2xl sm:!text-3xl flex items-center gap-3">
                  <SettingOutlined />
                  Settings
                </Title>
                <Text className="!text-blue-100 !mb-0 text-sm sm:text-lg">
                  Manage your preferences, location services, and notifications
                </Text>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full blur-xl"></div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0 dark:bg-slate-800 dark:border dark:border-slate-600">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
              tabPosition="top"
              className="custom-tabs"
            />
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}