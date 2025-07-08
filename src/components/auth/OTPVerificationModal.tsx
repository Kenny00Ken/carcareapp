'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Modal, Input, Button, Typography, App } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, PhoneOutlined } from '@ant-design/icons'
import { ConfirmationResult } from 'firebase/auth'

const { Title, Text } = Typography

interface OTPVerificationModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
  confirmationResult: ConfirmationResult | null
  phoneNumber: string
  onResend: () => Promise<void>
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  confirmationResult,
  phoneNumber,
  onResend
}) => {
  const { message: messageApi } = App.useApp()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend
  useEffect(() => {
    if (visible && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [visible, countdown])

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      setCanResend(false)
      setLoading(false)
      setResendLoading(false)
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [visible])

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
    // Handle paste
    else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('')
        const newOtp = [...otp]
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit
        })
        setOtp(newOtp)
        
        // Focus last filled input or submit if complete
        if (digits.length === 6 && confirmationResult) {
          handleVerifyOtp(newOtp.join(''))
        } else {
          const nextIndex = Math.min(digits.length, 5)
          inputRefs.current[nextIndex]?.focus()
        }
      })
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
      
      // Handle specific errors
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
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
      destroyOnClose
    >
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
                ref={el => {
                  if (el?.input) {
                    inputRefs.current[index] = el.input
                  }
                }}
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
    </Modal>
  )
}