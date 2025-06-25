'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Button, Table, message, Avatar, Tag, Space, Modal, Form, Input, Select, InputNumber } from 'antd'
import { 
  ShopOutlined, 
  DollarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TruckOutlined,
  PlusOutlined,
  BarChartOutlined,
  WarningOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Transaction, InventoryStats, Part } from '@/types'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'

const { Title, Paragraph } = Typography

export default function DealerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<InventoryStats>({
    total_parts: 0,
    low_stock_items: 0,
    pending_orders: 0,
    monthly_sales: 0,
    monthly_revenue: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [lowStockParts, setLowStockParts] = useState<Part[]>([])
  const [topSellingParts, setTopSellingParts] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  useEffect(() => {
    // Subscribe to real-time updates for pending transactions
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToPendingTransactions(
        user.id,
        (transactions) => {
          loadDashboardData() // Refresh all data when transactions change
        }
      )
      return unsubscribe
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      // Load statistics
      const inventoryStats = await DatabaseService.getInventoryStats(user.id)
      setStats(inventoryStats)

      // Load recent transactions
      const transactions = await DatabaseService.getTransactionsByDealer(user.id)
      
      // Enrich transactions with part, mechanic, and request data
      const enrichedTransactions = await Promise.all(
        transactions.slice(0, 5).map(async (transaction) => {
          const [part, mechanic, request] = await Promise.all([
            DatabaseService.getPart(transaction.part_id),
            DatabaseService.getUser(transaction.mechanic_id),
            transaction.request_id ? DatabaseService.getRequest(transaction.request_id) : null
          ])
          return { 
            ...transaction, 
            part: part || undefined, 
            mechanic: mechanic || undefined, 
            request: request || undefined 
          }
        })
      )
      setRecentTransactions(enrichedTransactions)

      // Load low stock parts
      const lowStock = await DatabaseService.getLowStockParts(user.id)
      setLowStockParts(lowStock)

      // Calculate top selling parts from completed transactions
      const completedTransactions = transactions.filter(t => t.status === 'completed')
      const partSales = completedTransactions.reduce((acc: any, transaction) => {
        const partId = transaction.part_id
        if (!acc[partId]) {
          acc[partId] = {
            name: transaction.part?.name || 'Unknown Part',
            sold: 0,
            revenue: 0
          }
        }
        acc[partId].sold += transaction.quantity
        acc[partId].revenue += transaction.total_amount
        return acc
      }, {})

      const topParts = Object.values(partSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 4)
      
      setTopSellingParts(topParts)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      await DatabaseService.approveTransaction(transactionId, user!.id)
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('Error approving transaction:', error)
    }
  }

  const handleRejectTransaction = async (transactionId: string) => {
    try {
      await DatabaseService.updateTransaction(transactionId, { 
        status: 'rejected',
        notes: 'Rejected from dashboard'
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('Error rejecting transaction:', error)
    }
  }

  const transactionColumns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.slice(-8)
    },
    {
      title: 'Part',
      key: 'part',
      render: (record: Transaction) => (
        <div>
          <div className="font-medium">{record.part?.name}</div>
          <div className="text-sm text-gray-500">Qty: {record.quantity}</div>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: 'Mechanic',
      key: 'mechanic',
      render: (record: Transaction) => record.mechanic?.name || 'Unknown'
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
          completed: 'blue'
        }
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD')
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: Transaction) => (
        record.status === 'pending' ? (
          <Space size="small">
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleApproveTransaction(record.id)}
            >
              Approve
            </Button>
            <Button 
              danger 
              size="small"
              onClick={() => handleRejectTransaction(record.id)}
            >
              Reject
            </Button>
          </Space>
        ) : null
      )
    }
  ]

  return (
    <DashboardLayout activeKey="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <Title level={2}>Welcome back, {user?.name}!</Title>
          <Paragraph className="text-gray-600 dark:text-gray-300">
            Manage your parts inventory and track sales performance.
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Parts"
                value={stats.total_parts}
                prefix={<ShopOutlined className="text-blue-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={stats.pending_orders}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Monthly Sales"
                value={stats.monthly_sales}
                prefix={<CheckCircleOutlined className="text-green-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Monthly Revenue"
                value={stats.monthly_revenue}
                prefix={<DollarOutlined className="text-purple-600" />}
                precision={2}
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts & Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Inventory Alerts" bordered={false}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="flex items-center space-x-2">
                    <WarningOutlined className="text-red-600" />
                    <span>Low Stock Items</span>
                  </div>
                  <Tag color="red">{stats.low_stock_items} items</Tag>
                </div>
                {lowStockParts.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {lowStockParts.slice(0, 3).map((part, index) => (
                      <div key={part.id}>
                        • {part.name} ({part.stock} left)
                      </div>
                    ))}
                    {lowStockParts.length > 3 && (
                      <div>• And {lowStockParts.length - 3} more items...</div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Quick Actions" bordered={false}>
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  block
                  onClick={() => router.push('/dashboard/dealer/parts')}
                >
                  Manage Inventory
                </Button>
                <Button 
                  icon={<FileTextOutlined />}
                  block
                  onClick={() => router.push('/dashboard/dealer/transactions')}
                >
                  Review Transactions
                </Button>
                <Button 
                  icon={<BarChartOutlined />}
                  block
                  onClick={() => router.push('/dashboard/dealer/analytics')}
                >
                  View Sales Analytics
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions */}
        <Card 
          title="Recent Transactions"
          extra={
            <Button 
              type="link" 
              onClick={() => router.push('/dashboard/dealer/transactions')}
            >
              View All
            </Button>
          }
        >
          <Table
            columns={transactionColumns}
            dataSource={recentTransactions}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 800 }}
            locale={{ emptyText: 'No recent transactions' }}
          />
        </Card>

        {/* Sales Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Top Selling Parts" bordered={false}>
              <div className="space-y-3">
                {topSellingParts.length > 0 ? (
                  topSellingParts.map((part, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <div className="font-medium">{part.name}</div>
                        <div className="text-sm text-gray-500">{part.sold} units sold</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">${part.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No sales data available
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Monthly Overview" bordered={false}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Transactions</span>
                  <span className="font-semibold">{recentTransactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pending Approvals</span>
                  <span className="font-semibold text-orange-600">{stats.pending_orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Monthly Revenue</span>
                  <span className="font-semibold text-green-600">${stats.monthly_revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Low Stock Alerts</span>
                  <span className="font-semibold text-red-600">{stats.low_stock_items}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  )
} 