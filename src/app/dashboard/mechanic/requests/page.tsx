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
  Tabs, 
  Badge,
  Row,
  Col,
  Switch,
  InputNumber,
  TimePicker,
  Checkbox,
  Slider,
  Divider,
  Typography,
  Avatar,
  Spin
} from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  ToolOutlined,
  CarOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  UserOutlined,
  SaveOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Request, RequestStatus, MechanicAvailability } from '@/types'
import dayjs from 'dayjs'

const { TextArea } = Input
const { TabPane } = Tabs
const { Title, Text } = Typography
const { Option } = Select

export default function MechanicRequestsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [availableRequests, setAvailableRequests] = useState<Request[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [claimModalVisible, setClaimModalVisible] = useState(false)
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false)
  const [mechanicAvailability, setMechanicAvailability] = useState<MechanicAvailability | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [form] = Form.useForm()
  const [availabilityForm] = Form.useForm()

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [available, myActiveRequests, availability] = await Promise.all([
        DatabaseService.getAvailableRequests(),
        DatabaseService.getRequestsByMechanic(user!.id),
        DatabaseService.getMechanicAvailability(user!.id)
      ])
      
      setAvailableRequests(available)
      setMyRequests(myActiveRequests)
      setMechanicAvailability(availability)
      
      if (availability) {
        availabilityForm.setFieldsValue({
          is_available: availability.is_available,
          max_concurrent_jobs: availability.max_concurrent_jobs,
          service_radius: availability.service_radius,
          base_location_address: availability.base_location.address,
          specializations: availability.specializations,
          hourly_rate: availability.hourly_rate,
          emergency_service: availability.emergency_service,
          working_hours_start: dayjs(availability.working_hours.start, 'HH:mm'),
          working_hours_end: dayjs(availability.working_hours.end, 'HH:mm'),
          working_days: availability.working_hours.days
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (isAvailable: boolean) => {
    try {
      await DatabaseService.updateMechanicAvailabilityStatus(user!.id, isAvailable)
      setMechanicAvailability(prev => prev ? { ...prev, is_available: isAvailable } : null)
      message.success(`Availability ${isAvailable ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error updating availability:', error)
      message.error('Failed to update availability')
    }
  }

  const handleSaveAvailability = async (values: any) => {
    setAvailabilityLoading(true)
    try {
      const availabilityData = {
        mechanic_id: user!.id,
        is_available: values.is_available,
        max_concurrent_jobs: values.max_concurrent_jobs,
        service_radius: values.service_radius,
        base_location: {
          address: values.base_location_address,
          lat: 0, // In real app, would use geocoding API
          lng: 0
        },
        specializations: values.specializations || [],
        hourly_rate: values.hourly_rate,
        emergency_service: values.emergency_service,
        working_hours: {
          start: values.working_hours_start.format('HH:mm'),
          end: values.working_hours_end.format('HH:mm'),
          days: values.working_days || []
        }
      }

      const availabilityDataWithActiveJobs = {
        ...availabilityData,
        current_active_jobs: mechanicAvailability?.current_active_jobs || 0
      }

      await DatabaseService.createOrUpdateMechanicAvailability(availabilityDataWithActiveJobs)
      setMechanicAvailability({ ...mechanicAvailability, ...availabilityDataWithActiveJobs } as MechanicAvailability)
      setAvailabilityModalVisible(false)
      message.success('Availability settings updated successfully!')
    } catch (error) {
      console.error('Error saving availability:', error)
      message.error('Failed to save availability settings')
    } finally {
      setAvailabilityLoading(false)
    }
  }

  const handleClaimRequest = async (requestId: string) => {
    try {
      await DatabaseService.claimRequest(requestId, user!.id)
      message.success('Request claimed successfully!')
      setClaimModalVisible(false)
      loadData()
      
      // Send notification to car owner
      const request = availableRequests.find(r => r.id === requestId)
      if (request) {
        await DatabaseService.createNotification({
          user_id: request.owner_id,
          title: 'Request Claimed',
          message: `Your service request "${request.title}" has been claimed by a mechanic`,
          type: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          data: { request_id: requestId, mechanic_name: user!.name }
        })
      }
    } catch (error) {
      console.error('Error claiming request:', error)
      message.error('Failed to claim request')
    }
  }

  const handleUpdateStatus = async (values: any) => {
    if (!selectedRequest) return
    
    try {
      const updateData: any = { 
        status: values.status as RequestStatus,
        actual_hours: values.actual_hours ? parseFloat(values.actual_hours) : undefined
      }
      
      // Add estimated cost if provided
      if (values.estimated_cost) {
        updateData.estimated_cost = parseFloat(values.estimated_cost)
      }
      
      await DatabaseService.updateRequest(
        selectedRequest.id, 
        updateData,
        user!.id
      )
      
      message.success('Request updated successfully!')
      setUpdateModalVisible(false)
      form.resetFields()
      loadData()
      
      // Send notification to car owner
      await DatabaseService.createNotification({
        user_id: selectedRequest.owner_id,
        title: 'Request Status Updated',
        message: `Your service request status has been updated to: ${values.status}`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        data: { request_id: selectedRequest.id, status: values.status }
      })
    } catch (error) {
      console.error('Error updating request:', error)
      message.error('Failed to update request')
    }
  }

  const getStatusColor = (status: RequestStatus) => {
    const colors = {
      'pending': 'blue',
      'claimed': 'orange',
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

  const availableColumns = [
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
      title: 'Owner',
      key: 'owner',
      render: (record: Request) => record.owner?.name || 'Unknown'
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
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
          <Button
            type="primary"
            icon={<ToolOutlined />}
            onClick={() => {
              setSelectedRequest(record)
              setClaimModalVisible(true)
            }}
          >
            Claim
          </Button>
        </Space>
      )
    }
  ]

  const myRequestsColumns = [
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
      title: 'Progress',
      key: 'progress',
      render: (record: Request) => {
        const statusOrder = ['claimed', 'diagnosed', 'quoted', 'approved', 'in_progress', 'completed']
        const currentIndex = statusOrder.indexOf(record.status)
        const progress = currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0
        return <div className="w-20 bg-gray-200 rounded h-2"><div className="bg-blue-500 h-2 rounded" style={{width: `${progress}%`}}></div></div>
      }
    },
    {
      title: 'Est. Cost',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      render: (cost: number) => cost ? `GHS ${cost.toFixed(2)}` : '-'
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
          <Button
            icon={<ToolOutlined />}
            onClick={() => {
              setSelectedRequest(record)
              setUpdateModalVisible(true)
            }}
          >
            Update
          </Button>
        </Space>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="requests">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2}>Service Requests</Title>
            <Text type="secondary">Manage available and claimed service requests</Text>
          </div>
          
          <Space>
            <div className="flex items-center gap-3">
              <Text>Available:</Text>
              <Switch
                checked={mechanicAvailability?.is_available || false}
                onChange={handleToggleAvailability}
                checkedChildren="ON"
                unCheckedChildren="OFF"
                loading={loading}
              />
            </div>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setAvailabilityModalVisible(true)}
            >
              Availability Settings
            </Button>
          </Space>
        </div>

        {mechanicAvailability && (
          <Card size="small">
            <Row gutter={16} align="middle">
              <Col span={6}>
                <div className="text-center">
                  <div className="text-lg font-semibold">GHS {mechanicAvailability.hourly_rate}/hr</div>
                  <Text type="secondary">Hourly Rate</Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-lg font-semibold">{mechanicAvailability.service_radius}km</div>
                  <Text type="secondary">Service Range</Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {mechanicAvailability.current_active_jobs || 0}/{mechanicAvailability.max_concurrent_jobs}
                  </div>
                  <Text type="secondary">Active Jobs</Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {mechanicAvailability.emergency_service ? 'Yes' : 'No'}
                  </div>
                  <Text type="secondary">Emergency Service</Text>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        <Tabs defaultActiveKey="available">
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Available Requests
                <Badge count={availableRequests.length} className="ml-2" />
              </span>
            } 
            key="available"
          >
            <Card>
              <Table
                columns={availableColumns}
                dataSource={availableRequests}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
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
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* Availability Settings Modal */}
        <Modal
          title="Availability Settings"
          open={availabilityModalVisible}
          onCancel={() => setAvailabilityModalVisible(false)}
          footer={null}
          width={700}
        >
          <Form
            form={availabilityForm}
            layout="vertical"
            onFinish={handleSaveAvailability}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="is_available" label="Currently Available" valuePropName="checked">
                  <Switch checkedChildren="Available" unCheckedChildren="Unavailable" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="emergency_service" label="Emergency Service" valuePropName="checked">
                  <Switch checkedChildren="Offer" unCheckedChildren="No" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="max_concurrent_jobs" 
                  label="Maximum Concurrent Jobs"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                              <Form.Item 
                name="hourly_rate" 
                label="Hourly Rate (GHS)"
                rules={[{ required: true }]}
              >
                <InputNumber min={20} max={500} style={{ width: '100%' }} />
              </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="service_radius" 
              label={`Service Radius (km)`}
              rules={[{ required: true }]}
            >
              <Slider 
                min={5} 
                max={100} 
                marks={{ 5: '5km', 25: '25km', 50: '50km', 100: '100km' }}
              />
            </Form.Item>

            <Form.Item 
              name="base_location_address" 
              label="Base Location"
              rules={[{ required: true, message: 'Please enter your base location' }]}
            >
              <Input placeholder="Enter your main service location" prefix={<EnvironmentOutlined />} />
            </Form.Item>

            <Form.Item 
              name="specializations" 
              label="Specializations"
            >
              <Select
                mode="tags"
                placeholder="Enter your specializations (car makes, service types, etc.)"
                style={{ width: '100%' }}
              >
                <Option value="Toyota">Toyota</Option>
                <Option value="Honda">Honda</Option>
                <Option value="Ford">Ford</Option>
                <Option value="BMW">BMW</Option>
                <Option value="Mercedes">Mercedes</Option>
                <Option value="Engine Repair">Engine Repair</Option>
                <Option value="Brake Service">Brake Service</Option>
                <Option value="Oil Change">Oil Change</Option>
                <Option value="Transmission">Transmission</Option>
                <Option value="Electronics">Electronics</Option>
              </Select>
            </Form.Item>

            <Divider>Working Hours</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="working_hours_start" 
                  label="Start Time"
                  rules={[{ required: true }]}
                >
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="working_hours_end" 
                  label="End Time"
                  rules={[{ required: true }]}
                >
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="working_days" label="Working Days">
              <Checkbox.Group>
                <Row>
                  <Col span={8}><Checkbox value={0}>Sunday</Checkbox></Col>
                  <Col span={8}><Checkbox value={1}>Monday</Checkbox></Col>
                  <Col span={8}><Checkbox value={2}>Tuesday</Checkbox></Col>
                  <Col span={8}><Checkbox value={3}>Wednesday</Checkbox></Col>
                  <Col span={8}><Checkbox value={4}>Thursday</Checkbox></Col>
                  <Col span={8}><Checkbox value={5}>Friday</Checkbox></Col>
                  <Col span={8}><Checkbox value={6}>Saturday</Checkbox></Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={availabilityLoading}
                  icon={<SaveOutlined />}
                >
                  Save Settings
                </Button>
                <Button onClick={() => setAvailabilityModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
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
              </div>
              
              <div>
                <h4 className="font-semibold">Vehicle Information</h4>
                <p><strong>Make/Model:</strong> {selectedRequest.car?.make} {selectedRequest.car?.model}</p>
                <p><strong>Year:</strong> {selectedRequest.car?.year}</p>
                <p><strong>License Plate:</strong> {selectedRequest.car?.license_plate || 'N/A'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Owner Information</h4>
                <p><strong>Name:</strong> {selectedRequest.owner?.name}</p>
                <p><strong>Phone:</strong> {selectedRequest.owner?.phone}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Claim Request Modal */}
        <Modal
          title="Claim Request"
          open={claimModalVisible}
          onOk={() => selectedRequest && handleClaimRequest(selectedRequest.id)}
          onCancel={() => setClaimModalVisible(false)}
        >
          <p>Are you sure you want to claim this service request?</p>
          {selectedRequest && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p><strong>Title:</strong> {selectedRequest.title}</p>
              <p><strong>Vehicle:</strong> {selectedRequest.car?.make} {selectedRequest.car?.model}</p>
              <p><strong>Owner:</strong> {selectedRequest.owner?.name}</p>
            </div>
          )}
        </Modal>

        {/* Update Status Modal */}
        <Modal
          title="Update Request Status"
          open={updateModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setUpdateModalVisible(false)
            form.resetFields()
          }}
        >
          <Form form={form} onFinish={handleUpdateStatus} layout="vertical">
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select>
                <Select.Option value="claimed">Claimed</Select.Option>
                <Select.Option value="diagnosed">Diagnosed</Select.Option>
                <Select.Option value="quoted">Quoted</Select.Option>
                <Select.Option value="in_progress">In Progress</Select.Option>
                <Select.Option value="parts_requested">Parts Requested</Select.Option>
                <Select.Option value="parts_received">Parts Received</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="estimated_cost"
              label="Estimated Cost (GHS)"
              help="Provide cost estimate for the work"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="0.00"
                addonBefore="GHS"
              />
            </Form.Item>
            
            <Form.Item
              name="actual_hours"
              label="Actual Hours (if completed)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.5}
                placeholder="0.0"
                suffix="hrs"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 