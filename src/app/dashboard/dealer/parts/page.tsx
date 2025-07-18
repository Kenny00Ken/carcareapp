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
  InputNumber,
  Switch,
  Row,
  App,
  Col,
  Typography,
  Alert,
  Badge,
  Tooltip,
  Image,
  Empty,
  Tabs,
  Descriptions,
  Statistic,
  Divider,
  AutoComplete
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ShopOutlined,
  DollarOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  ReloadOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ImageUpload } from '@/components/common/ImageUpload'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Part } from '@/types'
import { 
  findPartsByKeyword, 
  getBestMatch, 
  getCategoryForPart, 
  getCompatibilityForPart,
  getCommonBrandsForPart,
  getDescriptionForPart 
} from '@/data/parts-database'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

interface PartFormValues {
  name: string
  description: string
  category: string
  brand: string
  part_number: string
  compatibility: string[]
  price: number
  stock: number
  min_stock_threshold: number
  is_active: boolean
  specifications: Record<string, string>
  image_url?: string
}

export default function DealerPartsPage() {
  const { user } = useAuth()
  const { message } = App.useApp()
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [partSuggestions, setPartSuggestions] = useState<string[]>([])
  const [suggestedBrands, setSuggestedBrands] = useState<string[]>([])
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [partNameValue, setPartNameValue] = useState('')

  const categories = [
    'Engine', 'Brakes', 'Transmission', 'Suspension', 'Electrical', 
    'Body', 'Interior', 'Exhaust', 'Cooling', 'Fuel System',
    'Steering', 'Tires & Wheels', 'Lighting', 'Filters', 'Belts & Hoses'
  ]

  const carMakes = [
    'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mercedes-Benz',
    'BMW', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet', 'Mazda',
    'Subaru', 'Mitsubishi', 'Peugeot', 'Renault', 'Daewoo'
  ]

  // Smart auto-fill function
  const handlePartNameChange = (value: string) => {
    setPartNameValue(value)
    form.setFieldsValue({ name: value })
    
    if (!value || value.length < 2) {
      setPartSuggestions([])
      setSuggestedBrands([])
      return
    }

    // Get part suggestions
    const suggestions = findPartsByKeyword(value)
      .slice(0, 8)
      .map(part => part.name)
    setPartSuggestions(suggestions)

    // Auto-fill other fields if we have a good match
    const bestMatch = getBestMatch(value)
    if (bestMatch && value.length > 3) {
      setIsAutoFilling(true)
      
      // Auto-fill category if not already set
      const currentCategory = form.getFieldValue('category')
      if (!currentCategory && bestMatch.category) {
        form.setFieldsValue({ category: bestMatch.category })
      }

      // Auto-fill compatibility if not already set
      const currentCompatibility = form.getFieldValue('compatibility')
      if ((!currentCompatibility || currentCompatibility.length === 0) && bestMatch.compatibility.length > 0) {
        form.setFieldsValue({ compatibility: bestMatch.compatibility })
      }

      // Set suggested brands
      setSuggestedBrands(bestMatch.commonBrands)

      // Auto-fill description if empty
      const currentDescription = form.getFieldValue('description')
      if (!currentDescription && bestMatch.description) {
        form.setFieldsValue({ description: bestMatch.description })
      }

      setTimeout(() => setIsAutoFilling(false), 500)
    }
  }

  // Handle part name selection from dropdown
  const handlePartNameSelect = (value: string) => {
    setPartNameValue(value)
    const bestMatch = getBestMatch(value)
    if (bestMatch) {
      setIsAutoFilling(true)
      
      form.setFieldsValue({
        name: value,
        category: bestMatch.category,
        compatibility: bestMatch.compatibility,
        description: bestMatch.description || form.getFieldValue('description')
      })
      
      setSuggestedBrands(bestMatch.commonBrands)
      setTimeout(() => setIsAutoFilling(false), 500)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadParts()
    }
  }, [user])

  const loadParts = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const dealerParts = await DatabaseService.getPartsByDealer(user.id)
      setParts(dealerParts || [])
    } catch (error) {
      console.error('Error loading parts:', error)
      message.error('Failed to load parts inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: PartFormValues) => {
    if (!user?.id) return

    try {
      setSubmitting(true)

      const partData = {
        ...values,
        dealer_id: user.id,
        compatibility: values.compatibility || [],
        specifications: values.specifications || {},
        created_at: isEditing ? selectedPart?.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (isEditing && selectedPart) {
        await DatabaseService.updatePart(selectedPart.id, partData)
        message.success('Part updated successfully!')
      } else {
        await DatabaseService.createPart(partData)
        message.success('Part added to inventory successfully!')
      }

      setModalVisible(false)
      form.resetFields()
      setIsEditing(false)
      setSelectedPart(null)
      loadParts()
    } catch (error) {
      console.error('Error saving part:', error)
      message.error('Failed to save part')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (part: Part) => {
    setSelectedPart(part)
    setIsEditing(true)
    setPartNameValue(part.name)
    form.setFieldsValue({
      ...part,
      specifications: part.specifications || {}
    })
    setModalVisible(true)
  }

  const handleDelete = async (partId: string) => {
    try {
      await DatabaseService.deletePart(partId)
      message.success('Part deleted successfully')
      loadParts()
    } catch (error) {
      console.error('Error deleting part:', error)
      message.error('Failed to delete part')
    }
  }

  const handleView = (part: Part) => {
    setSelectedPart(part)
    setViewModalVisible(true)
  }

  const getStockStatus = (stock: number, minThreshold: number = 5) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock' }
    if (stock <= minThreshold) return { color: 'orange', text: 'Low Stock' }
    return { color: 'green', text: 'In Stock' }
  }

  const columns = [
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
          <div className="text-sm text-gray-500">#{record.part_number}</div>
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
        <span className="font-semibold text-green-600">GHS {price.toFixed(2)}</span>
      )
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (record: Part) => {
        const status = getStockStatus(record.stock, record.min_stock_threshold)
        return (
          <div>
            <Badge 
              count={record.stock} 
              style={{ backgroundColor: status.color === 'green' ? '#52c41a' : status.color === 'orange' ? '#faad14' : '#f5222d' }}
            />
            <div className="text-xs mt-1">
              <Tag color={status.color}>{status.text}</Tag>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: Part) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Part">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Part">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Part',
                  content: 'Are you sure you want to delete this part? This action cannot be undone.',
                  okText: 'Yes, Delete',
                  cancelText: 'Cancel',
                  okType: 'danger',
                  onOk: () => handleDelete(record.id)
                })
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  // Statistics
  const totalParts = parts.length
  const activeParts = parts.filter(p => p.is_active).length
  const lowStockParts = parts.filter(p => p.stock <= (p.min_stock_threshold || 5)).length
  const outOfStockParts = parts.filter(p => p.stock === 0).length
  const totalValue = parts.reduce((sum, part) => sum + (part.price * part.stock), 0)

  return (
    <DashboardLayout activeKey="parts">
      <App>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <Title level={2} className="!mb-2 flex items-center">
              <ShopOutlined className="mr-3 text-blue-600" />
              Parts Inventory Management
            </Title>
            <Text type="secondary" className="text-lg">
              Manage your parts inventory and make them available to mechanics
            </Text>
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadParts}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEditing(false)
                setSelectedPart(null)
                form.resetFields()
                setPartSuggestions([])
                setSuggestedBrands([])
                setPartNameValue('')
                setModalVisible(true)
              }}
              className="shadow-lg"
            >
              Add New Part
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Total Parts" 
                value={totalParts} 
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Active Parts" 
                value={activeParts} 
                prefix={<ShopOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Low Stock Alerts" 
                value={lowStockParts} 
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="Inventory Value" 
                value={totalValue}
                precision={2}
                prefix="GHS "
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Alerts */}
        {outOfStockParts > 0 && (
          <Alert
            message={`${outOfStockParts} part(s) are out of stock`}
            description="These parts are not available for mechanic requests. Please restock them."
            type="error"
            showIcon
            closable
          />
        )}

        {lowStockParts > 0 && (
          <Alert
            message={`${lowStockParts} part(s) have low stock`}
            description="Consider restocking these parts soon to avoid running out."
            type="warning"
            showIcon
            closable
          />
        )}

        {/* Main Table */}
        <Card className="shadow-lg">
          <Table
            columns={columns}
            dataSource={parts}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} parts`
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No parts in inventory yet"
                >
                  <Button type="primary" onClick={() => setModalVisible(true)}>
                    Add Your First Part
                  </Button>
                </Empty>
              )
            }}
          />
        </Card>

        {/* Add/Edit Part Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <ShopOutlined className="mr-2 text-blue-600" />
              {isEditing ? 'Edit Part' : 'Add New Part'}
            </div>
          }
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false)
            form.resetFields()
            setIsEditing(false)
            setSelectedPart(null)
            setPartSuggestions([])
            setSuggestedBrands([])
            setPartNameValue('')
            setIsAutoFilling(false)
          }}
          width={900}
          okText={isEditing ? 'Update Part' : 'Add Part'}
          confirmLoading={submitting}
          destroyOnHidden
        >
          <Form 
            form={form} 
            onFinish={handleSubmit} 
            layout="vertical" 
            className="mt-4"
            initialValues={{
              is_active: true,
              min_stock_threshold: 5,
              stock: 0,
              price: 0
            }}
          >
            <Alert
              message="💡 Smart Part Entry System"
              description="Start typing a part name and we'll automatically suggest category, compatibility, and other details to make entry faster and more accurate."
              type="info"
              showIcon
              className="mb-6"
            />

            {isAutoFilling && (
              <Alert
                message="🎯 Auto-filling form fields..."
                description="We've found matching part information and are filling in the details for you."
                type="success"
                showIcon
                className="mb-4"
                closable
              />
            )}

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label={
                    <span className="font-semibold">
                      Part Name
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please enter part name' }]}
                >
                  <AutoComplete
                    size="large"
                    placeholder="Start typing part name (e.g., Brake Pads, Oil Filter)"
                    value={partNameValue}
                    onChange={handlePartNameChange}
                    onSelect={handlePartNameSelect}
                    allowClear
                    className="w-full"
                    options={partSuggestions.map(suggestion => ({
                      key: suggestion,
                      value: suggestion,
                      label: (
                        <div className="flex items-center justify-between py-2">
                          <span className="font-medium">{suggestion}</span>
                          <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                            {getCategoryForPart(suggestion)}
                          </span>
                        </div>
                      )
                    }))}
                    filterOption={false}
                    notFoundContent={
                      partNameValue && partNameValue.length > 2 ? (
                        <div className="text-center py-4 text-gray-500">
                          <div>No matching parts found</div>
                          <div className="text-xs">Continue typing to create a custom part</div>
                        </div>
                      ) : null
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label={
                    <span className="font-semibold">
                      Category
                      <span className="text-red-500 ml-1">*</span>
                      {isAutoFilling && <span className="text-green-500 ml-2">✓ Auto-filled</span>}
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select category' }]}
                >
                  <Select 
                    size="large" 
                    placeholder="Select category (auto-filled based on part name)"
                    className="w-full"
                    showSearch
                    optionFilterProp="children"
                  >
                    {categories.map(category => (
                      <Option key={category} value={category}>
                        <div className="flex items-center">
                          <span className="font-medium">{category}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="brand"
                  label={
                    <span className="font-semibold">
                      Brand
                      <span className="text-red-500 ml-1">*</span>
                      {suggestedBrands.length > 0 && (
                        <Text type="secondary" className="ml-2 text-xs">
                          (Popular: {suggestedBrands.slice(0, 3).join(', ')})
                        </Text>
                      )}
                    </span>
                  }
                  rules={[{ required: true, message: 'Please enter brand' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select or type brand name"
                    size="large"
                    allowClear
                    className="w-full"
                    filterOption={(input, option) =>
                      String(option?.children || '')?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {/* Show suggested brands first */}
                    {suggestedBrands.map(brand => (
                      <Option key={`suggested-${brand}`} value={brand}>
                        <div className="flex items-center">
                          <span className="text-green-600 font-medium">⭐ {brand}</span>
                          <Text type="secondary" className="ml-2 text-xs">(Recommended)</Text>
                        </div>
                      </Option>
                    ))}
                    {/* Common brands */}
                    <Option value="Bosch">
                      <div className="flex items-center">
                        <span className="font-medium">Bosch</span>
                      </div>
                    </Option>
                    <Option value="NGK">
                      <div className="flex items-center">
                        <span className="font-medium">NGK</span>
                      </div>
                    </Option>
                    <Option value="Denso">
                      <div className="flex items-center">
                        <span className="font-medium">Denso</span>
                      </div>
                    </Option>
                    <Option value="Brembo">
                      <div className="flex items-center">
                        <span className="font-medium">Brembo</span>
                      </div>
                    </Option>
                    <Option value="Monroe">
                      <div className="flex items-center">
                        <span className="font-medium">Monroe</span>
                      </div>
                    </Option>
                    <Option value="Gates">
                      <div className="flex items-center">
                        <span className="font-medium">Gates</span>
                      </div>
                    </Option>
                    <Option value="Fram">
                      <div className="flex items-center">
                        <span className="font-medium">Fram</span>
                      </div>
                    </Option>
                    <Option value="K&N">
                      <div className="flex items-center">
                        <span className="font-medium">K&N</span>
                      </div>
                    </Option>
                    <Option value="Bilstein">
                      <div className="flex items-center">
                        <span className="font-medium">Bilstein</span>
                      </div>
                    </Option>
                    <Option value="ATE">
                      <div className="flex items-center">
                        <span className="font-medium">ATE</span>
                      </div>
                    </Option>
                    <Option value="Sachs">
                      <div className="flex items-center">
                        <span className="font-medium">Sachs</span>
                      </div>
                    </Option>
                    <Option value="Febi">
                      <div className="flex items-center">
                        <span className="font-medium">Febi</span>
                      </div>
                    </Option>
                    <Option value="Lemförder">
                      <div className="flex items-center">
                        <span className="font-medium">Lemförder</span>
                      </div>
                    </Option>
                    <Option value="TRW">
                      <div className="flex items-center">
                        <span className="font-medium">TRW</span>
                      </div>
                    </Option>
                    <Option value="Valeo">
                      <div className="flex items-center">
                        <span className="font-medium">Valeo</span>
                      </div>
                    </Option>
                    <Option value="OEM">
                      <div className="flex items-center">
                        <span className="font-medium">OEM</span>
                      </div>
                    </Option>
                    <Option value="Aftermarket">
                      <div className="flex items-center">
                        <span className="font-medium">Aftermarket</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="part_number"
                  label={
                    <span className="font-semibold">
                      Part Number
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please enter part number' }]}
                >
                  <Input 
                    placeholder="Manufacturer part number (e.g., BP-2024-001)"
                    size="large"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label={
                <span className="font-semibold">
                  Description
                  <span className="text-red-500 ml-1">*</span>
                  {isAutoFilling && <span className="text-green-500 ml-2">✓ Auto-filled</span>}
                </span>
              }
              rules={[{ required: true, message: 'Please provide description' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Detailed description of the part, its function, and specifications (auto-filled based on part name)"
                showCount
                maxLength={500}
                className="w-full"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="compatibility"
              label={
                <span className="font-semibold">
                  Vehicle Compatibility
                  <span className="text-red-500 ml-1">*</span>
                  {isAutoFilling && <span className="text-green-500 ml-2">✓ Auto-filled</span>}
                </span>
              }
              rules={[{ required: true, message: 'Please select compatible vehicles' }]}
            >
              <Select
                mode="multiple"
                size="large"
                placeholder="Select compatible car makes/models (auto-filled based on part name)"
                optionLabelProp="label"
                maxTagCount="responsive"
                className="w-full"
                showSearch
                filterOption={(input, option) =>
                  String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {carMakes.map(make => (
                  <Option key={make} value={make} label={make}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{make}</span>
                      {getCompatibilityForPart(form.getFieldValue('name') || '').includes(make) && (
                        <Text type="secondary" className="text-xs bg-green-50 px-2 py-1 rounded">
                          Recommended
                        </Text>
                      )}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  name="price"
                  label={
                    <span className="font-semibold">
                      Price (GHS)
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber 
                    min={0} 
                    step={0.01} 
                    style={{ width: '100%' }}
                    size="large"
                    prefix={<DollarOutlined />}
                    placeholder="0.00"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="stock"
                  label={
                    <span className="font-semibold">
                      Current Stock
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please enter stock quantity' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="0"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="min_stock_threshold"
                  label={
                    <span className="font-semibold">
                      Low Stock Alert
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please set minimum threshold' }]}
                >
                  <InputNumber 
                    min={0} 
                    style={{ width: '100%' }}
                    size="large"
                    placeholder="5"
                    className="w-full"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="image_url"
                  label={
                    <span className="font-semibold">
                      Part Image
                      <Text type="secondary" className="ml-2 text-xs">(Optional)</Text>
                    </span>
                  }
                >
                  <ImageUpload
                    folder="parts"
                    buttonText="Upload Part Image"
                    onChange={(url) => form.setFieldsValue({ image_url: url })}
                    value={form.getFieldValue('image_url')}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="is_active"
                  label={
                    <span className="font-semibold">
                      Status
                    </span>
                  }
                  valuePropName="checked"
                >
                  <div className="flex items-center space-x-4">
                    <Switch 
                      checkedChildren="Active" 
                      unCheckedChildren="Inactive"
                      size="default"
                    />
                    <Text type="secondary" className="text-sm">
                      Active parts are visible to mechanics
                    </Text>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* View Part Details Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <EyeOutlined className="mr-2 text-blue-600" />
              Part Details
            </div>
          }
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="edit" 
              type="primary" 
              onClick={() => {
                setViewModalVisible(false)
                if (selectedPart) handleEdit(selectedPart)
              }}
            >
              Edit Part
            </Button>
          ]}
          width={700}
        >
          {selectedPart && (
            <div className="space-y-6">
              <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Part Name" span={2}>
                  <Text strong>{selectedPart.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  <Tag color="blue">{selectedPart.category}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Brand">
                  {selectedPart.brand}
                </Descriptions.Item>
                <Descriptions.Item label="Part Number">
                  <Text code>{selectedPart.part_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedPart.is_active ? 'green' : 'red'}>
                    {selectedPart.is_active ? 'Active' : 'Inactive'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <div>
                <Title level={4}>Description</Title>
                <Card>
                  <Text>{selectedPart.description}</Text>
                </Card>
              </div>

              {selectedPart.image_url && (
                <div>
                  <Title level={4}>Image</Title>
                  <Image
                    src={selectedPart.image_url}
                    alt={selectedPart.name}
                    width={200}
                    height={150}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}

              <Descriptions title="Inventory & Pricing" bordered column={2}>
                <Descriptions.Item label="Price">
                  <Text strong className="text-green-600">
                    GHS {selectedPart.price.toFixed(2)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Current Stock">
                  <Badge 
                    count={selectedPart.stock} 
                    style={{ 
                      backgroundColor: getStockStatus(selectedPart.stock, selectedPart.min_stock_threshold).color === 'green' ? '#52c41a' : '#faad14'
                    }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Low Stock Alert">
                  {selectedPart.min_stock_threshold || 5} units
                </Descriptions.Item>
                <Descriptions.Item label="Stock Status">
                  <Tag color={getStockStatus(selectedPart.stock, selectedPart.min_stock_threshold).color}>
                    {getStockStatus(selectedPart.stock, selectedPart.min_stock_threshold).text}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              {selectedPart.compatibility && selectedPart.compatibility.length > 0 && (
                <div>
                  <Title level={4}>Vehicle Compatibility</Title>
                  <div className="flex flex-wrap gap-2">
                    {selectedPart.compatibility.map((comp, index) => (
                      <Tag key={index}>{comp}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
        </div>
      </App>
    </DashboardLayout>
  )
}