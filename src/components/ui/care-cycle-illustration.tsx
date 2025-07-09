'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CarOutlined, 
  ToolOutlined, 
  ShopOutlined, 
  ArrowRightOutlined, 
  MessageOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  CreditCardOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  DashboardOutlined
} from '@ant-design/icons'

interface CareCycleIllustrationProps {
  className?: string
}

export const CareCycleIllustration: React.FC<CareCycleIllustrationProps> = ({ className = "" }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const arrowVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 1.5,
        ease: [0.42, 0, 0.58, 1]
      }
    }
  }

  return (
    <div className={`relative w-full max-w-6xl mx-auto ${className}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl"></div>
        
        {/* Main content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12">
          {/* Title */}
          <motion.div 
            variants={itemVariants}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Auto Care Ecosystem
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See how our platform seamlessly connects car owners, mechanics, and parts dealers in one unified system
            </p>
          </motion.div>

          {/* Main cycle illustration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Car Owner */}
            <motion.div variants={itemVariants} className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 h-full">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <CarOutlined className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Car Owner</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Vehicle maintenance requests</p>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DashboardOutlined className="text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <SearchOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Find mechanics nearby</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Chat with professionals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Track repair progress</span>
                    </div>
                  </div>
                </div>

                {/* Action Steps */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Request diagnosis</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Get repair quotes</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Monitor progress</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mechanic */}
            <motion.div variants={itemVariants} className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 h-full">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <ToolOutlined className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Mechanic</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Professional repair services</p>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DashboardOutlined className="text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mechanic Hub</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Manage client requests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SettingOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Order parts instantly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCardOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Process payments</span>
                    </div>
                  </div>
                </div>

                {/* Action Steps */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Receive requests</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Diagnose & quote</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Complete repairs</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Parts Dealer */}
            <motion.div variants={itemVariants} className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 h-full">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <ShopOutlined className="text-2xl sm:text-3xl text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Parts Dealer</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Quality auto parts supply</p>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DashboardOutlined className="text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parts Portal</span>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <SettingOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Manage inventory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Process orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-xs text-gray-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Track deliveries</span>
                    </div>
                  </div>
                </div>

                {/* Action Steps */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Receive orders</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Verify availability</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Deliver parts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Connection Flow */}
          <motion.div variants={itemVariants} className="relative">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Seamless Integration Flow
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 items-center">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <SearchOutlined className="text-lg sm:text-xl text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Request</span><br />
                    Car owner posts repair needs
                  </p>
                </div>

                {/* Arrow 1 */}
                <div className="hidden md:flex justify-center">
                  <ArrowRightOutlined className="text-gray-400 text-lg" />
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <ToolOutlined className="text-lg sm:text-xl text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Diagnose</span><br />
                    Mechanic provides quote
                  </p>
                </div>

                {/* Arrow 2 */}
                <div className="hidden md:flex justify-center">
                  <ArrowRightOutlined className="text-gray-400 text-lg" />
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <ShopOutlined className="text-lg sm:text-xl text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">Supply</span><br />
                    Dealer provides parts
                  </p>
                </div>
              </div>

              {/* Real-time Features */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <MessageOutlined className="text-2xl text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Real-time Chat</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Instant communication</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleOutlined className="text-2xl text-green-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Progress Tracking</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Live updates</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CreditCardOutlined className="text-2xl text-purple-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Secure Payments</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Trusted transactions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <DashboardOutlined className="text-2xl text-gray-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Business insights</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default CareCycleIllustration