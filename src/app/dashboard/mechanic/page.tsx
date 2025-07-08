'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Button, Table, Tag, Space, Progress } from 'antd'
import { 
  ToolOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  StarOutlined,
  CarOutlined,
  HistoryOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Request, MechanicStats } from '@/types'
import { useRouter } from 'next/navigation'

const { Title, Paragraph } = Typography

export default function MechanicDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<MechanicStats>({
    available_requests: 0,
    active_jobs: 0,
    completed_jobs: 0,
    total_earnings: 0,
    average_rating: 4.8
  })
  const [availableRequests, setAvailableRequests] = useState<Request[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  useEffect(() => {
    // Subscribe to real-time updates for available requests with location filtering
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToAvailableRequestsForMechanic(user.id, (requests) => {
        setAvailableRequestsData(requests.slice(0, 5)) // Show only first 5
      })
      return unsubscribe
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      // Load statistics
      const mechanicStats = await DatabaseService.getMechanicStats(user.id)
      setStats(mechanicStats)

      // Load available requests with location filtering
      const availableReqs = await DatabaseService.getAvailableRequestsForMechanic(user.id)
      setAvailableRequestsData(availableReqs.slice(0, 5))

      // Load recent activity (activity logs)
      const activityLogs = await DatabaseService.getActivityLogs(undefined, user.id)
      setRecentActivity(activityLogs.slice(0, 5))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setAvailableRequestsData = async (requests: Request[]) => {
    // Enrich requests with car and owner data
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const [car, owner] = await Promise.all([
          DatabaseService.getCar(request.car_id),
          DatabaseService.getUser(request.owner_id)
        ])
        return { ...request, car: car || undefined, owner: owner || undefined }
      })
    )
    setAvailableRequests(enrichedRequests)
  }

  const handleClaimRequest = async (requestId: string) => {
    try {
      await DatabaseService.claimRequest(requestId, user!.id)
      loadDashboardData() // Refresh data
      
      // Navigate to requests page
      router.push('/dashboard/mechanic/requests')
    } catch (error) {
      console.error('Error claiming request:', error)
    }
  }

  const requestColumns = [
    {
      title: 'Request Details',
      key: 'details',
      render: (record: Request) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">
            {record.title}
          </div>
          <div className="text-xs text-gray-500">
            {record.car?.make} {record.car?.model} ({record.car?.year})
          </div>
          <div className="text-xs text-gray-500">
            Owner: {record.owner?.name || 'Unknown'}
          </div>
          <div className="flex flex-wrap gap-1 sm:hidden">
            <Tag color={(() => {
              const colors = {
                low: 'green',
                medium: 'orange', 
                high: 'red'
              }
              return colors[record.urgency as keyof typeof colors]
            })()} className="text-xs">
              {record.urgency.toUpperCase()}
            </Tag>
            {record.estimated_hours && (
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {record.estimated_hours}h
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 80,
      responsive: ['sm'],
      render: (urgency: string) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red'
        }
        return <Tag color={colors[urgency as keyof typeof colors]} className="text-xs">{urgency.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Est. Hours',
      dataIndex: 'estimated_hours',
      key: 'estimated_hours',
      width: 80,
      responsive: ['md'],
      render: (hours: number) => <span className="text-sm">{hours ? `${hours}h` : '-'}</span>
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (record: Request) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleClaimRequest(record.id)}
          className="!w-full sm:!w-auto"
        >
          Claim
        </Button>
      )
    }
  ]

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'request_claimed': return <ToolOutlined className="text-blue-600" />
      case 'diagnosis_submitted': return <FileTextOutlined className="text-purple-600" />
      case 'work_completed': return <CheckCircleOutlined className="text-green-600" />
      case 'parts_requested': return <ShoppingCartOutlined className="text-orange-600" />
      default: return <ClockCircleOutlined className="text-gray-600" />
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'request_claimed': return 'blue'
      case 'diagnosis_submitted': return 'purple'
      case 'work_completed': return 'green'
      case 'parts_requested': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <DashboardLayout activeKey="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <Title level={2} className="!text-xl sm:!text-2xl">Welcome back, {user?.name}!</Title>
          <Paragraph className="text-gray-600 dark:text-gray-300 !text-sm sm:!text-base">
            Here's your service overview and available opportunities.
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Available Requests</span>}
                value={stats.available_requests}
                prefix={<FileTextOutlined className="text-blue-600" />}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Active Jobs</span>}
                value={stats.active_jobs}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Completed Jobs</span>}
                value={stats.completed_jobs}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Card className="text-center">
              <Statistic
                title={<span className="text-xs sm:text-sm">Total Earnings</span>}
                value={stats.total_earnings}
                prefix={<DollarOutlined className="text-purple-600" />}
                precision={2}
                valueStyle={{ fontSize: '18px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Performance Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span className="text-sm sm:text-base">Performance Overview</span>}>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm sm:text-base">Customer Rating</span>
                    <span className="flex items-center text-sm sm:text-base">
                      <StarOutlined className="text-yellow-400 mr-1" />
                      {stats.average_rating}/5.0
                    </span>
                  </div>
                  <Progress percent={(stats.average_rating / 5) * 100} strokeColor="#faad14" size="small" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm sm:text-base">Job Completion Rate</span>
                    <span className="text-sm sm:text-base">
                      {stats.completed_jobs > 0 
                        ? Math.round((stats.completed_jobs / (stats.completed_jobs + stats.active_jobs)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    percent={stats.completed_jobs > 0 
                      ? Math.round((stats.completed_jobs / (stats.completed_jobs + stats.active_jobs)) * 100)
                      : 0} 
                    strokeColor="#52c41a" 
                    size="small"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm sm:text-base">Response Time</span>
                    <span className="text-sm sm:text-base">Excellent</span>
                  </div>
                  <Progress percent={88} strokeColor="#1890ff" size="small" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span className="text-sm sm:text-base">Quick Actions</span>}>
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  type="primary" 
                  icon={<FileTextOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/dashboard/mechanic/requests')}
                  className="!h-12"
                >
                  <span className="hidden sm:inline">View All Service Requests</span>
                  <span className="sm:hidden">Service Requests</span>
                </Button>
                <Button 
                  icon={<ToolOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/dashboard/mechanic/diagnoses')}
                  className="!h-12"
                >
                  <span className="hidden sm:inline">Manage Diagnoses</span>
                  <span className="sm:hidden">Diagnoses</span>
                </Button>
                <Button 
                  icon={<CarOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/dashboard/mechanic/parts')}
                  className="!h-12"
                >
                  <span className="hidden sm:inline">Browse Parts Catalog</span>
                  <span className="sm:hidden">Parts Catalog</span>
                </Button>
                <Button 
                  icon={<HistoryOutlined />}
                  block
                  size="large"
                  onClick={() => router.push('/dashboard/mechanic/history')}
                  className="!h-12"
                >
                  <span className="hidden sm:inline">View Maintenance History</span>
                  <span className="sm:hidden">Maintenance History</span>
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Available Requests */}
        <Card 
          title={<span className="text-sm sm:text-base">Available Service Requests</span>}
          extra={
            <Button 
              type="link" 
              onClick={() => router.push('/dashboard/mechanic/requests')}
              className="!text-sm"
            >
              View All
            </Button>
          }
        >
          <Table
            columns={requestColumns}
            dataSource={availableRequests}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 400 }}
            size="small"
            className="overflow-x-auto"
            locale={{ emptyText: 'No available requests at the moment' }}
          />
        </Card>

        {/* Recent Activity */}
        <Card title={<span className="text-sm sm:text-base">Recent Activity</span>}>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id} className={`flex items-center space-x-3 p-3 bg-${getActivityColor(activity.activity_type)}-50 dark:bg-${getActivityColor(activity.activity_type)}-900/20 rounded`}>
                  {getActivityIcon(activity.activity_type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">{activity.description}</div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockCircleOutlined className="text-2xl sm:text-4xl mb-4" />
                <p className="text-sm sm:text-base">No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 