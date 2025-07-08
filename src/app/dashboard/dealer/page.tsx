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
      title: 'Transaction Details',
      key: 'details',
      render: (record: Transaction) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">{record.part?.name}</div>
          <div className="text-xs text-gray-500">
            Qty: {record.quantity} • ${record.total_amount.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            By: {record.mechanic?.name || 'Unknown'}
          </div>
          <div className="flex flex-wrap gap-1 sm:hidden">
            <Tag color={{
              pending: 'orange',
              approved: 'green', 
              rejected: 'red',
              completed: 'blue'
            }[record.status as keyof typeof {pending: 'orange', approved: 'green', rejected: 'red', completed: 'blue'}]} className="text-xs">
              {record.status.toUpperCase()}
            </Tag>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {dayjs(record.created_at).format('MMM DD')}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      responsive: ['sm'],
      render: (status: string) => {
        const colors = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
          completed: 'blue'
        }
        return <Tag color={colors[status as keyof typeof colors]} className="text-xs">{status.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 80,
      responsive: ['md'],
      render: (date: string) => <span className="text-sm">{dayjs(date).format('MMM DD')}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (record: Transaction) => (
        record.status === 'pending' ? (
          <div className="flex flex-col gap-1">
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleApproveTransaction(record.id)}
              className="!w-full sm:!w-auto"
            >
              Approve
            </Button>
            <Button 
              danger 
              size="small"
              onClick={() => handleRejectTransaction(record.id)}
              className="!w-full sm:!w-auto"
            >
              Reject
            </Button>
          </div>
        ) : null
      )
    }
  ]

  return (
    <DashboardLayout activeKey="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <Title level={2} className="!text-xl sm:!text-2xl">Welcome back, {user?.name}!</Title>
          <Paragraph className="text-gray-600 dark:text-gray-300 !text-sm sm:!text-base">
            Manage your parts inventory and track sales performance.
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Total Parts</span>}
                value={stats.total_parts}
                prefix={<ShopOutlined className="text-blue-600" />}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Pending Orders</span>}
                value={stats.pending_orders}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Monthly Sales</span>}
                value={stats.monthly_sales}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Monthly Revenue</span>}
                value={stats.monthly_revenue}
                prefix={<DollarOutlined className="text-purple-600" />}
                precision={2}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts & Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span className="text-sm sm:text-base">Inventory Alerts</span>} bordered={false}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="flex items-center space-x-2">
                    <WarningOutlined className="text-red-600" />
                    <span className="text-sm sm:text-base">Low Stock Items</span>
                  </div>
                  <Tag color="red" className="text-xs">{stats.low_stock_items} items</Tag>
                </div>
                {lowStockParts.length > 0 && (
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
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
            <Card title={<span className="text-sm sm:text-base">Quick Actions</span>} bordered={false}>
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/dashboard/dealer/parts')}
                  className="!h-12"
                >
                  <span className="hidden sm:inline">Manage Inventory</span>
                  <span className="sm:hidden">Inventory</span>
                </Button>
                <Button 
                  icon={<FileTextOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/dashboard/dealer/transactions')}
                  className="!h-12"
                >
                  <span className="hidden sm:inline">Review Transactions</span>
                  <span className="sm:hidden">Transactions</span>
                </Button>
                <Button 
                  icon={<BarChartOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/dashboard/dealer/analytics')}
                  className="!h-12"
                >
                  <span className="hidden sm:inline">View Sales Analytics</span>
                  <span className="sm:hidden">Analytics</span>
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Recent Transactions */}
        <Card 
          title={<span className="text-sm sm:text-base">Recent Transactions</span>}
          extra={
            <Button 
              type="link" 
              onClick={() => router.push('/dashboard/dealer/transactions')}
              className="!text-sm"
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
            scroll={{ x: 400 }}
            size="small"
            className="overflow-x-auto"
            locale={{ emptyText: 'No recent transactions' }}
          />
        </Card>

        {/* Sales Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span className="text-sm sm:text-base">Top Selling Parts</span>} bordered={false}>
              <div className="space-y-3">
                {topSellingParts.length > 0 ? (
                  topSellingParts.map((part, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <div className="font-medium text-sm sm:text-base">{part.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{part.sold} units sold</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600 text-sm sm:text-base">${part.revenue.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                    No sales data available
                  </div>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span className="text-sm sm:text-base">Monthly Overview</span>} bordered={false}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Total Transactions</span>
                  <span className="font-semibold text-sm sm:text-base">{recentTransactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Pending Approvals</span>
                  <span className="font-semibold text-orange-600 text-sm sm:text-base">{stats.pending_orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Monthly Revenue</span>
                  <span className="font-semibold text-green-600 text-sm sm:text-base">${stats.monthly_revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Low Stock Alerts</span>
                  <span className="font-semibold text-red-600 text-sm sm:text-base">{stats.low_stock_items}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  )
} 