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
  Row,
  Col,
  Empty
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  MessageOutlined,
  CarOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Request, RequestStatus, Car } from '@/types'
import { DatabaseService } from '@/services/database'
import { FCMService } from '@/services/fcm'

const { Title, Text } = Typography
const { TextArea } = Input

// Define form values interface
interface CreateRequestFormValues {
  car_id: string
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  location: string
}

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
      fetchCars()
      fetchRequests()
    }
  }, [user])

  useEffect(() => {
    // Subscribe to real-time request updates
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToUserRequests(user.id, (updatedRequests) => {
        setRequests(updatedRequests)
        setLoading(false)
      })
      return unsubscribe
    }
  }, [user])

  useEffect(() => {
    // Subscribe to real-time car updates
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToUserCars(user.id, (updatedCars) => {
        setCars(updatedCars)
        console.log('Cars updated in real-time:', updatedCars.length, 'cars')
      })
      return unsubscribe
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userRequests = await DatabaseService.getRequestsByOwner(user.id)
      setRequests(userRequests)
      // Removed success message - loading data shouldn't show notifications
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
      const userCars = await DatabaseService.getCarsByOwner(user.id)
      setCars(userCars)
      
      // Log for debugging
      console.log('User cars loaded:', userCars.length, 'cars for user:', user.id)
    } catch (error) {
      console.error('Error fetching cars:', error)
      message.error('Failed to load cars')
      setCars([]) // Ensure cars is empty on error
    }
  }

  const handleCreateRequest = async (values: CreateRequestFormValues) => {
    if (!user) return

    try {
      const selectedCar = cars.find(car => car.id === values.car_id)
      if (!selectedCar) {
        message.error('Selected car not found')
        return
      }

      const requestData = {
        ...values,
        owner_id: user.id,
        status: 'pending' as RequestStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Create request in database
      const requestId = await DatabaseService.createRequest(requestData)
      
      // Send notifications to available mechanics
      try {
        const availableMechanics = await DatabaseService.getUsersByRole('Mechanic')
        const carInfo = `${selectedCar.make} ${selectedCar.model} (${selectedCar.year})`
        
        // Send notification to all available mechanics
        for (const mechanic of availableMechanics) {
          await FCMService.sendRequestNotificationToMechanic(mechanic.id, {
            requestId,
            title: values.title,
            carInfo,
            urgency: values.urgency,
            location: values.location
          })
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError)
        // Don't fail the request creation if notifications fail
      }

      message.success('Service request created successfully!')
      setModalVisible(false)
      form.resetFields()
      // Removed fetchRequests() call - real-time subscription will handle the update
    } catch (error) {
      console.error('Error creating request:', error)
      message.error('Failed to create request')
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await DatabaseService.deleteRequest(requestId)
      message.success('Request deleted successfully')
      // Removed fetchRequests() call - real-time subscription will handle the update
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
      width: 100,
      responsive: ['md'],
      render: (id: string) => (
        <span className="font-mono text-xs">{id.slice(-8)}</span>
      )
    },
    {
      title: 'Request Details',
      key: 'details',
      render: (record: Request) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">{record.title}</div>
          <div className="text-xs text-gray-500">
            {record.car?.make} {record.car?.model} ({record.car?.year})
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <Tag color={getStatusColor(record.status)} className="text-xs">
              {record.status.replace('_', ' ').toUpperCase()}
            </Tag>
            <Tag color={getUrgencyColor(record.urgency)} className="text-xs">
              {record.urgency.toUpperCase()}
            </Tag>
          </div>
          {record.mechanic && (
            <div className="text-xs text-blue-600 sm:hidden">
              Mechanic: {record.mechanic.name}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      responsive: ['sm'],
      render: (status: RequestStatus) => (
        <Tag color={getStatusColor(status)} className="text-xs">
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 80,
      responsive: ['sm'],
      render: (urgency: string) => (
        <Tag color={getUrgencyColor(urgency)} className="text-xs">
          {urgency.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Mechanic',
      key: 'mechanic',
      width: 120,
      responsive: ['md'],
      render: (record: Request) => (
        <div className="text-sm">
          {record.mechanic?.name || 'Not assigned'}
        </div>
      )
    },
    {
      title: 'Cost',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      width: 80,
      responsive: ['lg'],
      render: (cost: number) => (
        <span className="text-sm">{cost ? `GHS ${cost.toFixed(2)}` : '-'}</span>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 90,
      responsive: ['lg'],
      render: (date: string) => (
        <span className="text-xs">{new Date(date).toLocaleDateString()}</span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (record: Request) => (
        <div className="flex flex-col gap-1">
          <Space size="small">
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedRequest(record)
                setViewModalVisible(true)
              }}
              title="View Details"
              className="!w-8 !h-8"
            />
            
            {record.mechanic && (
              <Button
                size="small"
                type="text"
                icon={<MessageOutlined />}
                onClick={() => {
                  window.location.href = `/dashboard/car-owner/requests/${record.id}/chat`
                }}
                title="Chat with Mechanic"
                className="!w-8 !h-8 !text-blue-600"
              />
            )}
            
            {record.status === 'pending' && (
              <Button
                size="small"
                danger
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete Request',
                    content: 'Are you sure you want to delete this request? This action cannot be undone.',
                    okText: 'Yes, Delete',
                    cancelText: 'Cancel',
                    okType: 'danger',
                    onOk: () => handleDeleteRequest(record.id)
                  })
                }}
                title="Delete Request"
                className="!w-8 !h-8"
              />
            )}
          </Space>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="requests">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div>
            <Title level={2} className="!text-xl sm:!text-2xl !mb-2">My Service Requests</Title>
            <Text type="secondary" className="!text-sm sm:!text-base">Manage your car service requests</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (cars.length === 0) {
                Modal.confirm({
                  title: 'No Vehicles Found',
                  content: 'You need to add at least one vehicle before creating a service request. Would you like to add a vehicle now?',
                  okText: 'Add Vehicle',
                  cancelText: 'Cancel',
                  onOk: () => {
                    window.location.href = '/dashboard/car-owner/cars/add'
                  }
                })
                return
              }
              setModalVisible(true)
            }}
            className="!w-full sm:!w-auto"
          >
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">Create Request</span>
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false,
              responsive: true,
            }}
            scroll={{ x: 500 }}
            size="small"
            className="overflow-x-auto"
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
          onOk={() => {
            if (cars.length === 0) {
              message.warning('Please add a vehicle first before creating a request')
              return
            }
            form.submit()
          }}
          onCancel={() => {
            setModalVisible(false)
            form.resetFields()
          }}
          width={600}
          className="!mx-4"
          styles={{
            body: {
              padding: '20px 16px',
            },
          }}
        >
          {cars.length === 0 ? (
            <div className="text-center py-8">
              <CarOutlined className="text-6xl text-gray-400 mb-4" />
              <Title level={4}>No Vehicles Added</Title>
              <Text className="text-gray-600 mb-6 block">
                You need to add at least one vehicle before creating a service request.
              </Text>
              <Button 
                type="primary" 
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  setModalVisible(false)
                  window.location.href = '/dashboard/car-owner/cars/add'
                }}
              >
                Add Your First Vehicle
              </Button>
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateRequest}
            >
              <Form.Item
                name="car_id"
                label={`Select Vehicle (${cars.length} available)`}
                rules={[{ required: true, message: 'Please select a vehicle' }]}
              >
                <Select 
                  placeholder="Choose your vehicle"
                  showSearch
                  filterOption={(input, option) => {
                    if (!option || !option.children) return false
                    return String(option.children).toLowerCase().includes(input.toLowerCase())
                  }}
                >
                  {cars.map(car => (
                    <Select.Option key={car.id} value={car.id}>
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>{car.make} {car.model}</strong> ({car.year})
                        </span>
                        {car.license_plate && (
                          <span className="text-gray-500 text-sm">
                            {car.license_plate}
                          </span>
                        )}
                      </div>
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
          )}
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
