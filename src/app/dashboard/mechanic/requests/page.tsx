'use client'

import React from 'react'
import { Card, Table, Typography, Empty } from 'antd'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

export default function MechanicRequestsPage() {
  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ]

  return (
    <DashboardLayout activeKey="requests">
      <div className="space-y-6">
        <div>
          <Title level={2}>Service Requests</Title>
          <Text type="secondary">Manage available and claimed service requests</Text>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={[]}
            rowKey="id"
            locale={{
              emptyText: <Empty description="No requests available" />
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  )
} 