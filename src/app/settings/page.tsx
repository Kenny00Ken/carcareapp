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
  Tag
} from 'antd'
import { 
  BellOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SettingOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FCMService } from '@/services/fcm'

const { Title, Text, Paragraph } = Typography

export default function SettingsPage() {
  const { user } = useAuth()
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(false)

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

  return (
    <DashboardLayout activeKey="settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Title level={2} className="!text-xl sm:!text-2xl !mb-2 dark:!text-slate-200">Settings</Title>
          <Paragraph className="!text-sm sm:!text-base dark:!text-slate-400">
            Manage your preferences, location settings, and notifications.
          </Paragraph>
        </div>

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

        {/* Additional Settings */}
        <Card 
          className="dark:bg-slate-800 dark:border-slate-600"
          title={<span className="text-sm sm:text-base dark:text-slate-200">Other Settings</span>}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Text type="secondary" className="text-xs sm:text-sm dark:text-slate-400">
              More settings coming soon. You can manage your profile, location preferences, 
              and other options from the profile page.
            </Text>
            <Button 
              type="link" 
              onClick={() => window.location.href = '/profile'}
              className="!text-sm sm:!text-base !px-0"
            >
              Go to Profile Settings
            </Button>
          </Space>
        </Card>
      </div>
    </DashboardLayout>
  )
}