'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Modal, 
  Form, 
  InputNumber,
  message, 
  Tag,
  Row,
  Col,
  Image,
  Tabs,
  Badge,
  Typography,
  Avatar,
  Empty
} from 'antd'
import { 
  SearchOutlined, 
  ShoppingCartOutlined, 
  EyeOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Part, Transaction, Request, TransactionStatus, Diagnosis } from '@/types'

const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs

export default function MechanicPartsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [parts, setParts] = useState<Part[]>([])
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [myDiagnoses, setMyDiagnoses] = useState<Diagnosis[]>([])
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null)
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [suggestedParts, setSuggestedParts] = useState<Part[]>([])
  const [form] = Form.useForm()

  const categories = [
    'Engine', 'Brakes', 'Transmission', 'Suspension', 'Electrical', 
    'Body', 'Interior', 'Exhaust', 'Cooling', 'Fuel System'
  ]

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user?.id) {
      console.warn('No user ID available for loading parts data')
      return
    }

    setLoading(true)
    try {
      // Load parts data with proper error handling for each service
      const results = await Promise.allSettled([
        DatabaseService.getAllParts(),
        DatabaseService.getTransactionsByMechanic(user.id),
        DatabaseService.getRequestsByMechanic(user.id),
        DatabaseService.getDiagnosesByMechanic(user.id)
      ])
      
      // Handle parts data
      if (results[0].status === 'fulfilled') {
        setParts(results[0].value || [])
      } else {
        console.error('Failed to load parts:', results[0].reason)
        setParts([])
        message.warning('Some parts data could not be loaded. Please check your connection and try again.')
      }
      
      // Handle transactions data
      if (results[1].status === 'fulfilled') {
        setMyTransactions(results[1].value || [])
      } else {
        console.error('Failed to load transactions:', results[1].reason)
        setMyTransactions([])
      }
      
      // Handle requests data
      if (results[2].status === 'fulfilled') {
        const requestsData = results[2].value || []
        setMyRequests(requestsData.filter(r => ['diagnosed', 'quoted', 'approved', 'in_progress'].includes(r.status)))
      } else {
        console.error('Failed to load requests:', results[2].reason)
        setMyRequests([])
      }
      
      // Handle diagnoses data
      if (results[3].status === 'fulfilled') {
        setMyDiagnoses(results[3].value || [])
      } else {
        console.error('Failed to load diagnoses:', results[3].reason)
        setMyDiagnoses([])
      }
      
      // Check if all operations failed
      const allFailed = results.every(result => result.status === 'rejected')
      if (allFailed) {
        message.error('Unable to load parts data. Please check your internet connection and try again.')
      }
      
    } catch (error) {
      console.error('Unexpected error loading data:', error)
      message.error('An unexpected error occurred while loading parts data. Please try again.')
      // Set safe defaults
      setParts([])
      setMyTransactions([])
      setMyRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm && !selectedCategory) {
      loadData()
      return
    }

    setLoading(true)
    try {
      const searchResults = await DatabaseService.searchParts(searchTerm, selectedCategory)
      setParts(searchResults || [])
      
      if (!searchResults || searchResults.length === 0) {
        message.info('No parts found matching your search criteria. Try different keywords or categories.')
      }
    } catch (error) {
      console.error('Error searching parts:', error)
      setParts([])
      
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          message.error('You do not have permission to search parts. Please contact support.')
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          message.error('Network error while searching parts. Please check your connection and try again.')
        } else {
          message.error('Unable to search parts at this time. Please try again later.')
        }
      } else {
        message.error('Search failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get part suggestions based on diagnosis
  const getPartSuggestionsForDiagnosis = (diagnosis: Diagnosis): Part[] => {
    if (!diagnosis || !parts.length) return []
    
    const diagnosisKeywords = [
      ...(diagnosis.title || '').toLowerCase().split(' '),
      ...(diagnosis.details || '').toLowerCase().split(' '),
      diagnosis.severity || ''
    ]
    
    // Extract parts needed from diagnosis
    const partsNeeded = diagnosis.parts_needed || []
    const partsNeededKeywords = Array.isArray(partsNeeded) 
      ? partsNeeded.flatMap(part => 
          typeof part === 'string' 
            ? part.toLowerCase().split(' ')
            : (part.name || '').toLowerCase().split(' ')
        )
      : String(partsNeeded || '').toLowerCase().split(/[,\n\s]+/)
    
    const allKeywords = [...diagnosisKeywords, ...partsNeededKeywords]
    
    return parts.filter(part => {
      // Check if part name or category matches keywords
      const partText = `${part.name} ${part.category} ${part.description || ''}`.toLowerCase()
      return allKeywords.some(keyword => 
        keyword.length > 2 && partText.includes(keyword)
      )
    }).slice(0, 10) // Limit to top 10 suggestions
  }

  const handleViewDiagnosis = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis)
    const suggestions = getPartSuggestionsForDiagnosis(diagnosis)
    setSuggestedParts(suggestions)
    setDiagnosisModalVisible(true)
  }

  const handleRequestPart = async (values: any) => {
    if (!selectedPart) return

    try {
      const transactionData = {
        request_id: values.request_id,
        diagnosis_id: selectedDiagnosis?.id,
        part_id: selectedPart.id,
        dealer_id: selectedPart.dealer_id,
        mechanic_id: user!.id,
        quantity: values.quantity,
        unit_price: selectedPart.price,
        total_amount: selectedPart.price * values.quantity,
        status: 'pending' as TransactionStatus,
        notes: values.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await DatabaseService.createTransaction(transactionData)
      message.success('Part request submitted successfully!')
      
      // Send notification to dealer
      await DatabaseService.createNotification({
        user_id: selectedPart.dealer_id,
        title: 'New Parts Request',
        message: `Mechanic ${user!.name} has requested ${values.quantity}x ${selectedPart.name} for diagnosis`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        data: { 
          part_id: selectedPart.id,
          mechanic_id: user!.id,
          mechanic_name: user!.name,
          quantity: values.quantity,
          total_amount: transactionData.total_amount,
          diagnosis_id: selectedDiagnosis?.id,
          request_id: values.request_id
        }
      })

      setRequestModalVisible(false)
      form.resetFields()
      loadData()
    } catch (error) {
      console.error('Error requesting part:', error)
      message.error('Failed to request part')
    }
  }

  const getTransactionStatusColor = (status: TransactionStatus) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue',
      cancelled: 'gray'
    }
    return colors[status]
  }

  const partsColumns = [
    {
      title: 'Image',
      key: 'image',
      width: 80,
      render: (record: Part) => (
        <Image
          src={record.image_url || '/placeholder-part.jpg'}
          alt={record.name}
          width={50}
          height={50}
          style={{ objectFit: 'cover' }}
          fallback="/placeholder-part.jpg"
        />
      )
    },
    {
      title: 'Part Details',
      key: 'details',
      render: (record: Part) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-gray-500">{record.brand}</div>
          <div className="text-sm text-gray-500">Part #: {record.part_number}</div>
          <Tag color="blue">{record.category}</Tag>
        </div>
      )
    },
    {
      title: 'Compatibility',
      dataIndex: 'compatibility',
      key: 'compatibility',
      render: (compatibility: string[]) => (
        <div className="space-y-1">
          {compatibility?.slice(0, 2).map((comp, index) => (
            <Tag key={index}>{comp}</Tag>
          ))}
          {compatibility?.length > 2 && (
            <Tag>+{compatibility.length - 2} more</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="font-semibold text-green-600">${price.toFixed(2)}</span>
      )
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Badge 
          count={stock} 
          style={{ backgroundColor: stock > 10 ? '#52c41a' : stock > 0 ? '#faad14' : '#f5222d' }}
        />
      )
    },
    {
      title: 'Dealer Information',
      key: 'dealer',
      render: (record: Part) => (
        <div>
          <div className="flex items-center mb-1">
            <Avatar icon={<UserOutlined />} size="small" className="mr-2" />
            <span className="font-medium">{record.dealer?.name || 'Unknown Dealer'}</span>
          </div>
          {record.dealer?.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <PhoneOutlined className="mr-1" />
              {record.dealer.phone}
            </div>
          )}
          {record.dealer?.address && (
            <div className="flex items-center text-sm text-gray-500">
              <EnvironmentOutlined className="mr-1" />
              {record.dealer.address}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Part) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPart(record)
              setViewModalVisible(true)
            }}
          />
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              setSelectedPart(record)
              setRequestModalVisible(true)
            }}
            disabled={record.stock === 0}
          >
            Request
          </Button>
        </Space>
      )
    }
  ]

  const transactionColumns = [
    {
      title: 'Part',
      key: 'part',
      render: (record: Transaction) => (
        <div>
          <div className="font-medium">{record.part?.name}</div>
          <div className="text-sm text-gray-500">Qty: {record.quantity}</div>
        </div>
      )
    },
    {
      title: 'Request',
      key: 'request',
      render: (record: Transaction) => (
        <div>
          <div>{record.request?.title || 'N/A'}</div>
          <div className="text-sm text-gray-500">ID: {record.request_id?.slice(-8)}</div>
        </div>
      )
    },
    {
      title: 'Dealer',
      key: 'dealer',
      render: (record: Transaction) => record.dealer?.name || 'Unknown'
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TransactionStatus) => (
        <Tag color={getTransactionStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ]

  return (
    <DashboardLayout activeKey="parts">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Parts Catalog</h2>
          <p className="text-gray-600">Browse and request parts from dealers</p>
        </div>

        <Tabs defaultActiveKey="browse">
          <TabPane 
            tab={
              <span>
                <SearchOutlined />
                Browse Parts
              </span>
            } 
            key="browse"
          >
            {/* Search and Filter */}
            <Card className="mb-4">
              <Row gutter={16} align="middle">
                <Col flex="auto">
                  <Search
                    placeholder="Search parts by name, brand, or part number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    enterButton
                  />
                </Col>
                <Col>
                  <Select
                    placeholder="Category"
                    style={{ width: 150 }}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    allowClear
                  >
                    {categories.map(category => (
                      <Option key={category} value={category}>{category}</Option>
                    ))}
                  </Select>
                </Col>
                <Col>
                  <Button icon={<FilterOutlined />} onClick={handleSearch}>
                    Filter
                  </Button>
                </Col>
              </Row>
            </Card>

            <Card>
              <Table
                columns={partsColumns}
                dataSource={parts}
                rowKey="id"
                loading={loading}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} parts`
                }}
                scroll={{ x: 1000 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No parts available"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button type="primary" onClick={loadData}>
                        Refresh Parts
                      </Button>
                    </Empty>
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
                <Badge count={myTransactions.length} className="ml-2" />
              </span>
            } 
            key="requests"
          >
            <Card>
              <Table
                columns={transactionColumns}
                dataSource={myTransactions}
                rowKey="id"
                loading={loading}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`
                }}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No part requests yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <p className="text-gray-500 mt-2">Start by browsing parts and making requests</p>
                    </Empty>
                  )
                }}
              />
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <MedicineBoxOutlined />
                My Diagnoses ({myDiagnoses.length})
              </span>
            } 
            key="diagnoses"
          >
            <Card>
              <Table
                columns={[
                  {
                    title: 'Diagnosis',
                    key: 'diagnosis',
                    render: (record: Diagnosis) => (
                      <div>
                        <div className="font-medium">{record.title}</div>
                        <div className="text-sm text-gray-500">{record.details?.substring(0, 100)}...</div>
                        <Tag color={record.severity === 'critical' ? 'red' : record.severity === 'high' ? 'orange' : 'blue'}>
                          {record.severity?.toUpperCase()}
                        </Tag>
                      </div>
                    )
                  },
                  {
                    title: 'Car Information',
                    key: 'car',
                    render: (record: Diagnosis) => {
                      const request = myRequests.find(r => r.id === record.request_id)
                      return request?.car ? (
                        <div>
                          <div className="font-medium">{request.car.make} {request.car.model}</div>
                          <div className="text-sm text-gray-500">{request.car.year} • {request.car.license_plate}</div>
                        </div>
                      ) : 'No car info'
                    }
                  },
                  {
                    title: 'Parts Needed',
                    key: 'parts_needed',
                    render: (record: Diagnosis) => {
                      const partsCount = Array.isArray(record.parts_needed) 
                        ? record.parts_needed.length 
                        : String(record.parts_needed || '').split(/[,\n]+/).filter(p => p.trim()).length
                      return (
                        <Badge count={partsCount} showZero style={{ backgroundColor: '#52c41a' }} />
                      )
                    }
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (record: Diagnosis) => (
                      <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        onClick={() => handleViewDiagnosis(record)}
                      >
                        View & Select Parts
                      </Button>
                    )
                  }
                ]}
                dataSource={myDiagnoses}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No diagnoses found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* Request Part Modal */}
        <Modal
          title="Request Part"
          open={requestModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setRequestModalVisible(false)
            form.resetFields()
          }}
          width={600}
        >
          {selectedPart && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <Row gutter={16} align="middle">
                  <Col>
                    <Image
                      src={selectedPart.image_url || '/placeholder-part.jpg'}
                      alt={selectedPart.name}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover' }}
                    />
                  </Col>
                  <Col flex="auto">
                    <div className="font-medium">{selectedPart.name}</div>
                    <div className="text-sm text-gray-500">{selectedPart.brand}</div>
                    <div className="text-sm text-gray-500">Stock: {selectedPart.stock}</div>
                    <div className="font-semibold text-green-600">${selectedPart.price.toFixed(2)} each</div>
                  </Col>
                </Row>
              </div>

              <Form form={form} onFinish={handleRequestPart} layout="vertical">
                <Form.Item
                  name="request_id"
                  label="Associated Service Request"
                  rules={[{ required: true, message: 'Please select a service request' }]}
                >
                  <Select placeholder="Select service request">
                    {myRequests.map(request => (
                      <Option key={request.id} value={request.id}>
                        {request.title} - {request.car?.make} {request.car?.model}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: 'Please enter quantity' },
                    { type: 'number', min: 1, max: selectedPart.stock, message: `Max available: ${selectedPart.stock}` }
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={selectedPart.stock}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      const total = (value || 0) * selectedPart.price
                      form.setFieldsValue({ total_amount: total })
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="total_amount"
                  label="Total Amount"
                >
                  <InputNumber
                    disabled
                    formatter={value => `$ ${value}`}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="Notes (Optional)"
                >
                  <Input.TextArea rows={3} placeholder="Additional notes for the dealer..." />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* View Part Details Modal */}
        <Modal
          title="Part Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedPart && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Image
                  src={selectedPart.image_url || '/placeholder-part.jpg'}
                  alt={selectedPart.name}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover' }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedPart.name}</h3>
                  <p><strong>Brand:</strong> {selectedPart.brand}</p>
                  <p><strong>Part Number:</strong> {selectedPart.part_number}</p>
                  <p><strong>Category:</strong> <Tag color="blue">{selectedPart.category}</Tag></p>
                  <p><strong>Price:</strong> <span className="font-semibold text-green-600">${selectedPart.price.toFixed(2)}</span></p>
                  <p><strong>Stock:</strong> {selectedPart.stock} units</p>
                </div>
              </div>
              
              {selectedPart.description && (
                <div>
                  <h4 className="font-semibold">Description</h4>
                  <p>{selectedPart.description}</p>
                </div>
              )}
              
              {selectedPart.compatibility && selectedPart.compatibility.length > 0 && (
                <div>
                  <h4 className="font-semibold">Compatibility</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPart.compatibility.map((comp, index) => (
                      <Tag key={index}>{comp}</Tag>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPart.specifications && (
                <div>
                  <h4 className="font-semibold">Specifications</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedPart.specifications).map(([key, value]) => (
                      <p key={key}><strong>{key}:</strong> {String(value)}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold">Dealer Information</h4>
                <p><strong>Dealer:</strong> {selectedPart.dealer?.name}</p>
                <p><strong>Phone:</strong> {selectedPart.dealer?.phone}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Diagnosis Details and Part Selection Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <MedicineBoxOutlined className="mr-2 text-blue-600" />
              Diagnosis Details & Part Selection
            </div>
          }
          open={diagnosisModalVisible}
          onCancel={() => {
            setDiagnosisModalVisible(false)
            setSelectedDiagnosis(null)
            setSuggestedParts([])
          }}
          footer={null}
          width={1000}
        >
          {selectedDiagnosis && (
            <div className="space-y-6">
              {/* Diagnosis Information */}
              <Card title="Diagnosis Information" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <strong>Title:</strong> {selectedDiagnosis.title}
                    </div>
                    <div className="mt-2">
                      <strong>Severity:</strong> 
                      <Tag 
                        color={selectedDiagnosis.severity === 'critical' ? 'red' : selectedDiagnosis.severity === 'high' ? 'orange' : 'blue'}
                        className="ml-2"
                      >
                        {selectedDiagnosis.severity?.toUpperCase()}
                      </Tag>
                    </div>
                    <div className="mt-2">
                      <strong>Estimated Cost:</strong> GHS {selectedDiagnosis.estimated_cost?.toFixed(2) || '0.00'}
                    </div>
                  </Col>
                  <Col span={12}>
                    {(() => {
                      const request = myRequests.find(r => r.id === selectedDiagnosis.request_id)
                      return request?.car ? (
                        <div>
                          <strong>Vehicle:</strong> {request.car.make} {request.car.model} ({request.car.year})
                          <div className="text-sm text-gray-500 mt-1">
                            License: {request.car.license_plate}
                          </div>
                          <div className="text-sm text-gray-500">
                            Owner: {request.owner?.name}
                          </div>
                        </div>
                      ) : <div>No vehicle information</div>
                    })()}
                  </Col>
                </Row>
                <div className="mt-4">
                  <strong>Details:</strong>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    {selectedDiagnosis.details}
                  </div>
                </div>
              </Card>

              {/* Parts Needed */}
              <Card title="Parts Needed from Diagnosis" size="small">
                <div className="space-y-2">
                  {(() => {
                    const partsNeeded = selectedDiagnosis.parts_needed || []
                    if (Array.isArray(partsNeeded) && partsNeeded.length > 0) {
                      return partsNeeded.map((part, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{typeof part === 'string' ? part : part.name}</span>
                          {typeof part === 'object' && part.quantity && (
                            <Badge count={part.quantity} style={{ backgroundColor: '#1890ff' }} />
                          )}
                        </div>
                      ))
                    } else {
                      const stringData = String(partsNeeded || '')
                      if (stringData.trim()) {
                        return stringData.split(/[,\n]+/).map((part, index) => (
                          <div key={index} className="p-2 border rounded">
                            {part.trim()}
                          </div>
                        ))
                      } else {
                        return <div className="text-gray-500">No specific parts listed</div>
                      }
                    }
                  })()}
                </div>
              </Card>

              {/* Suggested Parts */}
              <Card title={`Suggested Parts (${suggestedParts.length} matches found)`} size="small">
                {suggestedParts.length > 0 ? (
                  <Table
                    columns={[
                      {
                        title: 'Part',
                        key: 'part',
                        render: (record: Part) => (
                          <div className="flex items-center">
                            <Image
                              src={record.image_url || '/placeholder-part.jpg'}
                              alt={record.name}
                              width={40}
                              height={40}
                              style={{ objectFit: 'cover' }}
                              fallback="/placeholder-part.jpg"
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium">{record.name}</div>
                              <div className="text-sm text-gray-500">{record.brand}</div>
                              <Tag color="blue">{record.category}</Tag>
                            </div>
                          </div>
                        )
                      },
                      {
                        title: 'Dealer',
                        key: 'dealer',
                        render: (record: Part) => (
                          <div>
                            <div className="font-medium">{record.dealer?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{record.dealer?.phone}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Price',
                        dataIndex: 'price',
                        key: 'price',
                        render: (price: number) => (
                          <span className="font-semibold text-green-600">GHS {price.toFixed(2)}</span>
                        )
                      },
                      {
                        title: 'Stock',
                        dataIndex: 'stock',
                        key: 'stock',
                        render: (stock: number) => (
                          <Badge 
                            count={stock} 
                            style={{ backgroundColor: stock > 10 ? '#52c41a' : stock > 0 ? '#faad14' : '#f5222d' }}
                          />
                        )
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        render: (record: Part) => (
                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => {
                              setSelectedPart(record)
                              setRequestModalVisible(true)
                            }}
                            disabled={record.stock === 0}
                          >
                            Request
                          </Button>
                        )
                      }
                    ]}
                    dataSource={suggestedParts}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: 300 }}
                  />
                ) : (
                  <Empty description="No matching parts found for this diagnosis" />
                )}
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
} 