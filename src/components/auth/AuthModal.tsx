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
      >
        <Form.Item
          name="phone"
          label={<span className="text-sm font-medium">Phone Number</span>}
          className="!mb-4"
          rules={[
            { required: true, message: 'Please enter your phone number' },
            {
              pattern: /^(\+233|0)[0-9]{9}$/,
              message: 'Please enter a valid Ghanaian phone number'
            }
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-brand-500" />}
            placeholder="0244123456 or +233244123456"
            className="enhanced-phone-input !h-11 !text-sm"
          />
        </Form.Item>

        <Form.Item className="!mb-0">
          <LoadingButton
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={!termsAccepted}
            loadingText="Sending code..."
            className="!h-11 !text-sm !font-semibold !rounded-lg hover:!shadow-lg transition-all duration-300"
          >
            Send Verification Code
          </LoadingButton>
        </Form.Item>
      </Form>
    </div>
  )

  const renderOTPInput = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
          <CheckCircleOutlined className="text-green-500 text-2xl" />
        </div>
        <Title level={4} className="!mb-2 !text-lg sm:!text-xl">Verify Your Phone</Title>
        <Text type="secondary" className="!text-xs sm:!text-sm">
          We sent a 6-digit code to <br />
          <Text strong className="text-brand-600 dark:text-brand-400">{phoneNumber}</Text>
        </Text>
      </div>

      <Form
        form={otpForm}
        onFinish={handleOTPVerification}
        layout="vertical"
      >
        <Form.Item
          name="otp"
          label={<span className="text-sm font-medium">Verification Code</span>}
          rules={[
            { required: true, message: 'Please enter the verification code' },
            { len: 6, message: 'Verification code must be 6 digits' }
          ]}
          className="!mb-4"
        >
          <Input
            placeholder="000000"
            maxLength={6}
            className="enhanced-otp-input !h-12 !text-center !text-xl !tracking-widest !font-semibold"
          />
        </Form.Item>

        <Form.Item className="!mb-0">
          <LoadingButton
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            loadingText="Verifying..."
            className="!h-11 !text-sm !font-semibold !rounded-lg hover:!shadow-lg transition-all duration-300"
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
      title={
        <div className="text-center">
          <Title level={3} className="!mb-1 !text-xl sm:!text-2xl font-bold bg-gradient-to-r from-brand-600 to-brand-800 dark:from-brand-400 dark:to-brand-600 bg-clip-text text-transparent">
            Welcome to AutoCare
          </Title>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={440}
      centered
      className="auth-modal !mx-4"
    >
      <div className="space-y-4 sm:space-y-5">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Join our community of car owners, mechanics, and dealers
          </p>
        </div>

        {step === 'input' ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            className="enhanced-auth-tabs"
          >
            <TabPane
              tab={
                <span className="flex items-center gap-1.5 font-medium text-sm">
                  <PhoneOutlined />
                  <span>Phone Number</span>
                </span>
              }
              key="phone"
            >
              <div className="pt-3">
                {renderPhoneInput()}
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center gap-1.5 font-medium text-sm">
                  <GoogleOutlined />
                  <span>Social Login</span>
                </span>
              }
              key="social"
            >
              <div className="pt-3">
                <LoadingButton
                  icon={<GoogleOutlined />}
                  block
                  onClick={handleGoogleAuth}
                  loading={loading}
                  disabled={!termsAccepted}
                  className="!flex !items-center !justify-center !h-11 !text-sm !font-semibold !rounded-lg hover:!shadow-lg transition-all duration-300"
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
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
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