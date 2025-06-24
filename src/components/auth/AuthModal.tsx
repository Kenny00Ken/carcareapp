'use client'

import React, { useState } from 'react'
import { Modal, Tabs, Form, Input, Button, message, Divider } from 'antd'
import { 
  UserOutlined, 
  PhoneOutlined, 
  GoogleOutlined,
  AppleOutlined 
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'

const { TabPane } = Tabs

interface AuthModalProps {
  visible: boolean
  onCancel: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onCancel }) => {
  const { signInWithGoogle, signInWithPhone } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('phone')
  const [form] = Form.useForm()

  const handlePhoneAuth = async (values: { phoneNumber: string }) => {
    setLoading(true)
    try {
      await signInWithPhone(values.phoneNumber)
      message.success('SMS sent! Please check your phone for verification code.')
      onCancel()
    } catch (error) {
      console.error('Phone auth error:', error)
      message.error('Failed to send SMS. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      message.success('Successfully signed in with Google!')
      onCancel()
    } catch (error) {
      console.error('Google auth error:', error)
      message.error('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Welcome to Car Care Connect"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
    >
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Join our community of car owners, mechanics, and dealers
          </p>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="Phone Number" key="phone">
            <Form
              form={form}
              onFinish={handlePhoneAuth}
              layout="vertical"
              className="space-y-4"
            >
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter your phone number' },
                  { pattern: /^\+?[\d\s\-\(\)]+$/, message: 'Please enter a valid phone number' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+1 (555) 123-4567"
                  size="large"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                Send Verification Code
              </Button>
            </Form>
          </TabPane>

          <TabPane tab="Social Login" key="social">
            <div className="space-y-3">
              <Button
                icon={<GoogleOutlined />}
                size="large"
                block
                onClick={handleGoogleAuth}
                loading={loading}
                className="!flex !items-center !justify-center"
              >
                Continue with Google
              </Button>

              <Button
                icon={<AppleOutlined />}
                size="large"
                block
                disabled
                className="!flex !items-center !justify-center"
              >
                Continue with Apple (Coming Soon)
              </Button>
            </div>
          </TabPane>
        </Tabs>

        <Divider />

        <div className="text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </Modal>
  )
} 