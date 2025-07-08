'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Table, 
  Tag, 
  Progress, 
  Space,
  DatePicker,
  Select,
  Button,
  Empty,
  Alert,
  Spin,
  Tabs,
  List,
  Avatar,
  Badge,
  Tooltip
} from 'antd'
import { 
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  BarChartOutlined,
  PieChartOutlined,
  CalendarOutlined,
  ReloadOutlined,
  ExportOutlined,
  InboxOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FallOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Part, Transaction, TransactionStatus } from '@/types'
import dayjs, { Dayjs } from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs

interface DealerAnalytics {
  totalRevenue: number
  totalOrders: number
  totalParts: number
  activeParts: number
  averageOrderValue: number
  topSellingParts: Array<{
    part: Part
    totalSold: number
    revenue: number
  }>
  recentTransactions: Transaction[]
  monthlyRevenue: Array<{
    month: string
    revenue: number
    orders: number
  }>
  categoryPerformance: Array<{
    category: string
    sales: number
    revenue: number
    percentage: number
  }>
  lowStockAlerts: Part[]
  customerInsights: Array<{
    mechanicId: string
    mechanicName: string
    totalOrders: number
    totalSpent: number
    lastOrder: string
  }>
}

export default function DealerAnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<DealerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30days')

  useEffect(() => {
    if (user?.id) {
      loadAnalytics()
    }
  }, [user, dateRange])

  const loadAnalytics = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Load all necessary data
      const [parts, transactions] = await Promise.all([
        DatabaseService.getPartsByDealer(user.id),
        DatabaseService.getTransactionsByDealer?.(user.id) || []
      ])

      // Filter transactions by date range
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = dayjs(t.created_at)
        return transactionDate.isAfter(dateRange[0]) && transactionDate.isBefore(dateRange[1].add(1, 'day'))
      })

      // Calculate analytics
      const completedTransactions = filteredTransactions.filter(t => t.status === 'completed')
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total_amount, 0)
      const totalOrders = completedTransactions.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Top selling parts
      const partSales = new Map<string, { part: Part, totalSold: number, revenue: number }>()
      completedTransactions.forEach(transaction => {
        const part = parts.find(p => p.id === transaction.part_id)
        if (part) {
          const existing = partSales.get(part.id) || { part, totalSold: 0, revenue: 0 }
          existing.totalSold += transaction.quantity
          existing.revenue += transaction.total_amount
          partSales.set(part.id, existing)
        }
      })

      const topSellingParts = Array.from(partSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      // Monthly revenue (last 12 months)
      const monthlyData = new Map<string, { revenue: number, orders: number }>()
      for (let i = 11; i >= 0; i--) {
        const month = dayjs().subtract(i, 'month').format('MMM YYYY')
        monthlyData.set(month, { revenue: 0, orders: 0 })
      }

      completedTransactions.forEach(transaction => {
        const month = dayjs(transaction.created_at).format('MMM YYYY')
        if (monthlyData.has(month)) {
          const data = monthlyData.get(month)!
          data.revenue += transaction.total_amount
          data.orders += 1
        }
      })

      const monthlyRevenue = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        ...data
      }))

      // Category performance
      const categoryData = new Map<string, { sales: number, revenue: number }>()
      completedTransactions.forEach(transaction => {
        const part = parts.find(p => p.id === transaction.part_id)
        if (part?.category) {
          const existing = categoryData.get(part.category) || { sales: 0, revenue: 0 }
          existing.sales += transaction.quantity
          existing.revenue += transaction.total_amount
          categoryData.set(part.category, existing)
        }
      })

      const totalCategoryRevenue = Array.from(categoryData.values()).reduce((sum, data) => sum + data.revenue, 0)
      const categoryPerformance = Array.from(categoryData.entries()).map(([category, data]) => ({
        category,
        ...data,
        percentage: totalCategoryRevenue > 0 ? (data.revenue / totalCategoryRevenue) * 100 : 0
      })).sort((a, b) => b.revenue - a.revenue)

      // Low stock alerts
      const lowStockAlerts = parts.filter(part => 
        part.stock <= (part.min_stock_threshold || 5) && part.is_active
      )

      // Customer insights
      const customerData = new Map<string, { orders: number, spent: number, lastOrder: string, name: string }>()
      completedTransactions.forEach(transaction => {
        if (transaction.mechanic_id) {
          const existing = customerData.get(transaction.mechanic_id) || { 
            orders: 0, 
            spent: 0, 
            lastOrder: transaction.created_at,
            name: transaction.mechanic?.name || 'Unknown'
          }
          existing.orders += 1
          existing.spent += transaction.total_amount
          if (dayjs(transaction.created_at).isAfter(dayjs(existing.lastOrder))) {
            existing.lastOrder = transaction.created_at
          }
          customerData.set(transaction.mechanic_id, existing)
        }
      })

      const customerInsights = Array.from(customerData.entries()).map(([mechanicId, data]) => ({
        mechanicId,
        mechanicName: data.name,
        totalOrders: data.orders,
        totalSpent: data.spent,
        lastOrder: data.lastOrder
      })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10)

      // Recent transactions
      const recentTransactions = filteredTransactions
        .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
        .slice(0, 10)

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalParts: parts.length,
        activeParts: parts.filter(p => p.is_active).length,
        averageOrderValue,
        topSellingParts,
        recentTransactions,
        monthlyRevenue,
        categoryPerformance,
        lowStockAlerts,
        customerInsights
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    const now = dayjs()
    switch (period) {
      case '7days':
        setDateRange([now.subtract(7, 'days'), now])
        break
      case '30days':
        setDateRange([now.subtract(30, 'days'), now])
        break
      case '90days':
        setDateRange([now.subtract(90, 'days'), now])
        break
      case '1year':
        setDateRange([now.subtract(1, 'year'), now])
        break
      default:
        setDateRange([now.subtract(30, 'days'), now])
    }
  }

  const getTransactionStatusColor = (status: TransactionStatus) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      rejected: 'red',
      completed: 'green',
      cancelled: 'gray'
    }
    return colors[status] || 'default'
  }

  const formatCurrency = (amount: number) => `GHS ${amount.toFixed(2)}`

  // Calculate growth rates
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <DashboardLayout activeKey="analytics">
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout activeKey="analytics">
        <Alert
          message="Unable to load analytics data"
          description="Please try refreshing the page or contact support if the issue persists."
          type="error"
          showIcon
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Title level={2} className="!mb-2 flex items-center">
              <BarChartOutlined className="mr-3 text-blue-600" />
              Business Analytics
            </Title>
            <Text type="secondary" className="text-lg">
              Track your sales performance and business insights
            </Text>
          </div>
          <Space>
            <Select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              style={{ width: 120 }}
            >
              <Option value="7days">Last 7 days</Option>
              <Option value="30days">Last 30 days</Option>
              <Option value="90days">Last 90 days</Option>
              <Option value="1year">Last year</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
              format="DD/MM/YYYY"
            />
            <Button icon={<ReloadOutlined />} onClick={loadAnalytics}>
              Refresh
            </Button>
          </Space>
        </div>

        {/* Key Metrics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={analytics.totalRevenue}
                precision={2}
                prefix="GHS "
                valueStyle={{ color: '#3f8600' }}
                suffix={
                  <Tooltip title="Compared to previous period">
                    <RiseOutlined style={{ fontSize: '14px', color: '#3f8600' }} />
                  </Tooltip>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={analytics.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Average Order Value"
                value={analytics.averageOrderValue}
                precision={2}
                prefix="GHS "
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Parts"
                value={analytics.activeParts}
                suffix={`/ ${analytics.totalParts}`}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts */}
        {analytics.lowStockAlerts.length > 0 && (
          <Alert
            message={`${analytics.lowStockAlerts.length} parts are running low on stock`}
            description="Consider restocking these items to avoid stockouts"
            type="warning"
            showIcon
            action={
              <Button size="small" href="/dashboard/dealer/parts">
                Manage Inventory
              </Button>
            }
          />
        )}

        <Tabs defaultActiveKey="overview" size="large">
          {/* Overview Tab */}
          <TabPane 
            tab={
              <span>
                <PieChartOutlined />
                Overview
              </span>
            } 
            key="overview"
          >
            <Row gutter={[16, 16]}>
              {/* Top Selling Parts */}
              <Col xs={24} lg={12}>
                <Card title="Top Selling Parts" extra={<ExportOutlined />}>
                  <Table
                    columns={[
                      {
                        title: 'Part',
                        key: 'part',
                        render: (record) => (
                          <div>
                            <div className="font-medium">{record.part.name}</div>
                            <div className="text-sm text-gray-500">{record.part.brand}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Sold',
                        dataIndex: 'totalSold',
                        key: 'totalSold',
                        render: (value: number) => <Badge count={value} style={{ backgroundColor: '#52c41a' }} />
                      },
                      {
                        title: 'Revenue',
                        dataIndex: 'revenue',
                        key: 'revenue',
                        render: (value: number) => (
                          <span className="font-semibold text-green-600">
                            {formatCurrency(value)}
                          </span>
                        )
                      }
                    ]}
                    dataSource={analytics.topSellingParts}
                    pagination={false}
                    size="small"
                    rowKey={(record) => record.part.id}
                  />
                </Card>
              </Col>

              {/* Category Performance */}
              <Col xs={24} lg={12}>
                <Card title="Category Performance">
                  <div className="space-y-4">
                    {analytics.categoryPerformance.slice(0, 6).map((category, index) => (
                      <div key={category.category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm">{formatCurrency(category.revenue)}</span>
                        </div>
                        <Progress 
                          percent={category.percentage} 
                          showInfo={false}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              {/* Recent Transactions */}
              <Col xs={24} lg={16}>
                <Card title="Recent Transactions">
                  <Table
                    columns={[
                      {
                        title: 'Part',
                        key: 'part',
                        render: (record: Transaction) => (
                          <div>
                            <div className="font-medium">{record.part?.name || 'Unknown Part'}</div>
                            <div className="text-sm text-gray-500">Qty: {record.quantity}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Mechanic',
                        key: 'mechanic',
                        render: (record: Transaction) => (
                          <div className="flex items-center">
                            <Avatar icon={<UserOutlined />} size="small" className="mr-2" />
                            <span>{record.mechanic?.name || 'Unknown'}</span>
                          </div>
                        )
                      },
                      {
                        title: 'Amount',
                        dataIndex: 'total_amount',
                        key: 'total_amount',
                        render: (amount: number) => (
                          <span className="font-semibold">{formatCurrency(amount)}</span>
                        )
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: TransactionStatus) => (
                          <Tag color={getTransactionStatusColor(status)}>
                            {status.toUpperCase()}
                          </Tag>
                        )
                      },
                      {
                        title: 'Date',
                        dataIndex: 'created_at',
                        key: 'created_at',
                        render: (date: string) => dayjs(date).format('DD/MM/YYYY')
                      }
                    ]}
                    dataSource={analytics.recentTransactions}
                    pagination={false}
                    size="small"
                    rowKey="id"
                  />
                </Card>
              </Col>

              {/* Top Customers */}
              <Col xs={24} lg={8}>
                <Card title="Top Customers">
                  <List
                    itemLayout="horizontal"
                    dataSource={analytics.customerInsights.slice(0, 5)}
                    renderItem={(customer, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }}>
                              <Avatar icon={<UserOutlined />} />
                            </Badge>
                          }
                          title={customer.mechanicName}
                          description={
                            <div>
                              <div>{customer.totalOrders} orders • {formatCurrency(customer.totalSpent)}</div>
                              <div className="text-xs text-gray-500">
                                Last order: {dayjs(customer.lastOrder).format('DD/MM/YYYY')}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Inventory Tab */}
          <TabPane 
            tab={
              <span>
                <InboxOutlined />
                Inventory
              </span>
            } 
            key="inventory"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Low Stock Alerts" extra={<Button href="/dashboard/dealer/parts">Manage Inventory</Button>}>
                  {analytics.lowStockAlerts.length > 0 ? (
                    <Table
                      columns={[
                        {
                          title: 'Part',
                          key: 'part',
                          render: (record: Part) => (
                            <div>
                              <div className="font-medium">{record.name}</div>
                              <div className="text-sm text-gray-500">{record.brand} • {record.category}</div>
                            </div>
                          )
                        },
                        {
                          title: 'Current Stock',
                          dataIndex: 'stock',
                          key: 'stock',
                          render: (stock: number) => (
                            <Badge 
                              count={stock} 
                              style={{ backgroundColor: stock === 0 ? '#f5222d' : '#faad14' }}
                            />
                          )
                        },
                        {
                          title: 'Min Threshold',
                          dataIndex: 'min_stock_threshold',
                          key: 'min_stock_threshold',
                          render: (threshold: number) => threshold || 5
                        },
                        {
                          title: 'Status',
                          key: 'status',
                          render: (record: Part) => (
                            <Tag color={record.stock === 0 ? 'red' : 'orange'}>
                              {record.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                            </Tag>
                          )
                        },
                        {
                          title: 'Action',
                          key: 'action',
                          render: (record: Part) => (
                            <Button type="primary" size="small">
                              Restock
                            </Button>
                          )
                        }
                      ]}
                      dataSource={analytics.lowStockAlerts}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty description="All parts are well stocked" />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}