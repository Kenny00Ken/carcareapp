'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Typography, Card } from 'antd'
import {
  CarOutlined,
  ToolOutlined,
  ShopOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Paragraph } = Typography

const KnowMorePage: React.FC = () => {
  const router = useRouter()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const roles = [
    {
      title: "Car Owner",
      icon: <CarOutlined className="text-3xl" />,
      description: "Connect with trusted mechanics and track your vehicle's maintenance history",
      color: "brand"
    },
    {
      title: "Mechanic",
      icon: <ToolOutlined className="text-3xl" />,
      description: "Grow your business by connecting with car owners who need your services",
      color: "secondary"
    },
    {
      title: "Parts Dealer",
      icon: <ShopOutlined className="text-3xl" />,
      description: "Supply quality auto parts to mechanics and car owners across Ghana",
      color: "accent"
    }
  ]

  const workflow = [
    {
      title: "Connect",
      icon: <SearchOutlined className="text-2xl" />,
      description: "Browse and connect with verified automotive professionals in your area"
    },
    {
      title: "Service",
      icon: <ToolOutlined className="text-2xl" />,
      description: "Get professional diagnostics, repairs, and quality parts with transparent pricing"
    },
    {
      title: "Track",
      icon: <CheckCircleOutlined className="text-2xl" />,
      description: "Monitor progress with real-time updates and maintain your vehicle history"
    }
  ]

  const features = [
    {
      icon: <SafetyOutlined className="text-2xl text-brand-600" />,
      title: "Verified Professionals",
      description: "All mechanics and dealers are verified and rated by the community"
    },
    {
      icon: <ClockCircleOutlined className="text-2xl text-secondary-600" />,
      title: "Real-time Updates",
      description: "Get live updates on your repair progress throughout the service"
    },
    {
      icon: <DollarOutlined className="text-2xl text-accent-600" />,
      title: "Transparent Pricing",
      description: "Clear pricing with no hidden fees before any work begins"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 theme-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-slate-950/90 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CarOutlined className="text-2xl text-brand-500" />
              <Title level={3} className="!mb-0 text-text-primary dark:!text-white !text-lg font-bold">
                AutoCare Connect
              </Title>
            </div>

            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/')}
              className="text-text-secondary dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
            >
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"></div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-brand-400 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-1/3 w-3 h-3 bg-secondary-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-accent-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeInUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-brand-200 dark:border-brand-700 mb-6 shadow-sm">
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">Ghana's Automotive Ecosystem</span>
            </div>

            <Title level={1} className="!text-4xl sm:!text-5xl !mb-4 !font-bold text-text-primary dark:!text-white">
              How AutoCare <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-secondary-600">Works</span>
            </Title>
            <Paragraph className="!text-lg text-text-secondary dark:!text-slate-400 max-w-2xl mx-auto">
              Seamlessly connecting car owners, mechanics, and parts dealers for quality automotive care
            </Paragraph>
          </motion.div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-white dark:bg-slate-950 relative">
        {/* Connection Lines Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <path d="M 10,50 Q 50,30 90,50" stroke="url(#line-gradient)" strokeWidth="2" fill="none" opacity="0.5" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Title level={2} className="!text-3xl !mb-3 text-text-primary dark:!text-white">
              Three Connected Roles
            </Title>
            <Paragraph className="text-text-secondary dark:!text-slate-400">
              Each role plays a vital part in the automotive ecosystem
            </Paragraph>
          </motion.div>

          {/* Connected Roles Grid */}
          <div className="relative">
            {/* Connection Lines for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-200 via-secondary-200 to-accent-200 dark:from-brand-800 dark:via-secondary-800 dark:to-accent-800 transform -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {roles.map((role, index) => (
                <motion.div
                  key={index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Connection Indicator */}
                  {index < roles.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center">
                        <ArrowRightOutlined className="text-xs text-gray-400" />
                      </div>
                    </div>
                  )}

                  <Card
                    className={`h-full bg-gradient-to-br from-white to-${role.color}-50 dark:from-slate-800 dark:to-${role.color}-900/20 border-2 border-${role.color}-200 dark:border-${role.color}-700/50 hover:shadow-xl hover:border-${role.color}-400 dark:hover:border-${role.color}-500 transition-all duration-300 hover:-translate-y-2 group`}
                  >
                    <div className="text-center relative">
                      {/* Decorative Badge */}
                      <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-${role.color}-400 to-${role.color}-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {index + 1}
                      </div>

                      <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${role.color}-500 to-${role.color}-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        {role.icon}
                      </div>

                      <Title level={4} className="!text-lg !mb-2 text-text-primary dark:!text-white">
                        {role.title}
                      </Title>

                      <Paragraph className="!text-sm text-text-secondary dark:!text-slate-400 !mb-0">
                        {role.description}
                      </Paragraph>

                      {/* Pulse Effect */}
                      <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-${role.color}-400 to-${role.color}-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Connector */}
      <div className="relative h-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-px h-full bg-gradient-to-b from-transparent via-brand-300 to-transparent dark:via-brand-700"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white dark:bg-slate-950 border-2 border-brand-300 dark:border-brand-700 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-secondary-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-brand-50/30 to-secondary-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-900/50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-40 h-40 bg-brand-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full border border-brand-200 dark:border-brand-700 mb-4 shadow-sm">
              <CheckCircleOutlined className="text-brand-500" />
              <span className="text-sm font-medium text-brand-600 dark:text-brand-400">The Journey</span>
            </div>

            <Title level={2} className="!text-3xl !mb-3 text-text-primary dark:!text-white">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-secondary-600 to-accent-600">Automotive Care</span> Journey
            </Title>
            <Paragraph className="text-text-secondary dark:!text-slate-400 max-w-2xl mx-auto">
              Three simple steps from connection to completion
            </Paragraph>
          </motion.div>

          {/* Workflow Steps with Connection Line */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-brand-200 via-secondary-200 to-accent-200 dark:from-brand-800 dark:via-secondary-800 dark:to-accent-800 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-400 via-secondary-400 to-accent-400 opacity-50 animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {workflow.map((step, index) => {
                const colors = ['brand', 'secondary', 'accent']
                const color = colors[index]

                return (
                  <motion.div
                    key={index}
                    {...fadeInUp}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="text-center group">
                      {/* Step Number with Animation */}
                      <div className="relative inline-block mb-6">
                        <div className={`absolute inset-0 bg-${color}-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                        <div className={`relative w-16 h-16 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
                          {step.icon}
                        </div>

                        {/* Step Number Badge */}
                        <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-950 border-2 border-${color}-400 rounded-full flex items-center justify-center text-${color}-600 dark:text-${color}-400 text-sm font-bold shadow-lg`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-transparent group-hover:border-${color}-200 dark:group-hover:border-${color}-800 transition-all">
                        <Title level={4} className="!text-lg !mb-3 text-text-primary dark:!text-white">
                          {step.title}
                        </Title>

                        <Paragraph className="!text-sm text-text-secondary dark:!text-slate-400 !mb-0">
                          {step.description}
                        </Paragraph>
                      </div>

                      {/* Arrow Indicator */}
                      {index < workflow.length - 1 && (
                        <div className="hidden md:block absolute top-8 -right-6 transform -translate-y-1/2">
                          <div className={`w-12 h-12 bg-white dark:bg-slate-950 border-2 border-${color}-200 dark:border-${color}-800 rounded-full flex items-center justify-center shadow-lg`}>
                            <ArrowRightOutlined className={`text-${color}-500`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Title level={2} className="!text-3xl !mb-3 text-text-primary dark:!text-white">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-secondary-600">AutoCare</span>?
            </Title>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const gradients = [
                'from-brand-500 to-brand-600',
                'from-secondary-500 to-secondary-600',
                'from-accent-500 to-accent-600'
              ]

              return (
                <motion.div
                  key={index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.15 }}
                  className="group"
                >
                  <Card className="h-full text-center bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-gray-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="mb-4 transform group-hover:scale-110 transition-transform">
                      <div className={`inline-flex w-12 h-12 bg-gradient-to-br ${gradients[index]} rounded-xl items-center justify-center text-white mb-2 shadow-lg`}>
                        {feature.icon}
                      </div>
                    </div>

                    <Title level={4} className="!text-base !mb-2 text-text-primary dark:!text-white font-semibold">
                      {feature.title}
                    </Title>

                    <Paragraph className="!text-sm text-text-secondary dark:!text-slate-400 !mb-0">
                      {feature.description}
                    </Paragraph>

                    {/* Hover Underline */}
                    <div className="mt-4 h-1 w-0 group-hover:w-16 mx-auto bg-gradient-to-r from-brand-400 to-secondary-400 rounded-full transition-all duration-300"></div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 via-brand-700 to-secondary-700 dark:from-brand-700 dark:via-brand-800 dark:to-secondary-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div {...fadeInUp}>
            {/* Icon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">Join Us Today</span>
            </div>

            <Title level={2} className="!text-3xl sm:!text-4xl !mb-4 !text-white">
              Ready to Transform Your <br className="hidden sm:block" />
              <span className="text-brand-100">Automotive Experience</span>?
            </Title>

            <Paragraph className="!text-lg !text-white/90 !mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied users on Ghana's premier automotive platform
            </Paragraph>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                type="primary"
                size="large"
                onClick={() => router.push('/')}
                className="!bg-white !text-brand-600 hover:!bg-brand-50 hover:!scale-105 !h-14 !px-10 !text-base font-semibold rounded-xl shadow-2xl transition-all duration-300"
              >
                Get Started Now <ArrowRightOutlined />
              </Button>

              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircleOutlined className="text-brand-200" />
                <span>Free to join • No credit card required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CarOutlined className="text-xl text-brand-500" />
            <Title level={4} className="!mb-0 text-text-primary dark:!text-white">AutoCare Connect</Title>
          </div>

          <Paragraph className="text-text-secondary dark:!text-slate-400 !text-sm !mb-3">
            Connecting automotive professionals across Ghana
          </Paragraph>

          <div className="flex items-center justify-center gap-4 mb-3">
            <a
              href="/terms"
              target="_blank"
              className="text-sm text-text-secondary dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
            >
              Terms
            </a>
            <span className="text-text-tertiary">•</span>
            <a
              href="/privacy"
              target="_blank"
              className="text-sm text-text-secondary dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
            >
              Privacy
            </a>
          </div>

          <div className="text-sm text-text-tertiary dark:text-slate-500">
            © {new Date().getFullYear()} AutoCare Connect
          </div>
        </div>
      </footer>
    </div>
  )
}

export default KnowMorePage