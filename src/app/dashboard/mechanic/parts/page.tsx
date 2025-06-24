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
  Badge
} from 'antd'
import { 
  SearchOutlined, 
  ShoppingCartOutlined, 
  EyeOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Part, Transaction, Request, TransactionStatus } from '@/types'

const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs

export default function MechanicPartsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [parts, setParts] = useState<Part[]>([])
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
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
    setLoading(true)
    try {
      const [partsData, transactionsData, requestsData] = await Promise.all([
        DatabaseService.getAllParts(),
        DatabaseService.getTransactionsByMechanic(user!.id),
        DatabaseService.getRequestsByMechanic(user!.id)
      ])
      
      setParts(partsData)
      setMyTransactions(transactionsData)
      setMyRequests(requestsData.filter(r => ['diagnosed', 'quoted', 'approved', 'in_progress'].includes(r.status)))
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('Failed to load parts data')
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
      setParts(searchResults)
    } catch (error) {
      console.error('Error searching parts:', error)
      message.error('Failed to search parts')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPart = async (values: any) => {
    if (!selectedPart) return

    try {
      const transactionData = {
        request_id: values.request_id,
        part_id: selectedPart.id,
        dealer_id: selectedPart.dealer_id,
        mechanic_id: user!.id,
        quantity: values.quantity,
        unit_price: selectedPart.price,
        total_amount: selectedPart.price * values.quantity,
        status: 'pending' as TransactionStatus,
        notes: values.notes
      }

      await DatabaseService.createTransaction(transactionData)
      message.success('Part request submitted successfully!')
      
      // Send notification to dealer
      await DatabaseService.createNotification({
        user_id: selectedPart.dealer_id,
        title: 'New Parts Request',
        message: `A mechanic has requested ${values.quantity}x ${selectedPart.name}`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        data: { 
          part_id: selectedPart.id,
          mechanic_name: user!.name,
          quantity: values.quantity,
          total_amount: transactionData.total_amount
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
      title: 'Dealer',
      key: 'dealer',
      render: (record: Part) => record.dealer?.name || 'Unknown'
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
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
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
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
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
      </div>
    </DashboardLayout>
  )
} 