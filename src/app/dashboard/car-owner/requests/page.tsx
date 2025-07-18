'use client'

import React, { useState, useEffect } from 'react'
import type { ColumnsType } from 'antd/es/table'
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
  Empty,
  Alert
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  MessageOutlined,
  CarOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Request, RequestStatus, Car } from '@/types'
import { DatabaseService } from '@/services/database'
import { FCMService } from '@/services/fcm'
import { AddressSelector } from '@/components/location/AddressSelector'
import { EnhancedLocationService } from '@/services/enhancedLocation'
import { MechanicMatchingService } from '@/services/mechanicMatching'
import type { Address } from '@/types/location'
import { SERVICE_TYPES } from '@/constants/mechanic'

const { Title, Text } = Typography
const { TextArea } = Input

// Define form values interface
interface CreateRequestFormValues {
  car_id: string
  title: string
  service_types?: string[]
  description: string
  urgency: 'low' | 'medium' | 'high'
  service_location: Address
}

export default function CarOwnerRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<Request[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [creatingRequest, setCreatingRequest] = useState(false)
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
    if (!user || !values.service_location) return

    // Validate that we have proper location coordinates
    if (!values.service_location.coordinates || 
        !EnhancedLocationService.isValidCoordinates(
          values.service_location.coordinates.lat, 
          values.service_location.coordinates.lng
        )) {
      message.error('Please select a valid service location with precise coordinates')
      return
    }

    setCreatingRequest(true)
    try {
      const selectedCar = cars.find(car => car.id === values.car_id)
      if (!selectedCar) {
        message.error('Selected car not found')
        return
      }

      // Prepare request data with enhanced location information
      const requestData = {
        car_id: values.car_id,
        title: values.title,
        description: values.description,
        urgency: values.urgency,
        location: values.service_location.formatted_address,
        location_coords: values.service_location.coordinates,
        location_data: {
          address: values.service_location,
          place_id: values.service_location.place_id,
          city: values.service_location.city,
          country: values.service_location.country
        },
        owner_id: user.id,
        status: 'pending' as RequestStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Create request in database
      const requestId = await DatabaseService.createRequest(requestData)
      
      // Find and notify nearby mechanics using enhanced location matching
      try {
        console.log('🔍 Finding nearby mechanics for service request...')
        
        const nearbyMechanics = await MechanicMatchingService.findBestMatches({
          requestLocation: values.service_location.coordinates,
          urgencyLevel: values.urgency,
          maxDistance: values.urgency === 'high' ? 50 : 30, // Larger radius for urgent requests
          maxResults: 10,
          serviceType: [values.title.toLowerCase()], // Use title as service type hint
          vehicleBrand: selectedCar.make // Include vehicle brand for better matching
        })

        console.log(`📍 Found ${nearbyMechanics.length} nearby mechanics`)

        if (nearbyMechanics.length === 0) {
          // Fallback to all available mechanics if no nearby ones found
          console.log('⚠️ No nearby mechanics found, notifying all available mechanics')
          const allMechanics = await DatabaseService.getUsersByRole('Mechanic')
          const carInfo = `${selectedCar.make} ${selectedCar.model} (${selectedCar.year})`
          
          for (const mechanic of allMechanics.slice(0, 5)) { // Limit to 5 mechanics
            await FCMService.sendRequestNotificationToMechanic(mechanic.id, {
              requestId,
              title: values.title,
              carInfo,
              urgency: values.urgency,
              location: values.service_location.formatted_address
            })
          }
        } else {
          // Send targeted notifications to nearby mechanics
          const carInfo = `${selectedCar.make} ${selectedCar.model} (${selectedCar.year})`
          
          for (const mechanicMatch of nearbyMechanics.slice(0, 5)) { // Top 5 matches
            await FCMService.sendRequestNotificationToMechanic(mechanicMatch.user.id, {
              requestId,
              title: values.title,
              carInfo,
              urgency: values.urgency,
              location: values.service_location.formatted_address
            })
            
            console.log(`📧 Notified ${mechanicMatch.user.name} (${mechanicMatch.distance.toFixed(1)}km away, score: ${mechanicMatch.compatibilityScore.toFixed(1)})`)
          }
        }

        // Notify nearby mechanics using the enhanced service
        const notifiedMechanics = await MechanicMatchingService.notifyNearbyMechanics(
          { 
            id: requestId, 
            urgency: values.urgency,
            location: values.service_location.formatted_address,
            location_coords: values.service_location.coordinates
          } as Request,
          values.service_location.coordinates,
          values.urgency === 'high' ? 50 : 30
        )

        console.log(`🎯 Successfully notified ${notifiedMechanics.length} mechanics about the service request`)
        
      } catch (notificationError) {
        console.error('Error in enhanced mechanic notification:', notificationError)
        // Don't fail the request creation if notifications fail
        message.warning('Request created successfully, but there may have been issues notifying mechanics')
      }

      message.success('Service request created and sent to nearby mechanics!')
      setModalVisible(false)
      setSelectedAddress(null)
      form.resetFields()
      // Removed fetchRequests() call - real-time subscription will handle the update
    } catch (error) {
      console.error('Error creating request:', error)
      message.error('Failed to create request')
    } finally {
      setCreatingRequest(false)
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

  const columns: ColumnsType<Request> = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      responsive: ['md' as const],
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
      responsive: ['sm' as const],
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
      responsive: ['sm' as const],
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
      responsive: ['md' as const],
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
      responsive: ['lg' as const],
      render: (cost: number) => (
        <span className="text-sm">{cost ? `GHS ${cost.toFixed(2)}` : '-'}</span>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 90,
      responsive: ['lg' as const],
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
          confirmLoading={creatingRequest}
          onOk={() => {
            if (cars.length === 0) {
              message.warning('Please add a vehicle first before creating a request')
              return
            }
            if (!selectedAddress) {
              message.warning('Please select a service location')
              return
            }
            form.submit()
          }}
          onCancel={() => {
            setModalVisible(false)
            setSelectedAddress(null)
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
              name="service_types"
              label="Service Types"
              tooltip="Select specific service types to find mechanics with matching specializations for better service quality"
            >
              <Select
                mode="multiple"
                placeholder="Select service types (optional but recommended)"
                maxTagCount={3}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {SERVICE_TYPES.map((service) => (
                  <Select.Option key={service} value={service}>
                    {service}
                  </Select.Option>
                ))}
              </Select>
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

            <Form.Item
              name="urgency"
              label="Urgency Level"
              rules={[{ required: true, message: 'Please select urgency' }]}
            >
              <Select>
                <Select.Option value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Low - Can wait (flexible scheduling)</span>
                  </div>
                </Select.Option>
                <Select.Option value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Medium - Soon as possible (within 24 hours)</span>
                  </div>
                </Select.Option>
                <Select.Option value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>High - Urgent (immediate attention)</span>
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="service_location"
              label={
                <span className="flex items-center gap-2">
                  <EnvironmentOutlined />
                  Service Location
                  <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ 
                required: true, 
                message: 'Please select a service location',
                validator: (_, value) => {
                  if (!value || !value.coordinates) {
                    return Promise.reject('Please select a valid location with coordinates')
                  }
                  return Promise.resolve()
                }
              }]}
              tooltip="Select where you need the mechanic to provide service. Use current location or search for an address."
            >
              <AddressSelector
                placeholder="Search for service location or use current location"
                showCurrentLocation={true}
                allowManualEntry={true}
                label=""
                value={selectedAddress}
                onChange={(address) => {
                  setSelectedAddress(address)
                  form.setFieldValue('service_location', address)
                }}
                className="w-full"
              />
            </Form.Item>
          </Form>
          )}
        </Modal>

        {/* View Request Modal */}
        <Modal
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <EyeOutlined className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Request Details</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedRequest && `Request #${selectedRequest.id.slice(-8)}`}
                </div>
              </div>
            </div>
          }
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={700}
          className="request-details-modal"
        >
          {selectedRequest && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Request Information */}
              <Card size="small" className="border-l-4 border-l-blue-500">
                <Title level={5} className="!mb-3 flex items-center gap-2">
                  <SettingOutlined className="text-blue-500" />
                  Request Information
                </Title>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Request ID</Text>
                    <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {selectedRequest.id}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Status</Text>
                    <div>
                      <Tag color={getStatusColor(selectedRequest.status)} className="mt-1">
                        {selectedRequest.status.replace('_', ' ').toUpperCase()}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" className="text-xs">Issue Title</Text>
                    <div className="font-semibold text-base mt-1">{selectedRequest.title}</div>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" className="text-xs">Description</Text>
                    <div className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {selectedRequest.description}
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Urgency Level</Text>
                    <div>
                      <Tag color={getUrgencyColor(selectedRequest.urgency)} className="mt-1">
                        {selectedRequest.urgency.toUpperCase()}
                      </Tag>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" className="text-xs">Created</Text>
                    <div className="text-sm mt-1">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </div>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary" className="text-xs">Service Location</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <EnvironmentOutlined className="text-blue-500" />
                      <span className="text-sm">{selectedRequest.location}</span>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Vehicle Information */}
              <Card size="small" className="border-l-4 border-l-green-500">
                <Title level={5} className="!mb-3 flex items-center gap-2">
                  <CarOutlined className="text-green-500" />
                  Vehicle Information
                </Title>
                {selectedRequest.car ? (
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">Make & Model</Text>
                      <div className="font-semibold text-base mt-1">
                        {selectedRequest.car.make} {selectedRequest.car.model}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">Year</Text>
                      <div className="font-semibold text-base mt-1">
                        {selectedRequest.car.year}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">License Plate</Text>
                      <div className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm mt-1">
                        {selectedRequest.car.license_plate || 'Not provided'}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">Color</Text>
                      <div className="text-sm mt-1">
                        {selectedRequest.car.color || 'Not specified'}
                      </div>
                    </Col>
                    {selectedRequest.car.vin && (
                      <Col span={24}>
                        <Text type="secondary" className="text-xs">VIN</Text>
                        <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1">
                          {selectedRequest.car.vin}
                        </div>
                      </Col>
                    )}
                  </Row>
                ) : (
                  // Fallback: Get car details from cars list using car_id
                  (() => {
                    const requestCar = cars.find(car => car.id === selectedRequest.car_id)
                    return requestCar ? (
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <Text type="secondary" className="text-xs">Make & Model</Text>
                          <div className="font-semibold text-base mt-1">
                            {requestCar.make} {requestCar.model}
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" className="text-xs">Year</Text>
                          <div className="font-semibold text-base mt-1">
                            {requestCar.year}
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" className="text-xs">License Plate</Text>
                          <div className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm mt-1">
                            {requestCar.license_plate || 'Not provided'}
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary" className="text-xs">Color</Text>
                          <div className="text-sm mt-1">
                            {requestCar.color || 'Not specified'}
                          </div>
                        </Col>
                        {requestCar.vin && (
                          <Col span={24}>
                            <Text type="secondary" className="text-xs">VIN</Text>
                            <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-1">
                              {requestCar.vin}
                            </div>
                          </Col>
                        )}
                      </Row>
                    ) : (
                      <Alert 
                        message="Vehicle information not available" 
                        description="Unable to load vehicle details for this request."
                        type="warning" 
                        showIcon 
                        className="text-sm"
                      />
                    )
                  })()
                )}
              </Card>

              {/* Assigned Mechanic */}
              {selectedRequest.mechanic && (
                <Card size="small" className="border-l-4 border-l-purple-500">
                  <Title level={5} className="!mb-3 flex items-center gap-2">
                    <UserOutlined className="text-purple-500" />
                    Assigned Mechanic
                  </Title>
                  <Row gutter={[16, 8]}>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">Name</Text>
                      <div className="font-semibold text-base mt-1">
                        {selectedRequest.mechanic.name}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">Phone</Text>
                      <div className="text-sm mt-1">
                        {selectedRequest.mechanic.phone}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">Rating</Text>
                      <div className="flex items-center gap-1 mt-1">
                        {selectedRequest.mechanic.rating ? (
                          <>
                            <span className="font-semibold">{selectedRequest.mechanic.rating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                          </>
                        ) : (
                          <span className="text-gray-500">Not rated</span>
                        )}
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" className="text-xs">Total Reviews</Text>
                      <div className="text-sm mt-1">
                        {selectedRequest.mechanic.total_reviews || 0} reviews
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Cost Information */}
              {(selectedRequest.estimated_cost || selectedRequest.final_cost || selectedRequest.estimated_hours || selectedRequest.actual_hours) && (
                <Card size="small" className="border-l-4 border-l-orange-500">
                  <Title level={5} className="!mb-3 flex items-center gap-2">
                    <span className="text-orange-500">GHS</span>
                    Cost & Time Information
                  </Title>
                  <Row gutter={[16, 8]}>
                    {selectedRequest.estimated_cost && (
                      <Col span={12}>
                        <Text type="secondary" className="text-xs">Estimated Cost</Text>
                        <div className="font-semibold text-lg text-green-600 mt-1">
                          GHS {selectedRequest.estimated_cost.toFixed(2)}
                        </div>
                      </Col>
                    )}
                    {selectedRequest.final_cost && (
                      <Col span={12}>
                        <Text type="secondary" className="text-xs">Final Cost</Text>
                        <div className="font-semibold text-lg text-blue-600 mt-1">
                          GHS {selectedRequest.final_cost.toFixed(2)}
                        </div>
                      </Col>
                    )}
                    {selectedRequest.estimated_hours && (
                      <Col span={12}>
                        <Text type="secondary" className="text-xs">Estimated Hours</Text>
                        <div className="text-sm mt-1">
                          {selectedRequest.estimated_hours} hours
                        </div>
                      </Col>
                    )}
                    {selectedRequest.actual_hours && (
                      <Col span={12}>
                        <Text type="secondary" className="text-xs">Actual Hours</Text>
                        <div className="text-sm mt-1">
                          {selectedRequest.actual_hours} hours
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              )}

              {/* Additional Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedRequest.mechanic && (
                  <Button 
                    type="primary" 
                    icon={<MessageOutlined />}
                    onClick={() => {
                      setViewModalVisible(false)
                      window.location.href = `/dashboard/car-owner/requests/${selectedRequest.id}/chat`
                    }}
                  >
                    Chat with Mechanic
                  </Button>
                )}
                <Button 
                  onClick={() => setViewModalVisible(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
