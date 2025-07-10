'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, Typography, Card, Steps, Row, Col, Space, Divider } from 'antd'
import { 
  CarOutlined, 
  ToolOutlined, 
  ShopOutlined, 
  ArrowRightOutlined,
  SearchOutlined,
  UserOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  PhoneOutlined,
  HomeOutlined,
  StarFilled,
  SafetyOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { WorkflowIllustration } from '@/components/ui/workflow-illustration'
import { CareCycleIllustration } from '@/components/ui/care-cycle-illustration'

const { Title, Paragraph, Text } = Typography

const KnowMorePage: React.FC = () => {
  const router = useRouter()

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const userRoles = [
    {
      title: "Car Owner",
      icon: <CarOutlined className="text-4xl text-brand-600" />,
      description: "Get your vehicle diagnosed and repaired by trusted mechanics in Ghana with full transparency",
      gradient: "from-brand-500 to-brand-600",
      bgColor: "bg-brand-50",
      borderColor: "border-brand-200",
      dashboardFeatures: [
        { icon: <SearchOutlined />, text: "Find nearby mechanics", description: "Location-based search with ratings" },
        { icon: <MessageOutlined />, text: "Chat with professionals", description: "Real-time messaging with photos" },
        { icon: <CheckCircleOutlined />, text: "Track repair progress", description: "Live updates with completion timeline" },
        { icon: <StarFilled />, text: "Rate and review services", description: "Help build community trust" },
        { icon: <CarOutlined />, text: "Manage your vehicles", description: "Vehicle history and maintenance records" },
        { icon: <DollarOutlined />, text: "Compare pricing", description: "Multiple quotes from verified mechanics" }
      ]
    },
    {
      title: "Mechanic",
      icon: <ToolOutlined className="text-4xl text-secondary-600" />,
      description: "Connect with car owners and grow your automotive repair business with powerful tools",
      gradient: "from-secondary-500 to-secondary-600",
      bgColor: "bg-secondary-50",
      borderColor: "border-secondary-200",
      dashboardFeatures: [
        { icon: <UserOutlined />, text: "Professional profile", description: "Showcase skills and certifications" },
        { icon: <BellOutlined />, text: "Receive repair requests", description: "Real-time notifications for new jobs" },
        { icon: <BarChartOutlined />, text: "Business analytics", description: "Track income and performance metrics" },
        { icon: <DollarOutlined />, text: "Manage earnings", description: "Payment processing and financial tracking" },
        { icon: <SettingOutlined />, text: "Order parts instantly", description: "Direct connection to parts dealers" },
        { icon: <TeamOutlined />, text: "Client management", description: "Organize customer relationships" }
      ]
    },
    {
      title: "Parts Dealer",
      icon: <ShopOutlined className="text-4xl text-accent-600" />,
      description: "Supply quality auto parts to mechanics and car owners across Ghana efficiently",
      gradient: "from-accent-500 to-accent-600",
      bgColor: "bg-accent-50",
      borderColor: "border-accent-200",
      dashboardFeatures: [
        { icon: <SettingOutlined />, text: "Inventory management", description: "Track stock levels and product catalog" },
        { icon: <TeamOutlined />, text: "Connect with mechanics", description: "Build relationships with repair shops" },
        { icon: <ClockCircleOutlined />, text: "Process orders", description: "Streamlined order fulfillment system" },
        { icon: <BarChartOutlined />, text: "Sales analytics", description: "Monitor performance and trends" },
        { icon: <PhoneOutlined />, text: "Customer support", description: "Direct communication channels" },
        { icon: <DollarOutlined />, text: "Financial tracking", description: "Revenue and payment management" }
      ]
    }
  ]

  const workflowSteps = [
    {
      title: "Connect",
      icon: <UserOutlined className="text-2xl" />,
      description: "Car owners connect with trusted mechanics and parts dealers on our platform",
      details: [
        "Create your profile and specify your needs",
        "Browse verified professionals in your area",
        "View ratings, reviews, and specializations",
        "Select the right professional for your needs"
      ]
    },
    {
      title: "Diagnose",
      icon: <SearchOutlined className="text-2xl" />,
      description: "Professional mechanics diagnose vehicle issues and provide expert solutions",
      details: [
        "Mechanics perform thorough vehicle diagnostics",
        "Detailed reports with photos and explanations",
        "Transparent pricing and repair estimates",
        "Parts requirements identified and sourced"
      ]
    },
    {
      title: "Repair",
      icon: <ToolOutlined className="text-2xl" />,
      description: "Quality repairs completed with genuine parts and professional service",
      details: [
        "Professional repairs using quality parts",
        "Real-time progress updates and photos",
        "Direct communication throughout the process",
        "Quality assurance and service guarantees"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 theme-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/80 border-b border-gray-200 dark:border-white/10 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <CarOutlined className="text-xl sm:text-2xl text-brand-500" />
              <Title level={3} className="!mb-0 text-text-primary dark:!text-white !text-base sm:!text-lg font-bold theme-transition">
                AutoCare
              </Title>
            </div>
            
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/')}
              className="!border-none text-text-secondary dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 theme-transition !px-3 !py-1 sm:!px-4 sm:!py-2 rounded-lg text-sm sm:text-base font-medium"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-800 theme-transition"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <Title level={1} className="!text-3xl sm:!text-4xl md:!text-5xl !mb-6 !font-bold text-text-primary dark:!text-white theme-transition">
              How AutoCare <span className="text-brand-600 dark:text-brand-400">Works</span>
            </Title>
            <Paragraph className="!text-lg sm:!text-xl text-text-secondary dark:!text-slate-400 !mb-8 max-w-3xl mx-auto theme-transition">
              Discover how Ghana's premier automotive platform connects car owners, mechanics, and parts dealers 
              in a seamless ecosystem for vehicle care and repair.
            </Paragraph>
            
            {/* Professional Workflow Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-12 mb-8"
            >
              <CareCycleIllustration className="max-w-6xl mx-auto" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Title level={2} className="!text-2xl sm:!text-3xl !mb-4 text-text-primary dark:!text-white theme-transition">
              Choose Your Role
            </Title>
            <Paragraph className="!text-base sm:!text-lg text-text-secondary dark:!text-slate-400 max-w-2xl mx-auto theme-transition">
              AutoCare serves three key players in Ghana's automotive ecosystem, each with specialized dashboards and tools
            </Paragraph>
          </motion.div>

          <motion.div variants={staggerChildren} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {userRoles.map((role, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group"
              >
                <Card
                  className={`h-full ${role.bgColor} ${role.borderColor} border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 theme-transition`}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      {role.icon}
                    </div>
                    <Title level={3} className="!text-xl !mb-2 text-text-primary dark:!text-white theme-transition">
                      {role.title}
                    </Title>
                    <Paragraph className="!text-sm text-text-secondary dark:!text-slate-400 theme-transition">
                      {role.description}
                    </Paragraph>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Dashboard Features
                      </h4>
                    </div>
                    {role.dashboardFeatures.slice(0, 4).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start text-sm">
                        <span className="text-brand-500 mr-3 mt-1 flex-shrink-0">{feature.icon}</span>
                        <div>
                          <div className="text-text-primary dark:text-white font-medium">{feature.text}</div>
                          <div className="text-text-secondary dark:text-slate-400 text-xs mt-1">{feature.description}</div>
                        </div>
                      </div>
                    ))}
                    {role.dashboardFeatures.length > 4 && (
                      <div className="text-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{role.dashboardFeatures.length - 4} more features
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-slate-900/50 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Title level={2} className="!text-2xl sm:!text-3xl !mb-4 text-text-primary dark:!text-white theme-transition">
              The AutoCare Cycle
            </Title>
            <Paragraph className="!text-base sm:!text-lg text-text-secondary dark:!text-slate-400 max-w-2xl mx-auto theme-transition">
              Our platform follows a simple 3-step process that ensures quality automotive care
            </Paragraph>
          </motion.div>

          <motion.div {...fadeInUp}>
            <Steps
              direction="horizontal"
              current={-1}
              className="mb-12"
              responsive={false}
              items={workflowSteps.map((step, index) => ({
                title: step.title,
                icon: step.icon,
                description: step.description
              }))}
            />
          </motion.div>

          <motion.div variants={staggerChildren} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card
                  className="h-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 theme-transition"
                  bodyStyle={{ padding: '24px' }}
                >
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                    <Title level={3} className="!text-lg !mb-2 text-text-primary dark:!text-white theme-transition">
                      Step {index + 1}: {step.title}
                    </Title>
                    <Paragraph className="!text-sm text-text-secondary dark:!text-slate-400 theme-transition">
                      {step.description}
                    </Paragraph>
                  </div>

                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start text-sm text-text-secondary dark:text-slate-400">
                        <CheckCircleOutlined className="text-brand-500 mr-3 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Title level={2} className="!text-2xl sm:!text-3xl !mb-4 text-text-primary dark:!text-white theme-transition">
              Why Choose AutoCare?
            </Title>
            <Paragraph className="!text-base sm:!text-lg text-text-secondary dark:!text-slate-400 max-w-2xl mx-auto theme-transition">
              Built specifically for Ghana's automotive ecosystem with local needs in mind
            </Paragraph>
          </motion.div>

          <motion.div variants={staggerChildren} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <SafetyOutlined className="text-3xl text-brand-600" />,
                title: "Verified Professionals",
                description: "All mechanics and dealers are verified and rated by the community"
              },
              {
                icon: <ClockCircleOutlined className="text-3xl text-secondary-600" />,
                title: "Real-time Updates",
                description: "Get live updates on your repair progress with photos and messages"
              },
              {
                icon: <DollarOutlined className="text-3xl text-accent-600" />,
                title: "Transparent Pricing",
                description: "No hidden fees. Clear pricing before any work begins"
              },
              {
                icon: <MessageOutlined className="text-3xl text-brand-600" />,
                title: "Direct Communication",
                description: "Chat directly with mechanics and dealers throughout the process"
              },
              {
                icon: <StarFilled className="text-3xl text-secondary-600" />,
                title: "Quality Assurance",
                description: "Service guarantees and quality checks on all completed work"
              },
              {
                icon: <PhoneOutlined className="text-3xl text-accent-600" />,
                title: "24/7 Support",
                description: "Our support team is available to help whenever you need"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card
                  className="h-full text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 theme-transition"
                  bodyStyle={{ padding: '24px' }}
                >
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <Title level={4} className="!text-base !mb-2 text-text-primary dark:!text-white theme-transition">
                    {feature.title}
                  </Title>
                  <Paragraph className="!text-sm text-text-secondary dark:!text-slate-400 theme-transition">
                    {feature.description}
                  </Paragraph>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-700 dark:to-brand-800 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <Title level={2} className="!text-2xl sm:!text-3xl !mb-4 !text-white">
              Ready to Get Started?
            </Title>
            <Paragraph className="!text-base sm:!text-lg !text-white/90 !mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users who trust AutoCare for their automotive needs
            </Paragraph>
            <Space size="large" className="flex-wrap justify-center">
              <Button
                type="primary"
                size="large"
                onClick={() => router.push('/')}
                className="!bg-white !text-brand-600 !border-white hover:!bg-brand-50 hover:!text-brand-700 !h-12 !px-8 !text-base font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Now <ArrowRightOutlined />
              </Button>
              <Button
                size="large"
                onClick={() => router.push('/')}
                className="!text-white !border-white/30 !bg-transparent hover:!bg-white/10 hover:!border-white !h-12 !px-8 !text-base font-medium rounded-lg transition-all duration-300"
              >
                Back to Home <HomeOutlined />
              </Button>
            </Space>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-950/90 backdrop-blur-sm border-t border-gray-200 dark:border-white/10 py-8 sm:py-12 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <CarOutlined className="text-xl sm:text-2xl text-brand-500" />
            <Title level={3} className="text-text-primary dark:!text-white !mb-0 !text-lg sm:!text-xl theme-transition">AutoCare</Title>
          </div>
          
          <Paragraph className="text-text-secondary dark:!text-slate-400 !text-sm sm:!text-base !mb-4 theme-transition">
            Connecting automotive professionals across Ghana
          </Paragraph>
          
          <div className="text-xs sm:text-sm text-text-tertiary dark:text-slate-500 theme-transition">
            © {new Date().getFullYear()} AutoCare Connect • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  )
}

export default KnowMorePage