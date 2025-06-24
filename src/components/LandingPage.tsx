'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Space, Typography, Row, Col, Avatar, Dropdown } from 'antd'
import { 
  CarOutlined, 
  ToolOutlined, 
  ShopOutlined, 
  GoogleOutlined,
  PhoneOutlined,
  BulbOutlined,
  MoonOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  RightOutlined,
  CheckCircleOutlined,
  StarFilled,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { AuthModal } from './auth/AuthModal'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

const { Title, Paragraph, Text } = Typography

// Typing animation component
const TypingText: React.FC<{ 
  texts: string[], 
  speed?: number, 
  pauseDuration?: number,
  className?: string 
}> = ({ 
  texts, 
  speed = 100, 
  pauseDuration = 2000,
  className = "" 
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isTyping) {
      if (currentText.length < texts[currentTextIndex].length) {
        timeout = setTimeout(() => {
          setCurrentText(texts[currentTextIndex].slice(0, currentText.length + 1))
        }, speed)
      } else {
        setIsTyping(false)
        timeout = setTimeout(() => {
          setIsTyping(true)
          setCurrentText('')
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }, pauseDuration)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentTextIndex, isTyping, texts, speed, pauseDuration])

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <span className={className}>
      {currentText}
      <span className={`inline-block w-0.5 h-8 ml-1 bg-current transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
    </span>
  )
}

// Floating animation component
const FloatingCard: React.FC<{ children: React.ReactNode, delay?: number }> = ({ children, delay = 0 }) => {
  return (
    <div 
      className="animate-float"
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: '6s',
        animationIterationCount: 'infinite'
      }}
    >
      {children}
    </div>
  )
}

export const LandingPage: React.FC = () => {
  const { user, firebaseUser, loading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [authModalVisible, setAuthModalVisible] = useState(false)
  
  // Use the auth redirect hook to handle navigation
  const { isAuthenticated, hasProfile, hasRole } = useAuthRedirect({
    redirectOnAuth: true
  })

  // User menu items for dropdown
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'CarOwner': return <CarOutlined />
      case 'Mechanic': return <ToolOutlined />
      case 'Dealer': return <ShopOutlined />
      default: return <UserOutlined />
    }
  }

  const userMenuItems = [
    ...(user ? [{
      key: 'dashboard',
      icon: getRoleIcon(user.role),
      label: `${user.role === 'CarOwner' ? 'Car Owner' : user.role} Dashboard`,
      onClick: () => {
        const dashboardPath = user.role === 'CarOwner' ? '/dashboard/car-owner' :
                             user.role === 'Mechanic' ? '/dashboard/mechanic' :
                             '/dashboard/dealer'
        router.push(dashboardPath)
      },
    }] : []),
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/settings'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <Text className="text-gray-600 dark:text-gray-300">Loading Car Care Connect...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 animate-slideInLeft">
              <div className="relative">
                <CarOutlined className="text-3xl text-blue-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <Title level={2} className="!mb-0 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Car Care Connect
              </Title>
            </div>
            
            <div className="flex items-center space-x-4 animate-slideInRight">
              <Button
                type="text"
                icon={theme === 'light' ? <MoonOutlined /> : <BulbOutlined />}
                onClick={toggleTheme}
                className="!border-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              />
              
              {firebaseUser ? (
                <div className="flex items-center space-x-3">
                  {user && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
                      Welcome, {user.name || firebaseUser.displayName || 'User'}
                    </span>
                  )}
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105">
                      <Avatar 
                        icon={<UserOutlined />} 
                        src={firebaseUser.photoURL}
                        size="default"
                        className="border-2 border-blue-200"
                      />
                      {user && (
                        <span className="font-medium hidden sm:block">
                          {user.name || firebaseUser.displayName || 'User'}
                        </span>
                      )}
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setAuthModalVisible(true)}
                  className="shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 border-none"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Content */}
          <div className="text-center mb-20">
            <div className="animate-fadeInUp">
              <Title level={1} className="!text-5xl md:!text-7xl !mb-8 !leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
                  <TypingText 
                    texts={['Connect.', 'Diagnose.', 'Repair.']}
                    speed={120}
                    pauseDuration={2500}
                    className="inline-block"
                  />
                </span>
              </Title>
            </div>
            
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Paragraph className="!text-xl md:!text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto !mb-12 !leading-relaxed">
                The ultimate platform connecting car owners, mechanics, and dealers in one seamless ecosystem 
                for automotive diagnostics, parts, and maintenance.
              </Paragraph>
            </div>
            
            <div className="animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <Space size="large" wrap>
                {firebaseUser ? (
                  user ? (
                    <Button
                      type="primary"
                      size="large"
                      icon={getRoleIcon(user.role)}
                      onClick={() => {
                        const dashboardPath = user.role === 'CarOwner' ? '/dashboard/car-owner' :
                                             user.role === 'Mechanic' ? '/dashboard/mechanic' :
                                             '/dashboard/dealer'
                        router.push(dashboardPath)
                      }}
                      className="!h-14 !px-10 !text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 border-none"
                    >
                      Go to Dashboard <ArrowRightOutlined />
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => router.push('/auth/role-selection')}
                      className="!h-14 !px-10 !text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 border-none"
                    >
                      Complete Your Profile <ArrowRightOutlined />
                    </Button>
                  )
                ) : (
                  <>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CarOutlined />}
                      onClick={() => setAuthModalVisible(true)}
                      className="!h-14 !px-10 !text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 border-none"
                    >
                      Join as Car Owner
                    </Button>
                    <Button
                      size="large"
                      icon={<ToolOutlined />}
                      onClick={() => setAuthModalVisible(true)}
                      className="!h-14 !px-10 !text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Join as Mechanic
                    </Button>
                    <Button
                      size="large"
                      icon={<ShopOutlined />}
                      onClick={() => setAuthModalVisible(true)}
                      className="!h-14 !px-10 !text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Join as Dealer
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>

          {/* Features Section */}
          <Row gutter={[32, 32]} className="mb-20">
            <Col xs={24} md={8}>
              <FloatingCard delay={0}>
                <Card className="!h-full text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 !border-2 hover:!border-blue-200 dark:hover:!border-blue-700 !rounded-2xl">
                  <div className="relative mb-6">
                    <CarOutlined className="text-6xl text-blue-600 mb-4" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <Title level={3} className="!mb-4">For Car Owners</Title>
                  <Paragraph className="text-gray-600 dark:text-gray-300 !mb-6">
                    Submit repair requests, track diagnostics, and manage your vehicle maintenance history all in one place.
                  </Paragraph>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>Smart Mechanic Search</span>
                  </div>
                </Card>
              </FloatingCard>
            </Col>
            <Col xs={24} md={8}>
              <FloatingCard delay={1}>
                <Card className="!h-full text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 !border-2 hover:!border-green-200 dark:hover:!border-green-700 !rounded-2xl">
                  <div className="relative mb-6">
                    <ToolOutlined className="text-6xl text-green-600 mb-4" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <Title level={3} className="!mb-4">For Mechanics</Title>
                  <Paragraph className="text-gray-600 dark:text-gray-300 !mb-6">
                    Claim requests, provide detailed diagnoses, and connect with reliable parts dealers seamlessly.
                  </Paragraph>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>Availability Management</span>
                  </div>
                </Card>
              </FloatingCard>
            </Col>
            <Col xs={24} md={8}>
              <FloatingCard delay={2}>
                <Card className="!h-full text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 !border-2 hover:!border-purple-200 dark:hover:!border-purple-700 !rounded-2xl">
                  <div className="relative mb-6">
                    <ShopOutlined className="text-6xl text-purple-600 mb-4" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                  <Title level={3} className="!mb-4">For Dealers</Title>
                  <Paragraph className="text-gray-600 dark:text-gray-300 !mb-6">
                    List your parts inventory, manage transactions, and grow your business with direct mechanic connections.
                  </Paragraph>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>Inventory Management</span>
                  </div>
                </Card>
              </FloatingCard>
            </Col>
          </Row>

          {/* Stats Section */}
          <Card className="text-center !bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 !border-none text-white mb-20 !rounded-3xl shadow-2xl">
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} sm={8}>
                <div className="animate-fadeInUp">
                  <Title level={1} className="!text-white !mb-2 !text-5xl">10K+</Title>
                  <Paragraph className="!text-blue-100 !mb-0 !text-lg">Active Users</Paragraph>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <StarFilled key={i} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                  <Title level={1} className="!text-white !mb-2 !text-5xl">5K+</Title>
                  <Paragraph className="!text-blue-100 !mb-0 !text-lg">Repairs Completed</Paragraph>
                  <Text className="!text-blue-200 text-sm">All currencies in GHS</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  <Title level={1} className="!text-white !mb-2 !text-5xl">1K+</Title>
                  <Paragraph className="!text-blue-100 !mb-0 !text-lg">Parts Available</Paragraph>
                  <Text className="!text-blue-200 text-sm">Real-time inventory</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <CarOutlined className="text-3xl text-blue-400" />
            <Title level={2} className="!text-white !mb-0">Car Care Connect</Title>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <Paragraph className="!text-gray-300 !text-lg !mb-8">
            Connecting automotive professionals across Ghana. All transactions in GHS.
          </Paragraph>
          <div className="flex justify-center items-center space-x-2 text-sm text-gray-400">
            <span>© 2024 Car Care Connect</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        visible={authModalVisible}
        onCancel={() => setAuthModalVisible(false)}
      />
      
      {/* Recaptcha Container */}
      <div id="recaptcha-container"></div>
    </div>
  )
} 