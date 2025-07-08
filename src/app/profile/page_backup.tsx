'use client'

import React from 'react'
import { Card, Typography } from 'antd'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const { Title } = Typography

export default function ProfilePage() {
  return (
    <DashboardLayout activeKey="profile">
      <Card>
        <Title level={2}>Profile Page - Testing</Title>
        <p>This is a minimal version to test imports</p>
      </Card>
    </DashboardLayout>
  )
}