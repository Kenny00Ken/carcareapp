'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Modal, Tabs, Form, Input, Button, Divider, Typography, App, Checkbox, Space } from 'antd'
import { 
  UserOutlined, 
  PhoneOutlined, 
  GoogleOutlined,
  AppleOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { ConfirmationResult } from 'firebase/auth'
import { LoadingButton } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'
import Link from 'next/link'

const { TabPane } = Tabs
const { Title, Text } = Typography

interface AuthModalProps {
  visible: boolean
  onCancel: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onCancel }) => {
  const { signInWithGoogle, signInWithPhone, verifyOTP, setupRecaptcha } = useAuth()
  const { message } = App.useApp()
  const { loading, setLoading } = useLoading()
  const [activeTab, setActiveTab] = useState('phone')
  const [form] = Form.useForm()
  const [otpForm] = Form.useForm()
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Reset modal state when closed
  useEffect(() => {
    if (!visible) {
      setStep('input')
      setConfirmationResult(null)
      setPhoneNumber('')
      setCountdown(0)
      form.resetFields()
      otpForm.resetFields()
    }
  }, [visible])

  const handleGoogleAuth = async () => {
    if (!termsAccepted) {
      message.error('Please accept the Terms and Conditions and Privacy Policy to continue.')
      return
    }

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

  const handlePhoneAuth = async (values: { phone: string }) => {
    if (!termsAccepted) {
      message.error('Please accept the Terms and Conditions and Privacy Policy to continue.')
      return
    }

    try {
      setLoading(true)
      let formattedPhone = values.phone.trim()
      
      // Add Ghana country code if no country code provided
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+233' + formattedPhone.substring(1)
        } else {
          formattedPhone = '+233' + formattedPhone
        }
      }

      setPhoneNumber(formattedPhone)
      const result = await signInWithPhone(formattedPhone)
      setConfirmationResult(result)
      setStep('verify')
      setCountdown(60) // 1 minute countdown
      message.success('Verification code sent to your phone!')
    } catch (error) {
      console.error('Phone auth error:', error)
      message.error('Failed to send verification code. Please check your phone number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPVerification = async (values: { otp: string }) => {
    if (!confirmationResult) {
      message.error('Please request a new verification code.')
      return
    }

    try {
      setLoading(true)
      await verifyOTP(confirmationResult, values.otp)
      onCancel()
    } catch (error) {
      console.error('OTP verification error:', error)
      message.error('Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    try {
      setLoading(true)
      const result = await signInWithPhone(phoneNumber)
      setConfirmationResult(result)
      setCountdown(60)
      message.success('New verification code sent!')
    } catch (error) {
      console.error('Resend OTP error:', error)
      message.error('Failed to resend verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderPhoneInput = () => (
    <div className="space-y-4">
      <Form
        form={form}
        onFinish={handlePhoneAuth}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please enter your phone number' },
            { 
              pattern: /^(\+233|0)[0-9]{9}$/, 
              message: 'Please enter a valid Ghanaian phone number' 
            }
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="0244123456 or +233244123456"
            size="large"
          />
        </Form.Item>
        
        <Form.Item>
          <LoadingButton
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            disabled={!termsAccepted}
            loadingText="Sending code..."
          >
            Send Verification Code
          </LoadingButton>
        </Form.Item>
      </Form>
    </div>
  )

  const renderOTPInput = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <CheckCircleOutlined className="text-green-500 text-3xl mb-2" />
        <Title level={4} className="!mb-2">Verify Your Phone</Title>
        <Text type="secondary">
          We sent a 6-digit code to <br />
          <Text strong>{phoneNumber}</Text>
        </Text>
      </div>

      <Form
        form={otpForm}
        onFinish={handleOTPVerification}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="otp"
          label="Verification Code"
          rules={[
            { required: true, message: 'Please enter the verification code' },
            { len: 6, message: 'Verification code must be 6 digits' }
          ]}
        >
          <Input
            placeholder="Enter 6-digit code"
            size="large"
            maxLength={6}
            style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
          />
        </Form.Item>
        
        <Form.Item>
          <LoadingButton
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            loadingText="Verifying..."
          >
            Verify Code
          </LoadingButton>
        </Form.Item>
      </Form>

      <div className="text-center space-y-2">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => setStep('input')}
          disabled={loading}
        >
          Back to phone number
        </Button>
        
        <div>
          <Text type="secondary">Didn't receive code? </Text>
          {countdown > 0 ? (
            <Text type="secondary">Resend in {countdown}s</Text>
          ) : (
            <Button type="link" onClick={handleResendOTP} disabled={loading}>
              Resend Code
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Modal
      title="Welcome to AutoCare"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={450}
      centered
      className="!mx-4"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Join our community of car owners, mechanics, and dealers
          </p>
        </div>

        {step === 'input' ? (
          <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
            <TabPane 
              tab={
                <span>
                  <PhoneOutlined />
                  Phone Number
                </span>
              } 
              key="phone"
            >
              {renderPhoneInput()}
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <GoogleOutlined />
                  Social Login
                </span>
              } 
              key="social"
            >
              <div className="space-y-3">
                <LoadingButton
                  icon={<GoogleOutlined />}
                  size="large"
                  block
                  onClick={handleGoogleAuth}
                  loading={loading}
                  disabled={!termsAccepted}
                  className="!flex !items-center !justify-center !h-11 sm:!h-12 !text-sm sm:!text-base"
                  loadingText="Signing in..."
                >
                  Continue with Google
                </LoadingButton>
              </div>
            </TabPane>
          </Tabs>
        ) : (
          renderOTPInput()
        )}

        {step === 'input' && (
          <div className="border-t pt-4">
            <Space direction="vertical" size="small" className="w-full">
              <Checkbox 
                checked={termsAccepted} 
                onChange={(e) => setTermsAccepted(e.target.checked)}
              >
                <Text className="text-xs">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </Text>
              </Checkbox>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <SafetyOutlined />
                <Text type="secondary" className="text-xs">
                  Your data is secure and encrypted
                </Text>
              </div>
            </Space>
          </div>
        )}

        {/* ReCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </Modal>
  )
}