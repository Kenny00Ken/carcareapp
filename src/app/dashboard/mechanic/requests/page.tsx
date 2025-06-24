'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Typography, 
  Empty, 
  Button, 
  Badge, 
  Tag, 
  Space, 
  message, 
  Modal, 
  Descriptions,
  Tabs,
  Spin,
  Avatar,
  Form,
  Input,
  Select,
  InputNumber
} from 'antd'
import { 
  CarOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FileTextOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Request, RequestStatus, Diagnosis } from '@/types'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

interface DiagnosisFormValues {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  estimated_cost: number
  recommended_parts: string
  next_steps: string
}

// Helper function to get status color
const getStatusColor = (status: RequestStatus) => {
  const statusColors = {
    pending: 'orange',
    claimed: 'blue',
    diagnosed: 'cyan',
    quoted: 'purple',
    approved: 'green',
    in_progress: 'geekblue',
    parts_requested: 'gold',
    parts_received: 'lime',
    completed: 'green',
    cancelled: 'red'
  }
  return statusColors[status] || 'default'
}

// Helper function to get urgency color
const getUrgencyColor = (urgency: string) => {
  const urgencyColors: Record<string, string> = {
    low: 'green',
    medium: 'orange',
    high: 'red'
  }
  return urgencyColors[urgency] || 'default'
}

// Helper function to format time ago
const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return time.toLocaleDateString()
}

export default function MechanicRequestsPage() {
  const { user } = useAuth()
  const [availableRequests, setAvailableRequests] = useState<Request[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingRequest, setClaimingRequest] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false)
  const [creatingDiagnosis, setCreatingDiagnosis] = useState(false)
  const [diagnosisForm] = Form.useForm<DiagnosisFormValues>()
  
  useEffect(() => {
    if (user) {
      loadData()
      setupRealtimeSubscriptions()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Load available requests and my requests in parallel
      const [availableReqs, myReqs] = await Promise.all([
        DatabaseService.getAvailableRequests(),
        DatabaseService.getRequestsByMechanic(user.id)
      ])
      
      setAvailableRequests(availableReqs)
      setMyRequests(myReqs)
    } catch (error) {
      console.error('Error loading requests:', error)
      message.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    if (!user) return

    // Subscribe to available requests
    const unsubscribeAvailable = DatabaseService.subscribeToAvailableRequests((requests) => {
      setAvailableRequests(requests)
    })

    // Subscribe to mechanic's own requests
    const unsubscribeMy = DatabaseService.subscribeToMechanicRequests(user.id, (requests) => {
      setMyRequests(requests)
    })

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeAvailable()
      unsubscribeMy()
    }
  }

  const handleClaimRequest = async (requestId: string) => {
    if (!user) return

    try {
      setClaimingRequest(requestId)
      await DatabaseService.claimRequest(requestId, user.id)
      message.success('Request claimed successfully!')
      
      // Request will be automatically moved to "My Requests" via real-time subscription
    } catch (error) {
      console.error('Error claiming request:', error)
      message.error('Failed to claim request')
    } finally {
      setClaimingRequest(null)
    }
  }

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request)
    setDetailsModalVisible(true)
  }

  const handleCreateDiagnosis = (request: Request) => {
    setSelectedRequest(request)
    setDiagnosisModalVisible(true)
    diagnosisForm.resetFields()
  }

  const handleSubmitDiagnosis = async (values: DiagnosisFormValues) => {
    if (!user || !selectedRequest) return

    try {
      setCreatingDiagnosis(true)
      
      const diagnosisData = {
        request_id: selectedRequest.id,
        mechanic_id: user.id,
        title: values.title,
        description: values.description,
        severity: values.severity,
        estimated_cost: values.estimated_cost,
        recommended_parts: values.recommended_parts,
        next_steps: values.next_steps
      }

      await DatabaseService.createDiagnosis(diagnosisData)
      message.success('Diagnosis created successfully!')
      
      setDiagnosisModalVisible(false)
      diagnosisForm.resetFields()
    } catch (error) {
      console.error('Error creating diagnosis:', error)
      message.error('Failed to create diagnosis')
    } finally {
      setCreatingDiagnosis(false)
    }
  }

  // Columns for available requests
  const availableRequestsColumns = [
    {
      title: 'Car Details',
      key: 'car',
      render: (record: Request) => (
        <div className="flex items-center space-x-3">
          <Avatar icon={<CarOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium">
              {record.car ? `${record.car.make} ${record.car.model} (${record.car.year})` : 'Unknown Vehicle'}
            </div>
            <div className="text-sm text-gray-500">
              {record.car?.license_plate && `License: ${record.car.license_plate}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Request Details',
      key: 'details',
      render: (record: Request) => (
        <div>
          <div className="font-medium mb-1">{record.title}</div>
          <Paragraph 
            className="text-sm text-gray-600 !mb-2" 
            ellipsis={{ rows: 2, expandable: false }}
          >
            {record.description}
          </Paragraph>
          <div className="flex items-center space-x-2">
            <Tag color={getUrgencyColor(record.urgency)} className="text-xs">
              {record.urgency.toUpperCase()}
            </Tag>
            <span className="text-xs text-gray-500">
              <EnvironmentOutlined className="mr-1" />
              {record.location}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (record: Request) => (
        <div className="flex items-center space-x-2">
          <Avatar icon={<UserOutlined />} className="bg-green-500" />
          <div>
            <div className="font-medium">{record.owner?.name || 'Unknown'}</div>
            <div className="text-sm text-gray-500">{record.owner?.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Created',
      key: 'created_at',
      render: (record: Request) => (
        <div className="text-sm">
          <div>{formatTimeAgo(record.created_at)}</div>
          <div className="text-gray-500">
            {new Date(record.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Request) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          <Button
            type="primary"
            size="small"
            loading={claimingRequest === record.id}
            onClick={() => handleClaimRequest(record.id)}
            icon={<CheckCircleOutlined />}
          >
            Claim Request
          </Button>
        </Space>
      ),
    },
  ]

  // Columns for my requests
  const myRequestsColumns = [
    {
      title: 'Car Details',
      key: 'car',
      render: (record: Request) => (
        <div className="flex items-center space-x-3">
          <Avatar icon={<CarOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium">
              {record.car ? `${record.car.make} ${record.car.model} (${record.car.year})` : 'Unknown Vehicle'}
            </div>
            <div className="text-sm text-gray-500">
              {record.car?.license_plate && `License: ${record.car.license_plate}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Request Details',
      key: 'details',
      render: (record: Request) => (
        <div>
          <div className="font-medium mb-1">{record.title}</div>
          <Paragraph 
            className="text-sm text-gray-600 !mb-2" 
            ellipsis={{ rows: 2, expandable: false }}
          >
            {record.description}
          </Paragraph>
          <div className="flex items-center space-x-2">
            <Tag color={getUrgencyColor(record.urgency)} className="text-xs">
              {record.urgency.toUpperCase()}
            </Tag>
            <span className="text-xs text-gray-500">
              <EnvironmentOutlined className="mr-1" />
              {record.location}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (record: Request) => (
        <div className="flex items-center space-x-2">
          <Avatar icon={<UserOutlined />} className="bg-green-500" />
          <div>
            <div className="font-medium">{record.owner?.name || 'Unknown'}</div>
            <div className="text-sm text-gray-500">{record.owner?.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Request) => (
        <Tag color={getStatusColor(record.status)} className="text-xs">
          {record.status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Updated',
      key: 'updated_at',
      render: (record: Request) => (
        <div className="text-sm">
          <div>{formatTimeAgo(record.updated_at)}</div>
          <div className="text-gray-500">
            {new Date(record.updated_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Request) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => handleViewDetails(record)}
          >
            View Details
          </Button>
          {record.status === 'claimed' && (
            <Button
              type="primary"
              size="small"
              icon={<MedicineBoxOutlined />}
              onClick={() => handleCreateDiagnosis(record)}
            >
              Create Diagnosis
            </Button>
          )}
          <Button
            type="primary"
            size="small"
            onClick={() => window.open(`/dashboard/mechanic/requests/${record.id}/chat`, '_blank')}
          >
            Chat
          </Button>
        </Space>
      ),
    },
  ]

  if (!user) {
    return (
      <DashboardLayout activeKey="requests">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="requests">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2}>Service Requests</Title>
            <Text type="secondary">
              Manage available and claimed service requests
            </Text>
          </div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <Tabs defaultActiveKey="available" size="large">
          <TabPane 
            tab={
              <span>
                <ExclamationCircleOutlined />
                Available Requests 
                <Badge count={availableRequests.length} className="ml-2" />
              </span>
            } 
            key="available"
          >
            <Card>
              <Table
                columns={availableRequestsColumns}
                dataSource={availableRequests}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} available requests`,
                }}
                locale={{
                  emptyText: (
                    <Empty 
                      description="No available requests"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }}
              />
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                My Requests 
                <Badge count={myRequests.length} className="ml-2" />
              </span>
            } 
            key="my-requests"
          >
            <Card>
              <Table
                columns={myRequestsColumns}
                dataSource={myRequests}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} my requests`,
                }}
                locale={{
                  emptyText: (
                    <Empty 
                      description="No claimed requests yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* Request Details Modal */}
        <Modal
          title="Request Details"
          visible={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedRequest && (
            <div className="space-y-4">
              {/* Car Information */}
              <Card size="small" title="Vehicle Information">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Make & Model">
                    {selectedRequest.car ? 
                      `${selectedRequest.car.make} ${selectedRequest.car.model}` : 
                      'Unknown Vehicle'
                    }
                  </Descriptions.Item>
                  <Descriptions.Item label="Year">
                    {selectedRequest.car?.year || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="License Plate">
                    {selectedRequest.car?.license_plate || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mileage">
                    {selectedRequest.car?.mileage ? `${selectedRequest.car.mileage} km` : 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Request Information */}
              <Card size="small" title="Request Information">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Title">
                    {selectedRequest.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {selectedRequest.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="Urgency">
                    <Tag color={getUrgencyColor(selectedRequest.urgency)}>
                      {selectedRequest.urgency.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {selectedRequest.location}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Owner Information */}
              <Card size="small" title="Owner Information">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Name">
                    {selectedRequest.owner?.name || 'Unknown'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedRequest.owner?.phone || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedRequest.owner?.email || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {selectedRequest.owner?.address || 'N/A'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                {selectedRequest.status === 'pending' && (
                  <Button
                    type="primary"
                    loading={claimingRequest === selectedRequest.id}
                    onClick={() => {
                      handleClaimRequest(selectedRequest.id)
                      setDetailsModalVisible(false)
                    }}
                    icon={<CheckCircleOutlined />}
                  >
                    Claim Request
                  </Button>
                )}
                {selectedRequest.mechanic_id === user.id && (
                  <Button
                    type="primary"
                    onClick={() => {
                      window.open(`/dashboard/mechanic/requests/${selectedRequest.id}/chat`, '_blank')
                      setDetailsModalVisible(false)
                    }}
                  >
                    Open Chat
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Diagnosis Creation Modal */}
        <Modal
          title="Create Diagnosis"
          visible={diagnosisModalVisible}
          onCancel={() => setDiagnosisModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={diagnosisForm}
            layout="vertical"
            onFinish={handleSubmitDiagnosis}
          >
            <Form.Item
              name="title"
              label="Diagnosis Title"
              rules={[{ required: true, message: 'Please enter diagnosis title' }]}
            >
              <Input placeholder="Brief diagnosis title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Detailed Description"
              rules={[{ required: true, message: 'Please enter detailed description' }]}
            >
              <TextArea
                rows={4}
                placeholder="Detailed description of the problem and findings"
              />
            </Form.Item>

            <Form.Item
              name="severity"
              label="Severity"
              rules={[{ required: true, message: 'Please select severity level' }]}
              initialValue="medium"
            >
              <Select>
                <Option value="low">Low - Minor issue</Option>
                <Option value="medium">Medium - Moderate concern</Option>
                <Option value="high">High - Urgent repair needed</Option>
                <Option value="critical">Critical - Safety hazard</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="estimated_cost"
              label="Estimated Cost (GHS)"
              rules={[{ required: true, message: 'Please enter estimated cost' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="0.00"
                prefix="GHS"
              />
            </Form.Item>

            <Form.Item
              name="recommended_parts"
              label="Recommended Parts"
            >
              <TextArea
                rows={3}
                placeholder="List of recommended parts needed for repair"
              />
            </Form.Item>

            <Form.Item
              name="next_steps"
              label="Next Steps"
              rules={[{ required: true, message: 'Please enter next steps' }]}
            >
              <TextArea
                rows={3}
                placeholder="Recommended next steps and action plan"
              />
            </Form.Item>

            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={() => setDiagnosisModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={creatingDiagnosis}
                icon={<FileTextOutlined />}
              >
                Create Diagnosis
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 