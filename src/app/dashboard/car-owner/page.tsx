'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Statistic, Typography, Button, Table, Tag, Space, Spin, Empty, message } from 'antd'
import { 
  CarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Request, Car, MaintenanceRecord } from '@/types'
import { useRouter } from 'next/navigation'

const { Title, Paragraph } = Typography

interface DashboardStats {
  totalCars: number
  activeRequests: number
  completedRequests: number
  totalSpent: number
}

export default function CarOwnerDashboard() {
  const { user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalSpent: 0
  })
  const [recentRequests, setRecentRequests] = useState<Request[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([])

  // Calculate stats from current data
  const calculateStats = useCallback((currentCars: Car[], currentRequests: Request[], currentMaintenance: MaintenanceRecord[]) => {
    const activeRequests = currentRequests.filter(r => 
      ['pending', 'claimed', 'diagnosed', 'in_progress', 'parts_requested', 'quoted', 'approved', 'parts_received'].includes(r.status)
    ).length

    const completedRequests = currentRequests.filter(r => r.status === 'completed').length

    // Calculate total spent from completed maintenance records and completed requests
    const maintenanceCost = currentMaintenance.reduce((sum, record) => sum + (record.total_cost || 0), 0)
    const requestCost = currentRequests
      .filter(r => r.status === 'completed' && r.final_cost)
      .reduce((sum, r) => sum + (r.final_cost || 0), 0)

    const totalSpent = maintenanceCost + requestCost

    return {
      totalCars: currentCars.length,
      activeRequests,
      completedRequests,
      totalSpent
    }
  }, [])

  // Load initial dashboard data - simplified and robust approach
  const loadDashboardData = useCallback(async (showLoader = true) => {
    if (!user?.id) {
      console.log('No user ID available for dashboard data loading')
      return
    }

    try {
      if (showLoader) setLoading(true)
      setRefreshing(!showLoader)

      console.log('🔄 Loading dashboard data for user:', user.id)

      // Load cars and requests separately to avoid timeout issues
      console.log('📦 Loading cars...')
      const userCars = await DatabaseService.getCarsByOwner(user.id)
      console.log('✅ Cars loaded:', userCars.length, 'cars found')
      
      console.log('📋 Loading requests...')
      const userRequests = await DatabaseService.getRequestsByOwner(user.id)
      console.log('✅ Requests loaded:', userRequests.length, 'requests found')

      // Update cars and requests state immediately
      setCars(userCars)
      setRecentRequests(userRequests.slice(0, 5))

      // Load maintenance records only if there are cars
      let allMaintenanceRecords: MaintenanceRecord[] = []
      if (userCars.length > 0) {
        console.log('🔧 Loading maintenance records for', userCars.length, 'cars...')
        try {
          const maintenancePromises = userCars.map(car => 
            DatabaseService.getMaintenanceRecordsByCar(car.id)
          )
          const carMaintenanceArrays = await Promise.all(maintenancePromises)
          allMaintenanceRecords = carMaintenanceArrays.flat()

          // Sort maintenance records by date (newest first)
          allMaintenanceRecords.sort((a, b) => 
            new Date(b.maintenance_date).getTime() - new Date(a.maintenance_date).getTime()
          )
          console.log('✅ Maintenance records loaded:', allMaintenanceRecords.length, 'records found')
        } catch (maintenanceError) {
          console.error('❌ Error loading maintenance records:', maintenanceError)
          // Don't fail the whole loading process for maintenance records
        }
      }

      setMaintenanceHistory(allMaintenanceRecords.slice(0, 10))

      // Calculate and set statistics
      const newStats = calculateStats(userCars, userRequests, allMaintenanceRecords)
      setStats(newStats)

      console.log('📊 Dashboard stats calculated:', newStats)

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      message.error('Failed to load dashboard data. Please try refreshing.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, calculateStats])

  // Initial data load - only when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('🚀 Initial dashboard load triggered for user:', user.id)
      loadDashboardData(true)
    }
  }, [user?.id, loadDashboardData])

  // Real-time subscriptions - separate from initial loading
  useEffect(() => {
    if (!user?.id) return

    console.log('🔔 Setting up real-time subscriptions for user:', user.id)

    // Subscribe to real-time car updates
    const unsubscribeCars = DatabaseService.subscribeToUserCars(user.id, (updatedCars) => {
      console.log('🚗 Real-time cars update:', updatedCars.length, 'cars')
      setCars(updatedCars)
      
      // Update car count in stats immediately
      setStats(prevStats => {
        const newStats = { ...prevStats, totalCars: updatedCars.length }
        console.log('📊 Updated car count in stats:', newStats)
        return newStats
      })
    })

    // Subscribe to real-time request updates
    const unsubscribeRequests = DatabaseService.subscribeToUserRequests(user.id, (updatedRequests) => {
      console.log('📋 Real-time requests update:', updatedRequests.length, 'requests')
      setRecentRequests(updatedRequests.slice(0, 5))
      
      // Calculate real-time statistics for requests
      const activeRequests = updatedRequests.filter(r => 
        ['pending', 'claimed', 'diagnosed', 'in_progress', 'parts_requested', 'quoted', 'approved', 'parts_received'].includes(r.status)
      ).length

      const completedRequests = updatedRequests.filter(r => r.status === 'completed').length

      console.log('📊 Real-time request stats:', { activeRequests, completedRequests })

      setStats(prevStats => ({
        ...prevStats,
        activeRequests,
        completedRequests
      }))
    })

    return () => {
      console.log('🔕 Cleaning up real-time subscriptions')
      unsubscribeCars()
      unsubscribeRequests()
    }
  }, [user?.id])

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      claimed: 'blue',
      diagnosed: 'purple',
      quoted: 'cyan',
      approved: 'green',
      in_progress: 'geekblue',
      parts_requested: 'magenta',
      parts_received: 'lime',
      completed: 'green',
      cancelled: 'red'
    }
    return colors[status as keyof typeof colors] || 'default'
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pending',
      claimed: 'Claimed',
      diagnosed: 'Diagnosed', 
      quoted: 'Quoted',
      approved: 'Approved',
      in_progress: 'In Progress',
      parts_requested: 'Parts Requested',
      parts_received: 'Parts Received',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const requestColumns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <span className="font-mono text-sm">{id.slice(-8)}</span>
      )
    },
    {
      title: 'Car',
      key: 'car',
      width: 150,
      render: (record: Request) => {
        const car = record.car || cars.find(c => c.id === record.car_id)
        return car ? `${car.make} ${car.model}` : 'Unknown Car'
      }
    },
    {
      title: 'Issue',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Est. Cost',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      width: 100,
      render: (cost: number) => cost ? `GHS ${cost.toFixed(2)}` : '-'
    }
  ]

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered')
    loadDashboardData(false)
  }

  // Debug render
  console.log('🎨 Dashboard render - Cars:', cars.length, 'Stats:', stats)

  if (loading) {
    return (
      <DashboardLayout activeKey="dashboard">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
          <div className="ml-4">
            <Paragraph>Loading your dashboard...</Paragraph>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-start">
          <div>
            <Title level={2}>Welcome back{user?.name ? `, ${user.name}` : ''}!</Title>
            <Paragraph className="text-gray-600 dark:text-gray-300">
              Here's an overview of your vehicle maintenance activities. 
              {stats.totalCars > 0 && ` You have ${stats.totalCars} vehicle${stats.totalCars > 1 ? 's' : ''} registered.`}
              {stats.totalCars === 0 && cars.length > 0 && ` (${cars.length} cars detected)`}
            </Paragraph>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            loading={refreshing}
            onClick={handleRefresh}
            title="Refresh Dashboard Data"
          >
            Refresh
          </Button>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Card size="small" className="bg-blue-50 border-blue-200">
            <div className="text-xs text-blue-700">
              <strong>Debug Info:</strong> Cars Array: {cars.length} | Stats Cars: {stats.totalCars} | 
              Requests: {recentRequests.length} | User ID: {user?.id?.slice(-8)}
            </div>
          </Card>
        )}

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="My Cars"
                value={Math.max(stats.totalCars, cars.length)} // Use the higher value as fallback
                prefix={<CarOutlined className="text-blue-600" />}
                valueStyle={{ color: (stats.totalCars > 0 || cars.length > 0) ? '#1890ff' : '#d9d9d9' }}
              />
              <div className="text-xs text-gray-500 mt-2">
                Total vehicles registered
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Active Requests"
                value={stats.activeRequests}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ color: stats.activeRequests > 0 ? '#fa8c16' : '#d9d9d9' }}
              />
              <div className="text-xs text-gray-500 mt-2">
                Pending and in-progress
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Completed Services"
                value={stats.completedRequests}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: stats.completedRequests > 0 ? '#52c41a' : '#d9d9d9' }}
              />
              <div className="text-xs text-gray-500 mt-2">
                Successfully completed
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Total Spent"
                value={stats.totalSpent}
                prefix={<DollarOutlined className="text-purple-600" />}
                precision={2}
                suffix="GHS"
                valueStyle={{ color: stats.totalSpent > 0 ? '#722ed1' : '#d9d9d9' }}
              />
              <div className="text-xs text-gray-500 mt-2">
                All maintenance costs
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <Space size="middle" wrap>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => router.push('/dashboard/car-owner/cars/add')}
              size="large"
            >
              Add New Car
            </Button>
            <Button 
              icon={<FileTextOutlined />}
              onClick={() => router.push('/dashboard/car-owner/requests')}
              size="large"
              disabled={cars.length === 0 && stats.totalCars === 0}
              title={(cars.length === 0 && stats.totalCars === 0) ? "Add a car first to create requests" : "Create a service request"}
            >
              Create Repair Request
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/car-owner/cars')}
              size="large"
            >
              Manage Cars ({Math.max(stats.totalCars, cars.length)})
            </Button>
          </Space>
        </Card>

        {/* Recent Requests */}
        <Card 
          title={`Recent Repair Requests ${recentRequests.length > 0 ? `(${recentRequests.length})` : ''}`}
          extra={
            <Button 
              type="link" 
              onClick={() => router.push('/dashboard/car-owner/requests')}
            >
              View All
            </Button>
          }
        >
          {recentRequests.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                (cars.length === 0 && stats.totalCars === 0)
                  ? "Add a car first, then create repair requests"
                  : "No repair requests yet"
              }
            >
              {(cars.length === 0 && stats.totalCars === 0) ? (
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push('/dashboard/car-owner/cars/add')}
                >
                  Add Your First Car
                </Button>
              ) : (
                <Button 
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => router.push('/dashboard/car-owner/requests')}
                >
                  Create First Request
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={requestColumns}
              dataSource={recentRequests}
              pagination={false}
              scroll={{ x: 800 }}
              rowKey="id"
              size="small"
            />
          )}
        </Card>

        {/* Maintenance Insights */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Service Status Overview" bordered={false}>
              {stats.completedRequests === 0 && stats.activeRequests === 0 ? (
                <div className="text-center py-8">
                  <FileTextOutlined className="text-4xl text-gray-400 mb-4" />
                  <Paragraph className="text-gray-500">
                    No service activity yet. {(cars.length === 0 && stats.totalCars === 0) ? 'Add a car and create' : 'Create'} your first repair request to get started!
                  </Paragraph>
                  {(cars.length === 0 && stats.totalCars === 0) ? (
                    <Button 
                      type="primary"
                      onClick={() => router.push('/dashboard/car-owner/cars/add')}
                    >
                      Add Car First
                    </Button>
                  ) : (
                    <Button 
                      type="primary"
                      onClick={() => router.push('/dashboard/car-owner/requests')}
                    >
                      Create Request
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.activeRequests > 0 && (
                    <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400">
                      <div>
                        <div className="font-medium text-orange-800 dark:text-orange-200">
                          Active Requests
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-300">
                          You have {stats.activeRequests} active service request{stats.activeRequests > 1 ? 's' : ''} in progress
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        {stats.activeRequests}
                      </div>
                    </div>
                  )}
                  
                  {stats.completedRequests > 0 && (
                    <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Completed Services
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                          Total of {stats.completedRequests} completed service{stats.completedRequests > 1 ? 's' : ''} across all vehicles
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {stats.completedRequests}
                      </div>
                    </div>
                  )}

                  {stats.totalSpent > 0 && (
                    <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-400">
                      <div>
                        <div className="font-medium text-purple-800 dark:text-purple-200">
                          Total Investment
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-300">
                          Amount spent on vehicle maintenance and repairs
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        GHS {stats.totalSpent.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Recent Service History" bordered={false}>
              {maintenanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <ClockCircleOutlined className="text-4xl text-gray-400 mb-4" />
                  <Paragraph className="text-gray-500">
                    No maintenance history available yet. Complete service requests to build your history.
                  </Paragraph>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {maintenanceHistory.slice(0, 5).map((record, index) => {
                    const car = cars.find(c => c.id === record.car_id)
                    return (
                      <div key={record.id || index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">{record.title}</div>
                          <div className="text-sm text-gray-500">
                            {car ? `${car.make} ${car.model}` : 'Unknown Vehicle'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {record.labor_hours && `${record.labor_hours} hours labor`}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium text-green-600">GHS {record.total_cost.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.maintenance_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {maintenanceHistory.length > 5 && (
                    <div className="text-center pt-2">
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => router.push('/dashboard/car-owner/diagnoses')}
                      >
                        View All History ({maintenanceHistory.length} records)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Cars Quick Overview - Only show if no cars */}
        {cars.length === 0 && stats.totalCars === 0 && (
                          <Card title="Get Started with Auto Care">
            <div className="text-center py-8">
              <CarOutlined className="text-6xl text-blue-400 mb-4" />
              <Title level={4}>Add Your First Vehicle</Title>
              <Paragraph className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Start by adding your vehicles to track maintenance history and create service requests. 
                Once you add a car, you can connect with mechanics and manage repairs easily.
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                icon={<PlusOutlined />}
                onClick={() => router.push('/dashboard/car-owner/cars/add')}
              >
                Add Your First Car
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 