'use client'

import React from 'react'
import { Typography, Card, Divider, List, Alert, Space, Button } from 'antd'
import { 
  SafetyOutlined, 
  InfoCircleOutlined, 
  WarningOutlined,
  CalendarOutlined,
  ArrowLeftOutlined 
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import Link from 'next/link'

const { Title, Paragraph, Text } = Typography

export default function TermsPage() {
  const lastUpdated = "January 1, 2024"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white py-12"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button 
                icon={<ArrowLeftOutlined />} 
                type="text" 
                className="!text-white !border-white hover:!bg-white/10"
              >
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <SafetyOutlined className="text-3xl" />
            <Title level={1} className="!text-white !mb-0">
              Terms and Conditions
            </Title>
          </div>
          
          <Paragraph className="!text-blue-100 text-lg !mb-4">
            Please read these terms and conditions carefully before using AutoCare services.
          </Paragraph>
          
          <div className="flex items-center gap-2 text-blue-200">
            <CalendarOutlined />
            <Text className="!text-blue-200">Last updated: {lastUpdated}</Text>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Alert
            message="Important Notice"
            description="By accessing and using AutoCare, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services."
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
            className="mb-6"
          />

          <div className="space-y-6">
            {/* 1. Acceptance of Terms */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">1. Acceptance of Terms</Title>
              <Paragraph className="dark:!text-slate-300">
                By accessing and using AutoCare ("the Platform", "our Service"), you accept and agree to be bound by the terms and provision of this agreement. AutoCare is a digital platform that connects car owners, mechanics, and automotive parts dealers in Ghana.
              </Paragraph>
              <Paragraph className="dark:!text-slate-300">
                These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you", "your") and AutoCare ("Company", "we", "us", "our").
              </Paragraph>
            </Card>

            {/* 2. Service Description */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">2. Service Description</Title>
              <Paragraph className="dark:!text-slate-300">
                AutoCare provides:
              </Paragraph>
              <List
                bordered={false}
                dataSource={[
                  "A platform connecting car owners with certified mechanics",
                  "Automotive parts marketplace connecting dealers and mechanics",
                  "Vehicle diagnostic and repair request management",
                  "Real-time communication tools between service providers and customers",
                  "Payment processing and transaction management",
                  "Rating and review system for service quality assurance"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* 3. User Accounts and Registration */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">3. User Accounts and Registration</Title>
              <Title level={4} className="dark:!text-white">3.1 Account Creation</Title>
              <Paragraph className="dark:!text-slate-300">
                To use AutoCare services, you must create an account by providing accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials.
              </Paragraph>
              
              <Title level={4} className="dark:!text-white">3.2 User Categories</Title>
              <List
                bordered={false}
                dataSource={[
                  "Car Owners: Individuals seeking automotive services and parts",
                  "Mechanics: Certified professionals providing automotive repair services", 
                  "Dealers: Authorized suppliers of automotive parts and accessories"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">3.3 Account Verification</Title>
              <Paragraph className="dark:!text-slate-300">
                Mechanics and dealers must provide valid business licenses, certifications, and undergo our verification process before offering services through the platform.
              </Paragraph>
            </Card>

            {/* 4. User Responsibilities */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">4. User Responsibilities</Title>
              <Title level={4} className="dark:!text-white">4.1 General Obligations</Title>
              <List
                bordered={false}
                dataSource={[
                  "Provide accurate and truthful information",
                  "Maintain the security of your account credentials",
                  "Comply with all applicable laws and regulations",
                  "Treat other users with respect and professionalism",
                  "Use the platform only for legitimate automotive-related purposes"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">4.2 Prohibited Activities</Title>
              <Alert
                message="The following activities are strictly prohibited:"
                type="warning"
                icon={<WarningOutlined />}
                showIcon
                className="mb-4"
              />
              <List
                bordered={false}
                dataSource={[
                  "Fraudulent or deceptive practices",
                  "Harassment, abuse, or threatening behavior",
                  "Sharing false or misleading information",
                  "Violating intellectual property rights",
                  "Attempting to circumvent platform fees",
                  "Using the platform for illegal activities"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* 5. Service Provider Obligations */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">5. Service Provider Obligations</Title>
              <Title level={4} className="dark:!text-white">5.1 Mechanics</Title>
              <List
                bordered={false}
                dataSource={[
                  "Hold valid professional certifications and licenses",
                  "Provide quality services in accordance with industry standards",
                  "Maintain professional liability insurance",
                  "Provide accurate service estimates and timelines",
                  "Complete services as agreed upon with customers"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">5.2 Parts Dealers</Title>
              <List
                bordered={false}
                dataSource={[
                  "Sell only genuine, quality automotive parts",
                  "Provide accurate product descriptions and specifications",
                  "Honor warranty terms for sold products",
                  "Maintain adequate inventory levels",
                  "Process orders and deliveries promptly"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* 6. Payment Terms */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">6. Payment Terms</Title>
              <Title level={4} className="dark:!text-white">6.1 Platform Fees</Title>
              <Paragraph className="dark:!text-slate-300">
                AutoCare charges service fees for facilitating transactions between users. Current fee structures are available in your account dashboard and may be updated with reasonable notice.
              </Paragraph>

              <Title level={4} className="dark:!text-white">6.2 Payment Processing</Title>
              <Paragraph className="dark:!text-slate-300">
                Payments are processed through secure third-party payment processors. AutoCare does not store payment card information. Users are responsible for all charges incurred through their accounts.
              </Paragraph>

              <Title level={4} className="dark:!text-white">6.3 Refunds and Disputes</Title>
              <Paragraph className="dark:!text-slate-300">
                Refund eligibility depends on the specific circumstances of each transaction. AutoCare provides dispute resolution services but is not liable for direct refunds unless required by law.
              </Paragraph>
            </Card>

            {/* 7. Intellectual Property */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">7. Intellectual Property</Title>
              <Paragraph className="dark:!text-slate-300">
                The AutoCare platform, including but not limited to its design, functionality, content, and trademarks, is owned by AutoCare and is protected by copyright, trademark, and other intellectual property laws.
              </Paragraph>
              <Paragraph className="dark:!text-slate-300">
                Users retain ownership of content they create but grant AutoCare a license to use, display, and distribute such content as necessary to provide our services.
              </Paragraph>
            </Card>

            {/* 8. Privacy and Data Protection */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">8. Privacy and Data Protection</Title>
              <Paragraph className="dark:!text-slate-300">
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </Paragraph>
              <Paragraph className="dark:!text-slate-300">
                By using AutoCare, you consent to our data collection and processing practices as described in our Privacy Policy.
              </Paragraph>
            </Card>

            {/* 9. Disclaimers and Limitation of Liability */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">9. Disclaimers and Limitation of Liability</Title>
              <Alert
                message="Important Legal Notice"
                description="Please read this section carefully as it limits our liability and affects your legal rights."
                type="warning"
                icon={<WarningOutlined />}
                showIcon
                className="mb-4"
              />

              <Title level={4} className="dark:!text-white">9.1 Service Disclaimer</Title>
              <Paragraph className="dark:!text-slate-300">
                AutoCare provides a platform for connecting users but does not directly provide automotive services or sell parts. We do not guarantee the quality, safety, or legality of services or products offered by third-party providers.
              </Paragraph>

              <Title level={4} className="dark:!text-white">9.2 Limitation of Liability</Title>
              <Paragraph className="dark:!text-slate-300">
                To the maximum extent permitted by law, AutoCare shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
              </Paragraph>
            </Card>

            {/* 10. Termination */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">10. Termination</Title>
              <Paragraph className="dark:!text-slate-300">
                Either party may terminate this agreement at any time. AutoCare reserves the right to suspend or terminate accounts that violate these Terms or engage in prohibited activities.
              </Paragraph>
              <Paragraph className="dark:!text-slate-300">
                Upon termination, your access to the platform will be revoked, but these Terms will continue to apply to any outstanding obligations.
              </Paragraph>
            </Card>

            {/* 11. Governing Law */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">11. Governing Law and Jurisdiction</Title>
              <Paragraph className="dark:!text-slate-300">
                These Terms are governed by the laws of Ghana. Any disputes arising from these Terms or your use of AutoCare will be subject to the exclusive jurisdiction of the courts of Ghana.
              </Paragraph>
            </Card>

            {/* 12. Changes to Terms */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">12. Changes to Terms</Title>
              <Paragraph className="dark:!text-slate-300">
                AutoCare reserves the right to modify these Terms at any time. Users will be notified of significant changes through the platform or email. Continued use of the service after changes constitutes acceptance of the new Terms.
              </Paragraph>
            </Card>

            {/* 13. Contact Information */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">13. Contact Information</Title>
              <Paragraph className="dark:!text-slate-300">
                If you have questions about these Terms and Conditions, please contact us:
              </Paragraph>
              <List
                bordered={false}
                dataSource={[
                  "Email: legal@autocareconnect.com",
                  "Phone: +233 (0) 555-0123",
                  "Address: AutoCare, Accra, Ghana",
                  "Business Hours: Monday - Friday, 8:00 AM - 6:00 PM GMT"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* Footer */}
            <Card className="text-center bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
              <Title level={4} className="dark:!text-white">Agreement Acknowledgment</Title>
              <Paragraph className="dark:!text-slate-300">
                By using AutoCare, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </Paragraph>
              <Space>
                <Link href="/">
                  <Button type="primary">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button>
                    Privacy Policy
                  </Button>
                </Link>
              </Space>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}