'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Button, Table, Tag, Space, Spin, Empty } from 'antd'
import { 
  CarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  PlusOutlined
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
  const [stats, setStats] = useState<DashboardStats>({
    totalCars: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalSpent: 0
  })
  const [recentRequests, setRecentRequests] = useState<Request[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  useEffect(() => {
    // Subscribe to real-time car updates
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToUserCars?.(user.id, (updatedCars) => {
        setCars(updatedCars)
        // Update stats when cars change
        setStats(prevStats => ({
          ...prevStats,
          totalCars: updatedCars.length
        }))
      }) || (() => {})
      return unsubscribe
    }
  }, [user])

  useEffect(() => {
    // Subscribe to real-time request updates
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToUserRequests(user.id, (updatedRequests) => {
        setRecentRequests(updatedRequests.slice(0, 5))
        
        // Calculate real-time statistics
        const activeRequests = updatedRequests.filter(r => 
          ['pending', 'claimed', 'diagnosed', 'in_progress', 'parts_requested'].includes(r.status)
        ).length

        const completedRequests = updatedRequests.filter(r => r.status === 'completed').length

        setStats(prevStats => ({
          ...prevStats,
          activeRequests,
          completedRequests
        }))
      })
      return unsubscribe
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // Load cars, requests, and maintenance records in parallel
      const [userCars, userRequests] = await Promise.all([
        DatabaseService.getCarsByOwner(user.id),
        DatabaseService.getRequestsByOwner(user.id)
      ])

      setCars(userCars)
      setRecentRequests(userRequests.slice(0, 5)) // Show only recent 5 requests

      // Load maintenance records for all cars
      const allMaintenanceRecords: MaintenanceRecord[] = []
      for (const car of userCars) {
        const carMaintenance = await DatabaseService.getMaintenanceRecordsByCar(car.id)
        allMaintenanceRecords.push(...carMaintenance)
      }

      // Sort maintenance records by date (newest first)
      allMaintenanceRecords.sort((a, b) => 
        new Date(b.maintenance_date).getTime() - new Date(a.maintenance_date).getTime()
      )
      setMaintenanceHistory(allMaintenanceRecords.slice(0, 10)) // Show recent 10 records

      // Calculate statistics
      const activeRequests = userRequests.filter(r => 
        ['pending', 'claimed', 'diagnosed', 'in_progress', 'parts_requested'].includes(r.status)
      ).length

      const completedRequests = userRequests.filter(r => r.status === 'completed').length

      // Calculate total spent from completed maintenance records
      const totalSpent = allMaintenanceRecords
        .filter(record => record.total_cost)
        .reduce((sum, record) => sum + record.total_cost, 0)

      setStats({
        totalCars: userCars.length,
        activeRequests,
        completedRequests,
        totalSpent
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      claimed: 'blue',
      diagnosed: 'purple',
      in_progress: 'blue',
      parts_requested: 'magenta',
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
      in_progress: 'In Progress',
      parts_requested: 'Parts Requested',
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
      render: (id: string) => (
        <span className="font-mono text-sm">{id.slice(-8)}</span>
      )
    },
    {
      title: 'Car',
      dataIndex: 'car_id',
      key: 'car',
      render: (carId: string) => {
        const car = cars.find(c => c.id === carId)
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
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Estimated Cost',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      render: (cost: number) => cost ? `GHS ${cost.toFixed(2)}` : '-'
    }
  ]

  if (loading) {
    return (
      <DashboardLayout activeKey="dashboard">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <Title level={2}>Welcome back{user?.name ? `, ${user.name}` : ''}!</Title>
          <Paragraph className="text-gray-600 dark:text-gray-300">
            Here's an overview of your vehicle maintenance activities.
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="My Cars"
                value={stats.totalCars}
                prefix={<CarOutlined className="text-blue-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Active Requests"
                value={stats.activeRequests}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover:shadow-md transition-shadow">
              <Statistic
                title="Completed Services"
                value={stats.completedRequests}
                prefix={<CheckCircleOutlined className="text-green-600" />}
              />
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
              />
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
            >
              Create Repair Request
            </Button>
          </Space>
        </Card>

        {/* Recent Requests */}
        <Card 
          title="Recent Repair Requests"
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
              description="No repair requests yet"
            >
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push('/dashboard/car-owner/requests')}
              >
                Create First Request
              </Button>
            </Empty>
          ) : (
            <Table
              columns={requestColumns}
              dataSource={recentRequests}
              pagination={false}
              scroll={{ x: 800 }}
              rowKey="id"
            />
          )}
        </Card>

        {/* Maintenance Insights */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Recent Activity" bordered={false}>
              {stats.completedRequests === 0 && stats.activeRequests === 0 ? (
                <div className="text-center py-8">
                  <FileTextOutlined className="text-4xl text-gray-400 mb-4" />
                  <Paragraph className="text-gray-500">
                    No service activity yet. Create your first repair request to get started!
                  </Paragraph>
                  <Button 
                    type="primary"
                    onClick={() => router.push('/dashboard/car-owner/requests')}
                  >
                    Create Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.activeRequests > 0 && (
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded border-l-4 border-orange-400">
                      <div>
                        <div className="font-medium text-orange-800 dark:text-orange-200">
                          Active Requests
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-300">
                          You have {stats.activeRequests} active service request{stats.activeRequests > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.activeRequests}
                      </div>
                    </div>
                  )}
                  
                  {stats.completedRequests > 0 && (
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400">
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Completed Services
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                          Total of {stats.completedRequests} completed service{stats.completedRequests > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.completedRequests}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Service History" bordered={false}>
              {maintenanceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <ClockCircleOutlined className="text-4xl text-gray-400 mb-4" />
                  <Paragraph className="text-gray-500">
                    No maintenance history available yet.
                  </Paragraph>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {maintenanceHistory.slice(0, 5).map((record, index) => {
                    const car = cars.find(c => c.id === record.car_id)
                    return (
                      <div key={record.id || index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <div className="font-medium">{record.title}</div>
                          <div className="text-sm text-gray-500">
                            {car ? `${car.make} ${car.model}` : 'Unknown Vehicle'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">GHS {record.total_cost.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.maintenance_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {maintenanceHistory.length > 5 && (
                    <div className="text-center">
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => router.push('/dashboard/car-owner/diagnoses')}
                      >
                        View All History
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Cars Quick Overview */}
        {cars.length === 0 && (
          <Card title="Get Started">
            <div className="text-center py-8">
              <CarOutlined className="text-6xl text-blue-400 mb-4" />
              <Title level={4}>Add Your First Vehicle</Title>
              <Paragraph className="text-gray-600 dark:text-gray-300 mb-6">
                Start by adding your vehicles to track maintenance and create service requests.
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