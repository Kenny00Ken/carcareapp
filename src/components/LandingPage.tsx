'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Space, Typography, Row, Col, Avatar, Dropdown } from 'antd'
import { 
  CarOutlined, 
  ToolOutlined, 
  ShopOutlined, 
  BulbOutlined,
  MoonOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  StarFilled,
  ArrowRightOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { AuthModal } from './auth/AuthModal'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

const { Title, Paragraph, Text } = Typography

// Enhanced typing animation component with continuous loop
const TypingText: React.FC<{ 
  texts: string[], 
  speed?: number, 
  pauseDuration?: number,
  deleteSpeed?: number,
  className?: string 
}> = ({ 
  texts, 
  speed = 150, 
  pauseDuration = 2000,
  deleteSpeed = 75,
  className = "" 
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isDeleting) {
      // Deleting characters with variable speed for dramatic effect
      if (currentText.length > 0) {
        const dynamicDeleteSpeed = currentText.length > 10 ? deleteSpeed / 2 : deleteSpeed
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, dynamicDeleteSpeed)
      } else {
        setIsDeleting(false)
        setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        setIsTyping(true)
      }
    } else if (isTyping) {
      // Typing characters with dynamic speed
      if (currentText.length < texts[currentTextIndex].length) {
        const nextChar = texts[currentTextIndex][currentText.length]
        const dynamicSpeed = nextChar === ' ' || nextChar === '•' ? speed * 2 : speed
        timeout = setTimeout(() => {
          setCurrentText(texts[currentTextIndex].slice(0, currentText.length + 1))
        }, dynamicSpeed)
      } else {
        // Finished typing, wait then start deleting (ensure continuous loop)
        setIsTyping(false)
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, pauseDuration)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentTextIndex, isTyping, isDeleting, texts, speed, pauseDuration, deleteSpeed])

  // Enhanced cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  // Split text to handle bullet points styling
  const renderText = (text: string) => {
    return text.split('•').map((part, index) => (
      <span key={index}>
        {index > 0 && <span className="text-purple-400 mx-2 animate-pulse">•</span>}
        <span className={index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-purple-600'}>
          {part.trim()}
        </span>
      </span>
    ))
  }

  return (
    <span className={className}>
      <span className="inline-block min-h-[1.2em]">
        {renderText(currentText)}
      </span>
      <span 
        className={`inline-block w-1 ml-2 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-600 transition-all duration-300 ${
          showCursor ? 'opacity-100 h-16 shadow-lg shadow-blue-500/50' : 'opacity-30 h-14'
        } ${isTyping ? 'animate-pulse' : ''}`} 
      />
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
  useAuthRedirect({
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
      {/* Enhanced custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            filter: blur(0px);
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            filter: blur(1px);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .animate-slideInLeft {
          animation: slideInLeft 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .animate-slideInRight {
          animation: slideInRight 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        .text-shimmer {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
          background-size: 200px 100%;
          animation: shimmer 3s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
        }
        .button-hover-effect {
          position: relative;
          overflow: hidden;
        }
        .button-hover-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .button-hover-effect:hover::before {
          left: 100%;
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
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 rounded-full opacity-20 animate-float blur-sm"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800 rounded-full opacity-20 animate-float blur-sm" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 rounded-full opacity-20 animate-float blur-sm" style={{ animationDelay: '4s' }}></div>
          
          {/* Additional decorative elements */}
          <div className="absolute top-60 left-1/4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-80 right-1/3 w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 dark:from-pink-500 dark:to-rose-600 rounded-full opacity-15 animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute bottom-60 right-10 w-10 h-10 bg-gradient-to-br from-indigo-400 to-blue-500 dark:from-indigo-500 dark:to-blue-600 rounded-full opacity-15 animate-float" style={{ animationDelay: '5s' }}></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Content */}
          <div className="text-center mb-20">
            <div className="animate-fadeInUp">
              <Title level={1} className="!text-6xl md:!text-8xl !mb-12 !leading-tight !font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 drop-shadow-sm">
                  <TypingText 
                    texts={['Connect', 'Connect • Diagnose', 'Connect • Diagnose • Fix']}
                    speed={80}
                    pauseDuration={3000}
                    deleteSpeed={50}
                    className="inline-block"
                  />
                </span>
              </Title>
            </div>
            
            <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Paragraph className="!text-xl md:!text-2xl text-gray-600 dark:text-gray-400 max-w-5xl mx-auto !mb-16 !leading-relaxed font-medium">
                Transform your automotive experience with our revolutionary platform that seamlessly connects 
                <span className="text-blue-600 font-semibold"> car owners</span>, 
                <span className="text-green-600 font-semibold"> expert mechanics</span>, and 
                <span className="text-purple-600 font-semibold"> trusted dealers</span> in one intelligent ecosystem.
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
                      className="!h-16 !px-12 !text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 bg-gradient-to-r from-blue-600 to-blue-700 border-none rounded-2xl relative overflow-hidden group"
                    >
                      <span className="relative z-10">Join as Car Owner</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </Button>
                    <Button
                      size="large"
                      icon={<ToolOutlined />}
                      onClick={() => setAuthModalVisible(true)}
                      className="!h-16 !px-12 !text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 bg-gradient-to-r from-green-600 to-green-700 text-white border-none rounded-2xl relative overflow-hidden group"
                    >
                      <span className="relative z-10">Join as Mechanic</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-800 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </Button>
                    <Button
                      size="large"
                      icon={<ShopOutlined />}
                      onClick={() => setAuthModalVisible(true)}
                      className="!h-16 !px-12 !text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none rounded-2xl relative overflow-hidden group"
                    >
                      <span className="relative z-10">Join as Dealer</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-800 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
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