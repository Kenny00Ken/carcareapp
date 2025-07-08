'use client'

import React, { useState } from 'react'
import { 
  Card, 
  Typography, 
  Result,
  Button
} from 'antd'
import { 
  SettingOutlined
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const { Title, Text, Paragraph } = Typography

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout activeKey="settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Title level={2}>Settings</Title>
          <Paragraph>
            Manage your preferences, location settings, and notifications.
          </Paragraph>
        </div>

        <Card>
          <Result
            icon={<SettingOutlined style={{ color: '#1890ff' }} />}
            title="Settings Page"
            subTitle="Settings functionality is temporarily disabled due to system optimization."
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            }
          />
        </Card>
      </div>
    </DashboardLayout>
  )
}