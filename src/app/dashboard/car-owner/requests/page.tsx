'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Badge,
  Row,
  Col,
  Spin,
  Empty
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MessageOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Request, RequestStatus, Car } from '@/types'

const { Title, Text } = Typography
const { TextArea } = Input

export default function CarOwnerRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (user) {
      fetchRequests()
      fetchCars()
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userRequests = await DatabaseService.getRequestsByOwner(user.uid)
      setRequests(userRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
      message.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchCars = async () => {
    if (!user) return
    
    try {
      const userCars = await DatabaseService.getCarsByOwner(user.uid)
      setCars(userCars)
    } catch (error) {
      console.error('Error fetching cars:', error)
    }
  }

  const handleCreateRequest = async (values: any) => {
    if (!user) return

    try {
      const requestData = {
        ...values,
        owner_id: user.uid,
        status: 'pending' as RequestStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await DatabaseService.createRequest(requestData)
      message.success('Service request created successfully')
      setModalVisible(false)
      form.resetFields()
      fetchRequests()
    } catch (error) {
      console.error('Error creating request:', error)
      message.error('Failed to create request')
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await DatabaseService.deleteRequest(requestId)
      message.success('Request deleted successfully')
      fetchRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
      message.error('Failed to delete request')
    }
  }

  const getStatusColor = (status: RequestStatus) => {
    const colors = {
      'pending': 'orange',
      'claimed': 'blue',
      'diagnosed': 'purple',
      'quoted': 'cyan',
      'approved': 'green',
      'in_progress': 'gold',
      'parts_requested': 'magenta',
      'parts_received': 'lime',
      'completed': 'green',
      'cancelled': 'red'
    }
    return colors[status] || 'default'
  }

  const getUrgencyColor = (urgency: string) => {
    const colors = { low: 'green', medium: 'orange', high: 'red' }
    return colors[urgency as keyof typeof colors] || 'default'
  }

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.slice(-8)
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: 'Car',
      key: 'car',
      render: (record: Request) => (
        <div>
          <div>{record.car?.make} {record.car?.model}</div>
          <div className="text-sm text-gray-500">{record.car?.year}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: RequestStatus) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency: string) => (
        <Tag color={getUrgencyColor(urgency)}>{urgency.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Mechanic',
      key: 'mechanic',
      render: (record: Request) => record.mechanic?.name || 'Not assigned'
    },
    {
      title: 'Est. Cost',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      render: (cost: number) => cost ? `GHS ${cost.toFixed(2)}` : '-'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Request) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRequest(record)
              setViewModalVisible(true)
            }}
          />
          {record.mechanic && (
            <Button
              icon={<MessageOutlined />}
              onClick={() => {
                // Navigate to chat
                window.location.href = `/dashboard/car-owner/requests/${record.id}/chat`
              }}
            />
          )}
          {record.status === 'pending' && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Request',
                  content: 'Are you sure you want to delete this request?',
                  onOk: () => handleDeleteRequest(record.id)
                })
              }}
            />
          )}
        </Space>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="requests">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2}>My Service Requests</Title>
            <Text type="secondary">Manage your car service requests</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            New Request
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <Empty
                  description="No service requests yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" onClick={() => setModalVisible(true)}>
                    Create Your First Request
                  </Button>
                </Empty>
              )
            }}
          />
        </Card>

        {/* Create Request Modal */}
        <Modal
          title="Create Service Request"
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false)
            form.resetFields()
          }}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateRequest}
          >
            <Form.Item
              name="car_id"
              label="Select Car"
              rules={[{ required: true, message: 'Please select a car' }]}
            >
              <Select placeholder="Choose your car">
                {cars.map(car => (
                  <Select.Option key={car.id} value={car.id}>
                    {car.make} {car.model} ({car.year}) - {car.license_plate}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="Issue Title"
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input placeholder="Brief description of the issue" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Detailed Description"
              rules={[{ required: true, message: 'Please provide details' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Describe the problem in detail, including symptoms, when it occurs, etc."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="urgency"
                  label="Urgency Level"
                  rules={[{ required: true, message: 'Please select urgency' }]}
                >
                  <Select>
                    <Select.Option value="low">Low - Can wait</Select.Option>
                    <Select.Option value="medium">Medium - Soon as possible</Select.Option>
                    <Select.Option value="high">High - Urgent</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Service Location"
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input placeholder="Where should the mechanic come?" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* View Request Modal */}
        <Modal
          title="Request Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Request Information</h4>
                <p><strong>ID:</strong> {selectedRequest.id}</p>
                <p><strong>Title:</strong> {selectedRequest.title}</p>
                <p><strong>Description:</strong> {selectedRequest.description}</p>
                <p><strong>Urgency:</strong> <Tag color={getUrgencyColor(selectedRequest.urgency)}>{selectedRequest.urgency}</Tag></p>
                <p><strong>Location:</strong> {selectedRequest.location}</p>
                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Tag></p>
                <p><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>

              <div>
                <h4 className="font-semibold">Vehicle Information</h4>
                <p><strong>Make/Model:</strong> {selectedRequest.car?.make} {selectedRequest.car?.model}</p>
                <p><strong>Year:</strong> {selectedRequest.car?.year}</p>
                <p><strong>License Plate:</strong> {selectedRequest.car?.license_plate || 'N/A'}</p>
              </div>

              {selectedRequest.mechanic && (
                <div>
                  <h4 className="font-semibold">Assigned Mechanic</h4>
                  <p><strong>Name:</strong> {selectedRequest.mechanic.name}</p>
                  <p><strong>Phone:</strong> {selectedRequest.mechanic.phone}</p>
                  <p><strong>Rating:</strong> {selectedRequest.mechanic.rating || 'N/A'}</p>
                </div>
              )}

              {selectedRequest.estimated_cost && (
                <div>
                  <h4 className="font-semibold">Cost Information</h4>
                  <p><strong>Estimated Cost:</strong> GHS {selectedRequest.estimated_cost.toFixed(2)}</p>
                  {selectedRequest.actual_hours && (
                    <p><strong>Actual Hours:</strong> {selectedRequest.actual_hours} hrs</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
