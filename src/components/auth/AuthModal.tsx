'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Modal, Tabs, Form, Input, Button, Divider, Typography, App } from 'antd'
import { 
  UserOutlined, 
  PhoneOutlined, 
  GoogleOutlined,
  AppleOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { ConfirmationResult } from 'firebase/auth'
import { LoadingButton } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'

const { TabPane } = Tabs
const { Title, Text } = Typography

interface AuthModalProps {
  visible: boolean
  onCancel: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onCancel }) => {
  const { signInWithGoogle, signInWithPhone } = useAuth()
  const { message } = App.useApp()
  const { loading, setLoading } = useLoading()
  const [activeTab, setActiveTab] = useState('phone')
  const [form] = Form.useForm()

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
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
      title="Welcome to AutoCare"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
      className="!mx-4"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Join our community of car owners, mechanics, and dealers
          </p>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="Social Login" key="social">
            <div className="space-y-3">
              <LoadingButton
                icon={<GoogleOutlined />}
                size="large"
                block
                onClick={handleGoogleAuth}
                loading={loading}
                className="!flex !items-center !justify-center !h-11 sm:!h-12 !text-sm sm:!text-base"
                loadingText="Signing in..."
              >
                Continue with Google
              </LoadingButton>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  )
}