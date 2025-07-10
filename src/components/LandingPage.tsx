'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Typography, Avatar, Dropdown } from 'antd'
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
  ArrowRightOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  YoutubeOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { AuthModal } from './auth/AuthModal'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { LampContainer } from '@/components/ui/lamp-demo'
import { motion } from 'framer-motion'
import appimage from '@/app/images/appimage.png'
import RoleSelector from '@/components/ui/role-selector'

const { Title, Paragraph, Text } = Typography

// Professional typing animation component with smooth continuous loop
const TypingText: React.FC<{ 
  texts: string[], 
  speed?: number, 
  pauseDuration?: number,
  deleteSpeed?: number,
  className?: string 
}> = ({ 
  texts, 
  speed = 120, 
  pauseDuration = 2500,
  deleteSpeed = 60,
  className = "" 
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isDeleting) {
      // Smooth character deletion
      if (currentText.length > 0) {
        const dynamicDeleteSpeed = currentText.length > 8 ? deleteSpeed : deleteSpeed * 1.2
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, dynamicDeleteSpeed)
      } else {
        setIsDeleting(false)
        setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        setIsTyping(true)
        setIsComplete(false)
      }
    } else if (isTyping) {
      // Professional typing with variable speeds
      if (currentText.length < texts[currentTextIndex].length) {
        const nextChar = texts[currentTextIndex][currentText.length]
        let dynamicSpeed = speed
        
        // Slower for special characters and spaces
        if (nextChar === '•' || nextChar === ' ') {
          dynamicSpeed = speed * 1.8
        } else if (nextChar === nextChar.toUpperCase() && nextChar !== nextChar.toLowerCase()) {
          dynamicSpeed = speed * 1.2
        }
        
        timeout = setTimeout(() => {
          setCurrentText(texts[currentTextIndex].slice(0, currentText.length + 1))
        }, dynamicSpeed)
      } else {
        // Completed current text
        setIsTyping(false)
        setIsComplete(true)
        
        const pauseTime = currentText.includes('•') ? pauseDuration * 1.2 : pauseDuration
        timeout = setTimeout(() => {
          setIsDeleting(true)
          setIsComplete(false)
        }, pauseTime)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentTextIndex, isTyping, isDeleting, texts, speed, pauseDuration, deleteSpeed])

  // Professional cursor animation
  useEffect(() => {
    const blinkSpeed = isComplete ? 300 : isTyping ? 600 : 400
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, blinkSpeed)
    return () => clearInterval(cursorInterval)
  }, [isTyping, isComplete])

  // Enhanced text rendering with professional styling
  const renderText = (text: string) => {
    const parts = text.split('•')
    return parts.map((part, index) => (
      <span key={index} className="inline-block">
        {index > 0 && (
          <span className="text-purple-400 mx-3 text-4xl md:text-6xl font-bold animate-pulse-slow transform transition-all duration-300 drop-shadow-lg">
            •
          </span>
        )}
        <span 
          className={`
            font-extrabold tracking-tight transition-all duration-500 transform drop-shadow-md
            ${index === 0 ? 'text-blue-600 hover:text-blue-700' : 
              index === 1 ? 'text-green-600 hover:text-green-700' : 
              'text-purple-600 hover:text-purple-700'}
            ${isComplete && index === parts.length - 1 ? 'animate-pulse' : ''}
          `}
          style={{
            textShadow: index === 0 ? '0 0 20px rgba(37, 99, 235, 0.3)' :
                       index === 1 ? '0 0 20px rgba(34, 197, 94, 0.3)' :
                       '0 0 20px rgba(147, 51, 234, 0.3)'
          }}
        >
          {part.trim()}
        </span>
      </span>
    ))
  }

  return (
    <div className={`${className} relative`}>
      <div className="inline-block min-h-[1.2em] relative">
        <span className="inline-block transform transition-all duration-300">
          {renderText(currentText)}
        </span>
        
        {/* Professional animated cursor */}
        <span 
          className={`
            inline-block w-1.5 ml-3 bg-gradient-to-b from-blue-400 via-purple-500 to-blue-600 
            rounded-full transition-all duration-300 shadow-lg
            ${showCursor ? 
              'opacity-100 h-16 md:h-20 shadow-blue-400/50 scale-110' : 
              'opacity-30 h-14 md:h-18 scale-95'
            }
            ${isTyping ? 'animate-pulse' : ''}
            ${isComplete ? 'animate-bounce' : ''}
          `}
          style={{
            boxShadow: showCursor ? '0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(147, 51, 234, 0.4)' : 'none'
          }}
        />
        
        {/* Subtle background glow */}
        <div className={`
          absolute inset-0 blur-sm opacity-20 transition-opacity duration-1000 pointer-events-none
          ${isComplete ? 'opacity-30' : 'opacity-10'}
        `}>
          {renderText(currentText)}
        </div>
      </div>
    </div>
  )
}


export const LandingPage: React.FC = () => {
  const { user, firebaseUser, loading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [authModalVisible, setAuthModalVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState('car-owner')
  
  // Use the auth redirect hook to handle navigation
  const { isAuthenticated, hasRole } = useAuthRedirect({
    redirectOnAuth: true, // Automatically redirect authenticated users to their dashboard
    redirectOnSignOut: true // Redirect to landing page on sign-out
  })

  // Helper function to get dashboard path based on user role
  const getDashboardPath = (userRole: string) => {
    switch (userRole) {
      case 'CarOwner': return '/dashboard/car-owner'
      case 'Mechanic': return '/dashboard/mechanic'
      case 'Dealer': return '/dashboard/dealer'
      default: return '/dashboard/car-owner'
    }
  }

  // Helper function to navigate to dashboard
  const navigateToDashboard = () => {
    if (user) {
      router.push(getDashboardPath(user.role))
    }
  }

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
      onClick: navigateToDashboard,
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

  // Show loading screen while auth is being processed
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <Text className="text-gray-600 dark:text-gray-300">Loading AutoCare...</Text>
        </div>
      </div>
    )
  }

  // Show loading screen if authenticated user is being redirected
  if (isAuthenticated && hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <Text className="text-gray-600 dark:text-gray-300">Redirecting to your dashboard...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 theme-transition overflow-hidden">


      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/80 border-b border-gray-200 dark:border-white/10 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CarOutlined className="text-xl sm:text-2xl text-brand-500" />
              <Title level={3} className="!mb-0 text-text-primary dark:!text-white !text-base sm:!text-lg font-bold theme-transition">
                AutoCare
              </Title>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Know More link - only visible when user is not logged in */}
              {!firebaseUser && (
                <Button
                  type="text"
                  onClick={() => router.push('/know-more')}
                  className="!border-none text-text-secondary dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 theme-transition !px-3 !py-1 sm:!px-4 sm:!py-2 rounded-lg text-sm sm:text-base font-medium"
                >
                  Know More?
                </Button>
              )}
              
              <Button
                type="text"
                icon={theme === 'light' ? <MoonOutlined /> : <BulbOutlined />}
                onClick={toggleTheme}
                className="!border-none text-text-secondary dark:text-slate-400 hover:text-text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 theme-transition !w-9 !h-9 sm:!w-10 sm:!h-10 !p-0 rounded-lg"
              />
              
              {firebaseUser ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {user && (
                    <span className="text-xs sm:text-sm text-text-secondary dark:text-slate-300 hidden lg:block theme-transition">
                      Welcome, {user.name || firebaseUser.displayName || 'User'}
                    </span>
                  )}
                  <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-200 theme-transition">
                      <Avatar 
                        icon={<UserOutlined />} 
                        src={firebaseUser.photoURL}
                        size="small"
                        className="border border-brand-400"
                      />
                      {user && (
                        <span className="font-medium hidden md:block text-text-primary dark:text-white theme-transition text-sm truncate max-w-20 sm:max-w-32">
                          {user.name || firebaseUser.displayName || 'User'}
                        </span>
                      )}
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <Button
                  type="primary"
                  onClick={() => setAuthModalVisible(true)}
                  className="!h-9 !px-4 sm:!h-10 sm:!px-6 !text-xs sm:!text-sm font-medium bg-brand-500 hover:bg-brand-600 border-none rounded-lg transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-medium"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Light Theme Hero */}
        <div className="hidden dark:block">
          <LampContainer className="pt-20">
            {/* Dark Theme Hero Content with automotive graphics */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
              {/* Dark theme car visualization */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-[600px] h-[300px]">
                  <svg viewBox="0 0 600 300" className="w-full h-full">
                    {/* Modern car outline */}
                    <path d="M75 180 L525 180 L510 210 L90 210 Z" fill="url(#darkCarGradient)" opacity="0.8" />
                    <path d="M120 150 L480 150 L495 180 L105 180 Z" fill="url(#darkCarGradient)" opacity="0.9" />
                    
                    {/* Car details */}
                    <path d="M150 120 L450 120 L465 150 L135 150 Z" fill="url(#darkWindowGradient)" opacity="0.6" />
                    
                    {/* Wheels */}
                    <circle cx="180" cy="210" r="30" fill="url(#darkWheelGradient)" opacity="0.8" />
                    <circle cx="420" cy="210" r="30" fill="url(#darkWheelGradient)" opacity="0.8" />
                    
                    {/* Headlights */}
                    <ellipse cx="105" cy="165" rx="8" ry="12" fill="#60A5FA" opacity="0.7" />
                    <ellipse cx="495" cy="165" rx="8" ry="12" fill="#EF4444" opacity="0.7" />
                    
                    {/* Dark theme gradients */}
                    <defs>
                      <linearGradient id="darkCarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1E293B" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#0F172A" stopOpacity="0.7" />
                      </linearGradient>
                      <linearGradient id="darkWindowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#475569" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#1E293B" stopOpacity="0.6" />
                      </linearGradient>
                      <radialGradient id="darkWheelGradient">
                        <stop offset="0%" stopColor="#374151" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#111827" stopOpacity="1" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              {/* Floating tool icons */}
              <div className="absolute top-20 left-20 animate-float" style={{ animationDelay: '2s' }}>
                <CarOutlined className="text-6xl text-slate-600" />
              </div>
              <div className="absolute bottom-20 right-20 animate-float" style={{ animationDelay: '4s' }}>
                <ToolOutlined className="text-5xl text-slate-600" />
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="text-center max-w-4xl mx-auto relative z-10"
            >
              <Title level={1} className="!text-5xl md:!text-7xl !mb-8 !leading-tight !font-bold text-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-200 to-slate-400">
                  <TypingText 
                    texts={['Connect', 'Connect • Diagnose', 'Connect • Diagnose • Fix']}
                    speed={100}
                    pauseDuration={3500}
                    deleteSpeed={55}
                    className="inline-block"
                  />
                </span>
              </Title>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6,
                  duration: 0.6,
                  ease: "easeInOut",
                }}
              >
                <Paragraph className="!text-lg md:!text-xl text-slate-300 max-w-3xl mx-auto !mb-12 !leading-relaxed">
                  Ghana's premier automotive platform connecting car owners with trusted mechanics and reliable parts dealers
                </Paragraph>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.9,
                  duration: 0.6,
                  ease: "easeInOut",
                }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                {firebaseUser ? (
                  user ? (
                    <Button
                      type="primary"
                      size="large"
                      icon={getRoleIcon(user.role)}
                      onClick={navigateToDashboard}
                      className="!h-12 !px-8 !text-base font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 bg-brand-500 hover:bg-brand-600 border-none rounded-xl"
                    >
                      Go to Dashboard <ArrowRightOutlined />
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => router.push('/auth/role-selection')}
                      className="!h-12 !px-8 !text-base font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 bg-brand-500 hover:bg-brand-600 border-none rounded-xl"
                    >
                      Complete Your Profile <ArrowRightOutlined />
                    </Button>
                  )
                ) : (
                  <>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => setAuthModalVisible(true)}
                      className="!h-12 !px-8 !text-base font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-105 bg-brand-500 hover:bg-brand-600 border-none rounded-xl"
                    >
                      Get Started <ArrowRightOutlined />
                    </Button>
                    <Button
                      size="large"
                      onClick={() => router.push('/know-more')}
                      className="!h-12 !px-8 !text-base font-medium text-slate-300 hover:text-white border-slate-600 hover:border-slate-400 bg-transparent hover:bg-slate-800/30 rounded-xl transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
          </LampContainer>
        </div>

        {/* Light Theme Hero */}
        <div className="dark:hidden min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50" style={{
          backgroundImage: `url(${appimage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/80 to-indigo-50/90"></div>
          {/* Professional automotive hero graphics */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Car silhouette - hidden on mobile */}
            <div className="absolute top-1/2 right-10 transform -translate-y-1/2 hidden lg:block">
              <div className="w-96 h-48 opacity-10 group-hover:opacity-20 transition-opacity duration-1000">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  {/* Car body */}
                  <path d="M50 120 L350 120 L340 140 L60 140 Z" fill="url(#carGradient)" opacity="0.6" />
                  <path d="M80 100 L320 100 L330 120 L70 120 Z" fill="url(#carGradient)" opacity="0.8" />
                  
                  {/* Car windows */}
                  <path d="M100 80 L300 80 L310 100 L90 100 Z" fill="url(#windowGradient)" opacity="0.4" />
                  
                  {/* Wheels */}
                  <circle cx="120" cy="140" r="20" fill="url(#wheelGradient)" opacity="0.7" />
                  <circle cx="280" cy="140" r="20" fill="url(#wheelGradient)" opacity="0.7" />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.5" />
                    </linearGradient>
                    <radialGradient id="wheelGradient">
                      <stop offset="0%" stopColor="#374151" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#111827" stopOpacity="0.9" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            {/* Floating elements - responsive sizing */}
            <div className="absolute top-20 left-2 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full opacity-60 animate-float blur-sm"></div>
            <div className="absolute top-40 right-4 sm:right-20 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full opacity-60 animate-float blur-sm" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-40 left-4 sm:left-20 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full opacity-60 animate-float blur-sm" style={{ animationDelay: '4s' }}></div>
            
            {/* Tool icons floating - responsive */}
            <div className="absolute top-32 left-1/4 opacity-20 animate-float hidden sm:block" style={{ animationDelay: '1s' }}>
              <ToolOutlined className="text-2xl sm:text-4xl text-secondary-500" />
            </div>
            <div className="absolute bottom-32 right-1/4 opacity-20 animate-float hidden sm:block" style={{ animationDelay: '3s' }}>
              <ShopOutlined className="text-xl sm:text-3xl text-accent-500" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-center max-w-4xl mx-auto px-4 sm:px-6 relative z-10"
          >
            {/* Professional badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-brand-100 to-brand-200 text-brand-800 text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-soft"
            >
              <CarOutlined className="mr-1 sm:mr-2 text-sm sm:text-base" />
              <span className="hidden sm:inline">Ghana's #1 Automotive Platform</span>
              <span className="sm:hidden">#1 Auto Platform</span>
            </motion.div>
            <Title level={1} className="!text-3xl sm:!text-5xl md:!text-7xl !mb-6 sm:!mb-8 !leading-tight !font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
                <TypingText 
                  texts={['Connect', 'Connect • Diagnose', 'Connect • Diagnose • Fix']}
                  speed={100}
                  pauseDuration={3500}
                  deleteSpeed={55}
                  className="inline-block"
                />
              </span>
            </Title>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                duration: 0.6,
                ease: "easeInOut",
              }}
            >
              <Paragraph className="!text-base sm:!text-lg md:!text-xl text-text-secondary max-w-3xl mx-auto !mb-8 sm:!mb-12 !leading-relaxed px-4 sm:px-0">
                Ghana's premier automotive platform connecting car owners with trusted mechanics and reliable parts dealers
              </Paragraph>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.9,
                duration: 0.6,
                ease: "easeInOut",
              }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0"
            >
              {firebaseUser ? (
                user ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={getRoleIcon(user.role)}
                    onClick={navigateToDashboard}
                    className="!h-11 !px-6 sm:!h-12 sm:!px-8 !text-sm sm:!text-base font-medium shadow-medium hover:shadow-hard transition-all duration-300 transform hover:scale-105 bg-brand-500 hover:bg-brand-600 border-none rounded-xl w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Go to Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                    <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push('/auth/role-selection')}
                    className="!h-11 !px-6 sm:!h-12 sm:!px-8 !text-sm sm:!text-base font-medium shadow-medium hover:shadow-hard transition-all duration-300 transform hover:scale-105 bg-brand-500 hover:bg-brand-600 border-none rounded-xl w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Complete Your Profile</span>
                    <span className="sm:hidden">Complete Profile</span>
                    <ArrowRightOutlined />
                  </Button>
                )
              ) : (
                <>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setAuthModalVisible(true)}
                    className="!h-11 !px-6 sm:!h-12 sm:!px-8 !text-sm sm:!text-base font-medium shadow-medium hover:shadow-hard transition-all duration-300 transform hover:scale-105 bg-brand-500 hover:bg-brand-600 border-none rounded-xl w-full sm:w-auto"
                  >
                    Get Started <ArrowRightOutlined />
                  </Button>
                  <Button
                    size="large"
                    onClick={() => router.push('/know-more')}
                    className="!h-11 !px-6 sm:!h-12 sm:!px-8 !text-sm sm:!text-base font-medium text-text-secondary hover:text-text-primary border-gray-300 hover:border-brand-400 bg-transparent hover:bg-brand-50 rounded-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 dark:-mt-20 relative z-10">

          {/* Role Cards Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12 sm:mb-20"
          >
            <Title level={2} className="text-center text-text-primary dark:!text-white !mb-3 sm:!mb-4 !text-2xl sm:!text-3xl md:!text-4xl theme-transition">
              Choose Your Professional Role
            </Title>
            <Paragraph className="text-center text-text-secondary dark:!text-slate-400 !mb-6 sm:!mb-8 !text-base sm:!text-lg max-w-2xl mx-auto theme-transition px-4 sm:px-0">
              Join Ghana's most trusted automotive platform designed for professionals at every level of the industry
            </Paragraph>
            
            {/* Role Selector */}
            <div className="flex justify-center mb-8 sm:mb-12 px-4 sm:px-0">
              <RoleSelector 
                onRoleSelect={setSelectedRole} 
                selectedRole={selectedRole}
              />
            </div>
            
            {/* Professional Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {/* Car Owner Card */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                whileHover={{ 
                  y: -12, 
                  rotateY: 2, 
                  transition: { duration: 0.3, ease: "easeOut" } 
                }}
                className={`group relative perspective-1000 ${selectedRole === 'car-owner' ? 'ring-2 ring-brand-400 ring-offset-2' : ''}`}>
                {/* Gradient background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400/20 via-brand-500/20 to-brand-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                
                <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-brand-200/50 dark:border-brand-300/20 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:border-brand-300 dark:hover:border-brand-400/60 theme-transition cursor-pointer overflow-hidden"
                     onClick={() => setAuthModalVisible(true)}
                     style={{ filter: selectedRole === 'car-owner' ? 'url("#radio-glass")' : 'none' }}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/20 dark:to-brand-800/20 transform rotate-12 scale-150"></div>
                  </div>
                  
                  {/* Floating icon container */}
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 rounded-2xl mb-4 sm:mb-6 group-hover:from-brand-200 group-hover:to-brand-300 dark:group-hover:from-brand-800/60 dark:group-hover:to-brand-700/60 transition-all duration-500 relative shadow-lg"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      transition: { duration: 0.3 } 
                    }}
                  >
                    <CarOutlined className="text-2xl sm:text-3xl text-brand-600 dark:text-brand-400 theme-transition" />
                    {/* Floating particles */}
                    <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-2 h-2 bg-brand-400 rounded-full animate-ping"></div>
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Title level={3} className="!text-brand-700 dark:!text-brand-300 !mb-3 !text-xl font-bold theme-transition">
                      Car Owner
                    </Title>
                    <Paragraph className="text-text-secondary dark:!text-slate-400 !mb-6 !text-base leading-relaxed theme-transition">
                      Connect with trusted mechanics and track your vehicle's maintenance history with our comprehensive platform
                    </Paragraph>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-3 mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {[
                      'Submit repair requests instantly',
                      'Track maintenance history',
                      'Get transparent quotes'
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center text-sm text-text-secondary dark:text-slate-400 theme-transition"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      >
                        <CheckCircleOutlined className="text-brand-500 mr-3 text-base" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <motion.div 
                    className="text-xs text-text-tertiary dark:text-slate-500 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30 px-4 py-3 rounded-xl theme-transition border border-brand-200/50 dark:border-brand-700/30"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <StarFilled className="text-brand-500 mr-2" />
                    Perfect for vehicle owners seeking reliable service
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Mechanic Card */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                whileHover={{ 
                  y: -12, 
                  rotateY: -2, 
                  transition: { duration: 0.3, ease: "easeOut" } 
                }}
                className={`group relative perspective-1000 ${selectedRole === 'mechanic' ? 'ring-2 ring-secondary-400 ring-offset-2' : ''}`}>
                {/* Gradient background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-400/20 via-secondary-500/20 to-secondary-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                
                <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-secondary-200/50 dark:border-secondary-300/20 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:border-secondary-300 dark:hover:border-secondary-400/60 theme-transition cursor-pointer overflow-hidden"
                     onClick={() => setAuthModalVisible(true)}
                     style={{ filter: selectedRole === 'mechanic' ? 'url("#radio-glass")' : 'none' }}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/20 dark:to-secondary-800/20 transform -rotate-12 scale-150"></div>
                  </div>
                  
                  {/* Floating icon container */}
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/50 dark:to-secondary-800/50 rounded-2xl mb-4 sm:mb-6 group-hover:from-secondary-200 group-hover:to-secondary-300 dark:group-hover:from-secondary-800/60 dark:group-hover:to-secondary-700/60 transition-all duration-500 relative shadow-lg"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: -5,
                      transition: { duration: 0.3 } 
                    }}
                  >
                    <ToolOutlined className="text-2xl sm:text-3xl text-secondary-600 dark:text-secondary-400 theme-transition" />
                    {/* Floating particles */}
                    <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-2 h-2 bg-secondary-400 rounded-full animate-ping"></div>
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-secondary-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Title level={3} className="!text-secondary-700 dark:!text-secondary-300 !mb-3 !text-xl font-bold theme-transition">
                      Mechanic
                    </Title>
                    <Paragraph className="text-text-secondary dark:!text-slate-400 !mb-6 !text-base leading-relaxed theme-transition">
                      Grow your business by connecting with customers who need professional automotive services
                    </Paragraph>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-3 mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {[
                      'Claim nearby service requests',
                      'Set your service radius',
                      'Digital diagnosis tools'
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center text-sm text-text-secondary dark:text-slate-400 theme-transition"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      >
                        <CheckCircleOutlined className="text-secondary-500 mr-3 text-base" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <motion.div 
                    className="text-xs text-text-tertiary dark:text-slate-500 bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 px-4 py-3 rounded-xl theme-transition border border-secondary-200/50 dark:border-secondary-700/30"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <StarFilled className="text-secondary-500 mr-2" />
                    Ideal for automotive professionals
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Parts Dealer Card */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                whileHover={{ 
                  y: -12, 
                  rotateY: 2, 
                  transition: { duration: 0.3, ease: "easeOut" } 
                }}
                className={`group relative md:col-span-2 lg:col-span-1 perspective-1000 ${selectedRole === 'dealer' ? 'ring-2 ring-accent-400 ring-offset-2' : ''}`}>
                {/* Gradient background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400/20 via-accent-500/20 to-accent-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                
                <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-accent-200/50 dark:border-accent-300/20 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:border-accent-300 dark:hover:border-accent-400/60 theme-transition cursor-pointer overflow-hidden"
                     onClick={() => setAuthModalVisible(true)}
                     style={{ filter: selectedRole === 'dealer' ? 'url("#radio-glass")' : 'none' }}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/20 dark:to-accent-800/20 transform rotate-6 scale-150"></div>
                  </div>
                  
                  {/* Floating icon container */}
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/50 dark:to-accent-800/50 rounded-2xl mb-4 sm:mb-6 group-hover:from-accent-200 group-hover:to-accent-300 dark:group-hover:from-accent-800/60 dark:group-hover:to-accent-700/60 transition-all duration-500 relative shadow-lg"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 3,
                      transition: { duration: 0.3 } 
                    }}
                  >
                    <ShopOutlined className="text-2xl sm:text-3xl text-accent-600 dark:text-accent-400 theme-transition" />
                    {/* Floating particles */}
                    <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-2 h-2 bg-accent-400 rounded-full animate-ping"></div>
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-accent-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Title level={3} className="!text-accent-700 dark:!text-accent-300 !mb-3 !text-xl font-bold theme-transition">
                      Parts Dealer
                    </Title>
                    <Paragraph className="text-text-secondary dark:!text-slate-400 !mb-6 !text-base leading-relaxed theme-transition">
                      Expand your reach by connecting with mechanics who need quality automotive parts
                    </Paragraph>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-3 mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    {[
                      'Manage parts inventory',
                      'Connect with mechanics',
                      'Process orders efficiently'
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center text-sm text-text-secondary dark:text-slate-400 theme-transition"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      >
                        <CheckCircleOutlined className="text-accent-500 mr-3 text-base" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <motion.div 
                    className="text-xs text-text-tertiary dark:text-slate-500 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 px-4 py-3 rounded-xl theme-transition border border-accent-200/50 dark:border-accent-700/30"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <StarFilled className="text-accent-500 mr-2" />
                    Perfect for parts suppliers and dealers
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Add Glass Filter SVG */}
          <svg className="hidden">
            <defs>
              <filter
                id="radio-glass"
                x="0%"
                y="0%"
                width="100%"
                height="100%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.05 0.05"
                  numOctaves="1"
                  seed="1"
                  result="turbulence"
                />
                <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="blurredNoise"
                  scale="30"
                  xChannelSelector="R"
                  yChannelSelector="B"
                  result="displaced"
                />
                <feGaussianBlur in="displaced" stdDeviation="2" result="finalBlur" />
                <feComposite in="finalBlur" in2="finalBlur" operator="over" />
              </filter>
            </defs>
          </svg>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-20"
          >
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:bg-white/5 backdrop-blur-sm border border-brand-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 theme-transition">
              <Title level={2} className="text-text-primary dark:!text-white !mb-6 sm:!mb-8 !text-xl sm:!text-2xl md:!text-3xl theme-transition">
                Trusted by automotive professionals across Ghana
              </Title>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-center"
                >
                  <Title level={1} className="!text-brand-600 dark:!text-brand-400 !mb-1 sm:!mb-2 !text-3xl sm:!text-4xl md:!text-5xl font-bold theme-transition">10K+</Title>
                  <Paragraph className="text-text-secondary dark:!text-slate-300 !mb-0 !text-sm sm:!text-base theme-transition">Active Users</Paragraph>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-center"
                >
                  <Title level={1} className="!text-secondary-600 dark:!text-secondary-400 !mb-1 sm:!mb-2 !text-3xl sm:!text-4xl md:!text-5xl font-bold theme-transition">5K+</Title>
                  <Paragraph className="text-text-secondary dark:!text-slate-300 !mb-0 !text-sm sm:!text-base theme-transition">Repairs Completed</Paragraph>
                  <Text className="text-text-tertiary dark:!text-slate-400 text-xs sm:text-sm theme-transition">All currencies in GHS</Text>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="text-center"
                >
                  <Title level={1} className="!text-accent-600 dark:!text-accent-400 !mb-1 sm:!mb-2 !text-3xl sm:!text-4xl md:!text-5xl font-bold theme-transition">1K+</Title>
                  <Paragraph className="text-text-secondary dark:!text-slate-300 !mb-0 !text-sm sm:!text-base theme-transition">Parts Available</Paragraph>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-950/90 backdrop-blur-sm border-t border-gray-200 dark:border-white/10 py-8 sm:py-12 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <CarOutlined className="text-xl sm:text-2xl text-brand-500" />
                <Title level={3} className="text-text-primary dark:!text-white !mb-0 !text-lg sm:!text-xl theme-transition">AutoCare</Title>
              </div>
              <Paragraph className="text-text-secondary dark:!text-slate-400 !text-sm sm:!text-base !mb-4 theme-transition">
                Connecting automotive professionals across Ghana through our innovative platform.
              </Paragraph>
              {/* Social Media Icons */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-100 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
                  aria-label="Facebook"
                >
                  <FacebookOutlined className="text-sm sm:text-base text-brand-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-100 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
                  aria-label="Twitter"
                >
                  <TwitterOutlined className="text-sm sm:text-base text-brand-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-100 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
                  aria-label="Instagram"
                >
                  <InstagramOutlined className="text-sm sm:text-base text-brand-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-100 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
                  aria-label="LinkedIn"
                >
                  <LinkedinOutlined className="text-sm sm:text-base text-brand-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-100 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
                  aria-label="YouTube"
                >
                  <YoutubeOutlined className="text-sm sm:text-base text-brand-600 dark:text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <Title level={4} className="text-text-primary dark:!text-white !mb-3 sm:!mb-4 !text-base sm:!text-lg theme-transition">Platform</Title>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a href="/know-more" className="text-text-secondary dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm sm:text-base">
                    How It Works?
                  </a>
                </li>
                <li>
                  <a href="/auth/role-selection" className="text-text-secondary dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm sm:text-base">
                    Get Started
                  </a>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    For Car Owners
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    For Mechanics
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    For Dealers
                  </span>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <Title level={4} className="text-text-primary dark:!text-white !mb-3 sm:!mb-4 !text-base sm:!text-lg theme-transition">Support</Title>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Help Center
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Contact Us
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Safety Guidelines
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Report Issue
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <Title level={4} className="text-text-primary dark:!text-white !mb-3 sm:!mb-4 !text-base sm:!text-lg theme-transition">Legal</Title>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Terms of Service
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Privacy Policy
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Cookie Policy
                  </span>
                </li>
                <li>
                  <span className="text-text-secondary dark:text-slate-400 text-sm sm:text-base cursor-not-allowed opacity-60">
                    Disclaimer
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-6 sm:pt-8 border-t border-gray-200 dark:border-white/10 text-center">
            <div className="text-xs sm:text-sm text-text-tertiary dark:text-slate-500 theme-transition">
              © {new Date().getFullYear()} AutoCare Connect • All rights reserved
            </div>
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