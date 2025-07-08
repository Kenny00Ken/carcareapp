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

const { TabPane } = Tabs
const { Title, Text } = Typography

interface AuthModalProps {
  visible: boolean
  onCancel: () => void
}

interface OTPVerificationContentProps {
  confirmationResult: ConfirmationResult | null
  phoneNumber: string
  onSuccess: () => void
  onCancel: () => void
  onResend: () => Promise<void>
}

const OTPVerificationContent: React.FC<OTPVerificationContentProps> = ({
  confirmationResult,
  phoneNumber,
  onSuccess,
  onCancel,
  onResend
}) => {
  const { message: messageApi } = App.useApp()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(Input | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  // Reset state when component mounts
  useEffect(() => {
    setOtp(['', '', '', '', '', ''])
    setCountdown(60)
    setCanResend(false)
    setLoading(false)
    setResendLoading(false)
    // Focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [])

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && confirmationResult) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (otpCode: string) => {
    if (!confirmationResult) {
      messageApi.error('Invalid verification session. Please try again.')
      return
    }

    setLoading(true)
    try {
      await confirmationResult.confirm(otpCode)
      messageApi.success('Phone number verified successfully!')
      onSuccess()
    } catch (error: any) {
      console.error('OTP verification error:', error)
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          messageApi.error('Invalid verification code. Please check and try again.')
          break
        case 'auth/code-expired':
          messageApi.error('Verification code expired. Please request a new one.')
          break
        default:
          messageApi.error('Verification failed. Please try again.')
      }
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await onResend()
      setCountdown(60)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      messageApi.success('New verification code sent!')
    } catch (error) {
      messageApi.error('Failed to resend code. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+233')) {
      return phone.replace('+233', '+233 ').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
    }
    return phone
  }

  const otpValue = otp.join('')
  const isComplete = otpValue.length === 6

  return (
    <div className="text-center space-y-6 py-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PhoneOutlined className="text-2xl text-brand-600" />
        </div>
        
        <Title level={3} className="!mb-2">
          Verify Your Phone
        </Title>
        
        <Text className="text-gray-600">
          We've sent a 6-digit verification code to
        </Text>
        <br />
        <Text strong className="text-brand-600">
          {formatPhoneNumber(phoneNumber)}
        </Text>
      </div>

      {/* OTP Input */}
      <div className="space-y-4">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={el => inputRefs.current[index] = el}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              maxLength={1}
              className="!w-12 !h-12 !text-center !text-lg !font-semibold"
              style={{
                borderColor: digit ? '#1890ff' : '#d9d9d9',
                boxShadow: digit ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none'
              }}
              disabled={loading}
            />
          ))}
        </div>
        
        {/* Verify Button */}
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          disabled={!isComplete}
          onClick={() => handleVerifyOtp(otpValue)}
          icon={isComplete ? <CheckCircleOutlined /> : undefined}
          className="!h-12 !text-base font-medium"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </div>

      {/* Resend Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <Text className="text-gray-500">
            Didn't receive the code?
          </Text>
        </div>
        
        {canResend ? (
          <Button
            type="link"
            onClick={handleResend}
            loading={resendLoading}
            className="!p-0 !h-auto"
          >
            Resend Code
          </Button>
        ) : (
          <Text className="text-sm text-gray-500">
            Resend code in {countdown}s
          </Text>
        )}
      </div>

      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onCancel}
        className="!text-gray-500"
        disabled={loading}
      >
        Use Different Number
      </Button>
    </div>
  )
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onCancel }) => {
  const { signInWithGoogle, signInWithPhone } = useAuth()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('phone')
  const [form] = Form.useForm()
  const [otpModalVisible, setOtpModalVisible] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState('')

  const handlePhoneAuth = async (values: { phoneNumber: string }) => {
    setLoading(true)
    try {
      const result = await signInWithPhone(values.phoneNumber)
      setConfirmationResult(result)
      setCurrentPhoneNumber(values.phoneNumber)
      setOtpModalVisible(true)
      // Don't close auth modal yet, will close after OTP verification
    } catch (error) {
      console.error('Phone auth error:', error)
      // Error message will be shown by AuthContext
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSuccess = () => {
    setOtpModalVisible(false)
    onCancel() // Close auth modal after successful verification
    message.success('Successfully signed in!')
  }

  const handleResendOtp = async () => {
    if (currentPhoneNumber) {
      const result = await signInWithPhone(currentPhoneNumber)
      setConfirmationResult(result)
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
              title="Welcome to Auto Care"
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
                  { 
                    pattern: /^\+\d{1,4}\d{7,15}$/, 
                    message: 'Please enter a valid phone number with country code (e.g., +233244123456)' 
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve()
                      if (!value.startsWith('+')) {
                        return Promise.reject(new Error('Phone number must include country code (+233 for Ghana)'))
                      }
                      if (value.length < 10 || value.length > 16) {
                        return Promise.reject(new Error('Phone number must be between 10-16 digits including country code'))
                      }
                      return Promise.resolve()
                    }
                  }
                ]}
                help="Include country code (e.g., +233 for Ghana)"
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+233244123456"
                  size="large"
                  maxLength={16}
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
      
      {/* OTP Verification Modal */}
      <Modal
        title={null}
        open={otpModalVisible}
        onCancel={() => setOtpModalVisible(false)}
        footer={null}
        width={400}
        centered
        destroyOnClose
      >
        <OTPVerificationContent
          confirmationResult={confirmationResult}
          phoneNumber={currentPhoneNumber}
          onSuccess={handleOtpSuccess}
          onCancel={() => setOtpModalVisible(false)}
          onResend={handleResendOtp}
        />
      </Modal>
    </Modal>
  )
} 