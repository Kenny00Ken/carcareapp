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
    // Subscribe to real-time updates for available requests
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToAvailableRequests((requests) => {
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

      // Load available requests
      const availableReqs = await DatabaseService.getAvailableRequests()
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
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.slice(-8)
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (record: Request) => `${record.car?.make} ${record.car?.model} (${record.car?.year})`
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (record: Request) => record.owner?.name || 'Unknown'
    },
    {
      title: 'Issue',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency: string) => {
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red'
        }
        return <Tag color={colors[urgency as keyof typeof colors]}>{urgency.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Est. Hours',
      dataIndex: 'estimated_hours',
      key: 'estimated_hours',
      render: (hours: number) => hours ? `${hours}h` : '-'
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: Request) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleClaimRequest(record.id)}
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
          <Title level={2}>Welcome back, {user?.name}!</Title>
          <Paragraph className="text-gray-600 dark:text-gray-300">
            Here's your service overview and available opportunities.
          </Paragraph>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Available Requests"
                value={stats.available_requests}
                prefix={<FileTextOutlined className="text-blue-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Jobs"
                value={stats.active_jobs}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completed Jobs"
                value={stats.completed_jobs}
                prefix={<CheckCircleOutlined className="text-green-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Earnings"
                value={stats.total_earnings}
                prefix={<DollarOutlined className="text-purple-600" />}
                precision={2}
              />
            </Card>
          </Col>
        </Row>

        {/* Performance Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Performance Overview">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Customer Rating</span>
                    <span className="flex items-center">
                      <StarOutlined className="text-yellow-400 mr-1" />
                      {stats.average_rating}/5.0
                    </span>
                  </div>
                  <Progress percent={(stats.average_rating / 5) * 100} strokeColor="#faad14" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Job Completion Rate</span>
                    <span>
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
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Response Time</span>
                    <span>Excellent</span>
                  </div>
                  <Progress percent={88} strokeColor="#1890ff" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Quick Actions">
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  type="primary" 
                  icon={<FileTextOutlined />}
                  block
                  onClick={() => router.push('/dashboard/mechanic/requests')}
                >
                  View All Service Requests
                </Button>
                <Button 
                  icon={<ToolOutlined />}
                  block
                  onClick={() => router.push('/dashboard/mechanic/diagnoses')}
                >
                  Manage Diagnoses
                </Button>
                <Button 
                  icon={<CarOutlined />}
                  block
                  onClick={() => router.push('/dashboard/mechanic/parts')}
                >
                  Browse Parts Catalog
                </Button>
                <Button 
                  icon={<HistoryOutlined />}
                  block
                  onClick={() => router.push('/dashboard/mechanic/history')}
                >
                  View Maintenance History
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Available Requests */}
        <Card 
          title="Available Service Requests"
          extra={
            <Button 
              type="link" 
              onClick={() => router.push('/dashboard/mechanic/requests')}
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
            scroll={{ x: 800 }}
            locale={{ emptyText: 'No available requests at the moment' }}
          />
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id} className={`flex items-center space-x-3 p-3 bg-${getActivityColor(activity.activity_type)}-50 dark:bg-${getActivityColor(activity.activity_type)}-900/20 rounded`}>
                  {getActivityIcon(activity.activity_type)}
                  <div className="flex-1">
                    <div className="font-medium">{activity.description}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockCircleOutlined className="text-4xl mb-4" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
} 