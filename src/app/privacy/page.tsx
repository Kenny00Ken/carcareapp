'use client'

import React from 'react'
import { Typography, Card, Divider, List, Alert, Space, Button, Table } from 'antd'
import { 
  SecurityScanOutlined, 
  InfoCircleOutlined, 
  WarningOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  EyeOutlined,
  ShareAltOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import Link from 'next/link'

const { Title, Paragraph, Text } = Typography

export default function PrivacyPage() {
  const lastUpdated = "January 1, 2024"

  const dataTypesColumns = [
    {
      title: 'Data Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Retention Period',
      dataIndex: 'retention',
      key: 'retention',
    }
  ]

  const dataTypesData = [
    {
      key: '1',
      type: 'Personal Information',
      purpose: 'Account creation, communication, service delivery',
      retention: '5 years after account closure'
    },
    {
      key: '2',
      type: 'Location Data',
      purpose: 'Service matching, delivery coordination',
      retention: '2 years or until consent withdrawn'
    },
    {
      key: '3',
      type: 'Payment Information',
      purpose: 'Transaction processing, fraud prevention',
      retention: '7 years (legal requirement)'
    },
    {
      key: '4',
      type: 'Usage Analytics',
      purpose: 'Service improvement, user experience optimization',
      retention: '3 years'
    },
    {
      key: '5',
      type: 'Communication Records',
      purpose: 'Customer support, dispute resolution',
      retention: '3 years'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-800 dark:to-blue-800 text-white py-12"
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
            <SecurityScanOutlined className="text-3xl" />
            <Title level={1} className="!text-white !mb-0">
              Privacy Policy
            </Title>
          </div>
          
          <Paragraph className="!text-green-100 text-lg !mb-4">
            Your privacy is our priority. Learn how we collect, use, and protect your personal information.
          </Paragraph>
          
          <div className="flex items-center gap-2 text-green-200">
            <CalendarOutlined />
            <Text className="!text-green-200">Last updated: {lastUpdated}</Text>
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
            message="Privacy Commitment"
            description="AutoCare is committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and safeguard your data."
            type="success"
            icon={<SecurityScanOutlined />}
            showIcon
            className="mb-6"
          />

          <div className="space-y-6">
            {/* 1. Introduction */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">1. Introduction</Title>
              <Paragraph className="dark:!text-slate-300">
                This Privacy Policy describes how AutoCare ("we", "us", "our") collects, uses, and shares personal information when you use our automotive services platform ("AutoCare", "the Service").
              </Paragraph>
              <Paragraph className="dark:!text-slate-300">
                We are committed to protecting your privacy and maintaining the highest standards of data security in compliance with applicable privacy laws, including Ghana's Data Protection Act, 2012 (Act 843) and international best practices.
              </Paragraph>
            </Card>

            {/* 2. Information We Collect */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">2. Information We Collect</Title>
              
              <Title level={4} className="flex items-center gap-2">
                <EyeOutlined />
                2.1 Information You Provide Directly
              </Title>
              <List
                bordered={false}
                dataSource={[
                  "Personal details (name, email, phone number, address)",
                  "Professional information (for mechanics and dealers)",
                  "Vehicle information (make, model, year, VIN)",
                  "Payment and billing information",
                  "Service requests and communication records",
                  "Reviews, ratings, and feedback",
                  "Profile photos and business documentation"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="flex items-center gap-2 mt-4">
                <LockOutlined />
                2.2 Information Collected Automatically
              </Title>
              <List
                bordered={false}
                dataSource={[
                  "Device information (IP address, browser type, operating system)",
                  "Usage data (pages visited, features used, time spent)",
                  "Location data (when you enable location services)",
                  "Cookies and similar tracking technologies",
                  "Log files and analytics data"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="flex items-center gap-2 mt-4">
                <ShareAltOutlined />
                2.3 Information from Third Parties
              </Title>
              <List
                bordered={false}
                dataSource={[
                  "Social media login information (Google, Facebook)",
                  "Payment processor transaction data",
                  "Background check results (for service providers)",
                  "Business verification data",
                  "Marketing partner referral information"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* 3. How We Use Your Information */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">3. How We Use Your Information</Title>
              
              <Title level={4} className="dark:!text-white">3.1 Primary Uses</Title>
              <List
                bordered={false}
                dataSource={[
                  "Providing and maintaining AutoCare services",
                  "Matching car owners with appropriate mechanics and dealers",
                  "Processing payments and managing transactions",
                  "Facilitating communication between users",
                  "Providing customer support and resolving disputes",
                  "Sending service-related notifications and updates"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">3.2 Secondary Uses</Title>
              <List
                bordered={false}
                dataSource={[
                  "Improving our services and user experience",
                  "Analyzing usage patterns and trends",
                  "Preventing fraud and ensuring platform security",
                  "Complying with legal obligations",
                  "Marketing our services (with your consent)",
                  "Research and development of new features"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* 4. Data Retention */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">4. Data Retention</Title>
              <Paragraph className="dark:!text-slate-300">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
              </Paragraph>
              
              <Table 
                columns={dataTypesColumns} 
                dataSource={dataTypesData} 
                pagination={false}
                size="small"
                className="mt-4"
              />
            </Card>

            {/* 5. Information Sharing */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">5. How We Share Your Information</Title>
              
              <Alert
                message="Limited Sharing Policy"
                description="We do not sell your personal information to third parties. We only share information as described below."
                type="info"
                icon={<SafetyOutlined />}
                showIcon
                className="mb-4"
              />

              <Title level={4} className="dark:!text-white">5.1 With Other Users</Title>
              <Paragraph className="dark:!text-slate-300">
                To facilitate services, we share relevant information between car owners, mechanics, and dealers as necessary for service delivery.
              </Paragraph>

              <Title level={4} className="dark:!text-white">5.2 With Service Providers</Title>
              <List
                bordered={false}
                dataSource={[
                  "Payment processors (for transaction handling)",
                  "Cloud storage providers (for data hosting)",
                  "Communication services (for notifications)",
                  "Analytics providers (for service improvement)",
                  "Customer support tools (for user assistance)"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">5.3 Legal Requirements</Title>
              <Paragraph className="dark:!text-slate-300">
                We may disclose information when required by law, legal process, or to protect the rights, property, or safety of AutoCare, our users, or others.
              </Paragraph>
            </Card>

            {/* 6. Data Security */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">6. Data Security</Title>
              
              <Title level={4} className="dark:!text-white">6.1 Security Measures</Title>
              <List
                bordered={false}
                dataSource={[
                  "256-bit SSL encryption for data transmission",
                  "Secure cloud infrastructure with regular backups",
                  "Multi-factor authentication for sensitive accounts",
                  "Regular security audits and vulnerability assessments",
                  "Employee training on data protection practices",
                  "Incident response and breach notification procedures"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">6.2 Payment Security</Title>
              <Paragraph className="dark:!text-slate-300">
                Payment information is processed by PCI DSS compliant payment processors. We do not store complete payment card information on our servers.
              </Paragraph>
            </Card>

            {/* 7. Your Privacy Rights */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">7. Your Privacy Rights</Title>
              
              <Title level={4} className="dark:!text-white">7.1 Access and Control</Title>
              <List
                bordered={false}
                dataSource={[
                  "Access: Request a copy of your personal information",
                  "Correction: Update or correct inaccurate information",
                  "Deletion: Request deletion of your personal information",
                  "Portability: Receive your data in a machine-readable format",
                  "Restriction: Limit how we process your information",
                  "Objection: Object to certain types of processing"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">7.2 Communication Preferences</Title>
              <Paragraph className="dark:!text-slate-300">
                You can control marketing communications through your account settings or by contacting us directly. Note that you cannot opt out of essential service-related communications.
              </Paragraph>

              <Title level={4} className="dark:!text-white">7.3 Location Services</Title>
              <Paragraph className="dark:!text-slate-300">
                You can enable or disable location services through your device settings or account preferences. Disabling location services may limit some platform features.
              </Paragraph>
            </Card>

            {/* 8. Cookies and Tracking */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">8. Cookies and Tracking Technologies</Title>
              
              <Title level={4} className="dark:!text-white">8.1 Types of Cookies</Title>
              <List
                bordered={false}
                dataSource={[
                  "Essential cookies: Required for basic platform functionality",
                  "Performance cookies: Help us analyze and improve our services",
                  "Functional cookies: Remember your preferences and settings",
                  "Marketing cookies: Used for advertising and remarketing (with consent)"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">8.2 Cookie Management</Title>
              <Paragraph className="dark:!text-slate-300">
                You can control cookies through your browser settings. Note that disabling certain cookies may affect platform functionality.
              </Paragraph>
            </Card>

            {/* 9. International Data Transfers */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">9. International Data Transfers</Title>
              <Paragraph className="dark:!text-slate-300">
                Your information may be transferred to and processed in countries other than Ghana. We ensure appropriate safeguards are in place to protect your information during such transfers, including:
              </Paragraph>
              <List
                bordered={false}
                dataSource={[
                  "Standard contractual clauses approved by data protection authorities",
                  "Adequacy decisions by relevant authorities",
                  "Certification schemes and codes of conduct",
                  "Explicit consent where required"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* 10. Children's Privacy */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">10. Children's Privacy</Title>
              <Alert
                message="Age Restriction"
                description="AutoCare is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children."
                type="warning"
                icon={<WarningOutlined />}
                showIcon
                className="mb-4"
              />
              <Paragraph className="dark:!text-slate-300">
                If we become aware that we have collected personal information from a child under 18, we will delete such information promptly. If you believe we have collected information from a child, please contact us immediately.
              </Paragraph>
            </Card>

            {/* 11. Changes to Privacy Policy */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">11. Changes to This Privacy Policy</Title>
              <Paragraph className="dark:!text-slate-300">
                We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of significant changes through:
              </Paragraph>
              <List
                bordered={false}
                dataSource={[
                  "Email notification to registered users",
                  "In-app notifications when you next use the service",
                  "Prominent notice on our website and platform",
                  "Updated date at the top of this Privacy Policy"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            {/* 12. Contact Information */}
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <Title level={2} className="dark:!text-white">12. Contact Us</Title>
              <Paragraph className="dark:!text-slate-300">
                If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
              </Paragraph>
              
              <Title level={4} className="dark:!text-white">Data Protection Officer</Title>
              <List
                bordered={false}
                dataSource={[
                  "Email: privacy@autocareconnect.com",
                  "Phone: +233 (0) 555-0124",
                  "Address: Data Protection Office, AutoCare, Accra, Ghana",
                  "Response Time: We aim to respond within 72 hours"
                ]}
                renderItem={item => (
                  <List.Item>
                    <Text className="dark:!text-slate-300">• {item}</Text>
                  </List.Item>
                )}
              />

              <Title level={4} className="dark:!text-white">Regulatory Authority</Title>
              <Paragraph className="dark:!text-slate-300">
                You also have the right to lodge a complaint with the Data Protection Commission of Ghana if you believe your privacy rights have been violated.
              </Paragraph>
            </Card>

            {/* Footer */}
            <Card className="text-center bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
              <Title level={4} className="dark:!text-white">Privacy Commitment</Title>
              <Paragraph className="dark:!text-slate-300">
                AutoCare is committed to protecting your privacy and maintaining the highest standards of data security. This Privacy Policy is part of our commitment to transparency and user trust.
              </Paragraph>
              <Space>
                <Link href="/">
                  <Button type="primary">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/terms">
                  <Button>
                    Terms & Conditions
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