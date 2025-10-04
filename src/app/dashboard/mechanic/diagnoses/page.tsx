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
  message,
  Row,
  Col,
  Divider,
  Badge,
  Typography,
  Alert,
  Spin,
  Empty,
  Descriptions,
  Steps,
  Tooltip,
  Avatar
} from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ToolOutlined,
  CarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Diagnosis, Request, SeverityLevel, DiagnosisStatus, PartNeeded, Part } from '@/types'

const { TextArea } = Input
const { Option } = Select
const { Title, Text, Paragraph } = Typography

export default function MechanicDiagnosesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [availableParts, setAvailableParts] = useState<Part[]>([])
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const [partsNeeded, setPartsNeeded] = useState<PartNeeded[]>([])

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [diagnosesData, requestsData, partsData] = await Promise.all([
        DatabaseService.getDiagnosesByMechanic(user!.id),
        DatabaseService.getRequestsByMechanic(user!.id),
        DatabaseService.getAllParts()
      ])

      setDiagnoses(diagnosesData || [])
      // Filter requests to those claimed by this mechanic
      setMyRequests(requestsData?.filter(r =>
        ['claimed', 'diagnosed'].includes(r.status) && r.mechanic_id === user!.id
      ) || [])
      setAvailableParts(partsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('Failed to load diagnoses data')
      setAvailableParts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setSubmitting(true)
    try {
      // Calculate total parts cost
            const totalPartsCost = partsNeeded.reduce(
        (total, part) => total + ((part.estimated_price || 0) * part.quantity),
        0
      )

      const diagnosisData = {
        request_id: values.request_id,
        mechanic_id: user!.id,
        title: values.title,
        details: values.details,
        severity: values.severity as SeverityLevel,
        status: 'submitted' as DiagnosisStatus,
        estimated_cost: (values.labor_cost || 0) + totalPartsCost,
        labor_cost: values.labor_cost || 0,
        parts_needed: partsNeeded,
        follow_up_required: values.follow_up_required || false,
        follow_up_notes: values.follow_up_notes,
        resolution_time: values.resolution_time,
        created_at: new Date().toISOString()
      }

      if (isEditing && selectedDiagnosis) {
        await DatabaseService.updateDiagnosis(selectedDiagnosis.id, diagnosisData)
        message.success('Diagnosis updated successfully!')
      } else {
        await DatabaseService.createDiagnosis(diagnosisData)
        message.success('Diagnosis submitted successfully!')

        // Send notification to car owner
        const request = myRequests.find(r => r.id === values.request_id)
        if (request) {
          await DatabaseService.createNotification({
            user_id: request.owner_id,
            title: 'New Diagnosis Available',
            message: `${user!.name} has submitted a diagnosis for your service request: ${request.title}`,
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false,
            data: {
              request_id: request.id,
              mechanic_name: user!.name,
              estimated_cost: diagnosisData.estimated_cost,
              severity: values.severity
            }
          })

          // Update request status to 'diagnosed'
          await DatabaseService.updateRequest(request.id, { status: 'diagnosed' })
        }
      }

      setModalVisible(false)
      form.resetFields()
      setPartsNeeded([])
      setIsEditing(false)
      setSelectedDiagnosis(null)
      loadData()
    } catch (error) {
      console.error('Error saving diagnosis:', error)
      message.error('Failed to save diagnosis. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (diagnosis: Diagnosis) => {
    try {
      setSelectedDiagnosis(diagnosis)
      setIsEditing(true)

      const partsData = diagnosis.parts_needed
      let convertedParts: PartNeeded[] = []

      if (partsData == null) {
        convertedParts = []
      } else if (Array.isArray(partsData)) {
        convertedParts = partsData.map(item => {
          if (typeof item === 'string') {
            const matchedPart = availableParts.find(part => part.name.toLowerCase() === item.toLowerCase())
            return {
              name: matchedPart?.name || item,
              quantity: 1,
              estimated_price: matchedPart?.price || 0,
              status: 'needed' as const,
              part_id: matchedPart?.id,
              dealer_id: matchedPart?.dealer_id
            }
          }

          const matchedPart = availableParts.find(part =>
            part.id === item.part_id || (item.name && part.name.toLowerCase() === item.name.toLowerCase())
          )

          return {
            ...item,
            name: item.name || matchedPart?.name || '',
            quantity: item.quantity || 1,
            estimated_price: item.estimated_price ?? matchedPart?.price ?? 0,
            status: item.status || 'needed',
            part_id: item.part_id || matchedPart?.id,
            dealer_id: item.dealer_id || matchedPart?.dealer_id
          }
        })
      } else {
        const stringData = String(partsData || '')
        if (stringData.trim()) {
          const partNames = stringData.split(/[,\n]+/).map(name => name.trim()).filter(Boolean)
          convertedParts = partNames.map(name => {
            const matchedPart = availableParts.find(part => part.name.toLowerCase() === name.toLowerCase())
            return {
              name: matchedPart?.name || name,
              quantity: 1,
              estimated_price: matchedPart?.price || 0,
              status: 'needed' as const,
              part_id: matchedPart?.id,
              dealer_id: matchedPart?.dealer_id
            }
          })
        } else {
          convertedParts = []
        }
      }

      if (convertedParts.length === 0) {
        convertedParts = [{ name: '', quantity: 1, estimated_price: 0, status: 'needed' as const }]
      }

      setPartsNeeded(convertedParts)
    } catch (error) {
      console.error('Error in handleEdit:', error)
      setPartsNeeded([{ name: '', quantity: 1, estimated_price: 0, status: 'needed' as const }])
    }

    form.setFieldsValue({
      request_id: diagnosis.request_id,
      title: diagnosis.title,
      details: diagnosis.details,
      severity: diagnosis.severity,
      labor_cost: diagnosis.labor_cost ?? 50,
      follow_up_required: diagnosis.follow_up_required,
      follow_up_notes: diagnosis.follow_up_notes,
      resolution_time: diagnosis.resolution_time ?? '1'
    })
    setModalVisible(true)
  }

  const addPartNeeded = () => {
    setPartsNeeded(prev => [
      ...prev,
      { name: '', quantity: 1, estimated_price: 0, status: 'needed' as const }
    ])
  }

  const updatePartNeeded = (index: number, field: keyof PartNeeded, value: any) => {
    setPartsNeeded(prev => {
      const updated = [...prev]
      const current = updated[index]
      if (!current) {
        return prev
      }

      if (field === 'quantity') {
        const numericValue = typeof value === 'number' ? value : 1
        const matchedPart = current.part_id ? availableParts.find(part => part.id === current.part_id) : undefined
        const cappedQuantity = Math.max(1, Math.min(matchedPart?.stock || numericValue, numericValue))
        updated[index] = { ...current, quantity: cappedQuantity }
        return updated
      }

      updated[index] = { ...current, [field]: value }
      return updated
    })
  }

  const handleDealerPartSelection = (index: number, partId?: string) => {
    setPartsNeeded(prev => {
      const updated = [...prev]
      const current = updated[index]
      if (!current) {
        return prev
      }

      if (!partId) {
        updated[index] = { ...current, part_id: undefined, dealer_id: undefined }
        return updated
      }

      const matchedPart = availableParts.find(part => part.id === partId)
      if (!matchedPart) {
        return prev
      }

      const safeQuantity = Math.max(1, Math.min(matchedPart.stock, current.quantity || 1))
      updated[index] = {
        ...current,
        name: matchedPart.name,
        part_id: matchedPart.id,
        dealer_id: matchedPart.dealer_id,
        estimated_price: matchedPart.price,
        quantity: safeQuantity,
        status: current.status || 'needed'
      }
      return updated
    })
  }

  const contactDealer = (dealer?: Part['dealer']) => {
    if (!dealer?.phone) {
      message.info('Dealer phone number not available yet.')
      return
    }

    if (typeof window !== 'undefined') {
      window.open(`tel:${dealer.phone}`)
    }
  }

  const removePartNeeded = (index: number) => {
    setPartsNeeded(prev => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.length > 0 ? updated : [{ name: '', quantity: 1, estimated_price: 0, status: 'needed' as const }]
    })
  }

const getSeverityColor = (severity: SeverityLevel) => {
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red',
      critical: 'red'
    }
    return colors[severity]
  }

  const getSeverityIcon = (severity: SeverityLevel) => {
    const icons = {
      low: <CheckCircleOutlined />,
      medium: <ClockCircleOutlined />,
      high: <ExclamationCircleOutlined />,
      critical: <ExclamationCircleOutlined />
    }
    return icons[severity]
  }

  const getStatusColor = (status: DiagnosisStatus) => {
    const colors = {
      draft: 'default',
      submitted: 'processing',
      approved: 'success',
      completed: 'success'
    }
    return colors[status]
  }

  const formatCurrency = (amount: number) => {
    return `GHS ${amount.toFixed(2)}`
  }

  const columns = [
    {
      title: 'Service Request',
      key: 'request_info',
      width: 250,
      render: (record: Diagnosis) => {
        const request = myRequests.find(r => r.id === record.request_id)
        return (
          <div>
            <div className="flex items-center mb-1">
              <CarOutlined className="text-blue-500 mr-2" />
              <span className="font-medium">{record.title}</span>
            </div>
            {request && (
              <div className="text-sm text-gray-500">
                {request.car?.make} {request.car?.model} ({request.car?.year})
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              ID: {record.request_id?.slice(-8)}
            </div>
          </div>
        )
      }
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity: SeverityLevel) => (
        <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: DiagnosisStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Cost Breakdown',
      key: 'cost_breakdown',
      width: 150,
      render: (record: Diagnosis) => (
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Labor:</span>
            <span className="font-medium">{formatCurrency(record.labor_cost || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-semibold text-blue-600">
              {formatCurrency(record.estimated_cost || 0)}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Parts',
      key: 'parts_needed',
      width: 80,
      align: 'center' as const,
      render: (record: Diagnosis) => (
        <Badge
          count={record.parts_needed?.length || 0}
          showZero
          style={{ backgroundColor: '#52c41a' }}
        />
      )
    },
    {
      title: 'Resolution Time',
      dataIndex: 'resolution_time',
      key: 'resolution_time',
      width: 120,
      render: (time: string) => time || 'TBD'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (record: Diagnosis) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedDiagnosis(record)
                setViewModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleEdit(record)}
              disabled={record.status === 'completed'}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="diagnoses">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <Title level={2} className="!mb-2 flex items-center">
              <FileTextOutlined className="mr-3 text-blue-600" />
              Vehicle Diagnoses
            </Title>
            <Text type="secondary" className="text-lg">
              Create and manage detailed vehicle diagnoses for your claimed service requests
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              if (myRequests.length === 0) {
                message.warning('You need to claim service requests before creating diagnoses')
                return
              }
              setIsEditing(false)
              setSelectedDiagnosis(null)
              setPartsNeeded([{ name: '', quantity: 1, estimated_price: 0, status: 'needed' }])
              form.resetFields()
              form.setFieldsValue({
                labor_cost: 50,
                resolution_time: '1',
                follow_up_required: false
              })
              setModalVisible(true)
            }}
            className="shadow-lg"
          >
            Create Diagnosis
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-600">{diagnoses.length}</div>
              <div className="text-gray-500">Total Diagnoses</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {diagnoses.filter(d => d.status === 'approved').length}
              </div>
              <div className="text-gray-500">Approved</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-orange-600">{myRequests.length}</div>
              <div className="text-gray-500">Available Requests</div>
            </Card>
          </Col>
        </Row>

        {/* No requests warning */}
        {myRequests.length === 0 && !loading && (
          <Alert
            message="No Service Requests Available"
            description="You need to claim service requests from the Requests page before you can create diagnoses."
            type="info"
            showIcon
            action={
              <Button size="small" onClick={() => window.location.href = '/dashboard/mechanic/requests'}>
                View Requests
              </Button>
            }
          />
        )}

        {/* Main Table */}
        <Card className="shadow-lg">
          <Table
            columns={columns}
            dataSource={diagnoses}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} diagnoses`
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: loading ? <Spin size="large" /> : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No diagnoses created yet"
                />
              )
            }}
          />
        </Card>

        {/* Create/Edit Diagnosis Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <ToolOutlined className="mr-2 text-blue-600" />
              {isEditing ? 'Edit Diagnosis' : 'Create New Diagnosis'}
            </div>
          }
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false)
            form.resetFields()
            setPartsNeeded([])
            setIsEditing(false)
            setSelectedDiagnosis(null)
          }}
          width={900}
          okText={isEditing ? 'Update Diagnosis' : 'Submit Diagnosis'}
          confirmLoading={submitting}
          destroyOnClose
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical" className="mt-4">
            <Alert
              message="Diagnosis Information"
              description="Provide a comprehensive diagnosis for the selected service request. All costs should be in GHS."
              type="info"
              showIcon
              className="mb-6"
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="request_id"
                  label="Service Request"
                  rules={[{ required: true, message: 'Please select a service request' }]}
                >
                  <Select
                    placeholder="Select a claimed service request"
                    size="large"
                    disabled={isEditing}
                  >
                    {myRequests.map(request => (
                      <Option key={request.id} value={request.id}>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-gray-500">
                            {request.car?.make} {request.car?.model} ({request.car?.year})
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="severity"
                  label="Severity Level"
                  rules={[{ required: true, message: 'Please select severity level' }]}
                >
                  <Select size="large">
                    <Option value="low">
                      <Tag color="green" className="mr-2">LOW</Tag>
                      Minor issue, routine maintenance
                    </Option>
                    <Option value="medium">
                      <Tag color="orange" className="mr-2">MEDIUM</Tag>
                      Moderate issue, needs attention
                    </Option>
                    <Option value="high">
                      <Tag color="red" className="mr-2">HIGH</Tag>
                      Serious issue, urgent repair
                    </Option>
                    <Option value="critical">
                      <Tag color="red" className="mr-2">CRITICAL</Tag>
                      Safety risk, immediate action
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="title"
              label="Diagnosis Title"
              rules={[{ required: true, message: 'Please enter a diagnosis title' }]}
            >
              <Input
                placeholder="Brief title describing the main issue"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="details"
              label="Detailed Diagnosis"
              rules={[{ required: true, message: 'Please provide detailed diagnosis' }]}
            >
              <TextArea
                rows={6}
                placeholder="Provide comprehensive diagnosis details including:&#10;• Problem identification&#10;• Root cause analysis&#10;• Recommended solution&#10;• Any additional observations"
                showCount
                maxLength={2000}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="labor_cost"
                  label="Labor Cost (GHS)"
                  rules={[{ required: true, message: 'Please enter labor cost' }]}
                >
                  <InputNumber
                    min={0}
                    step={10}
                    style={{ width: '100%' }}
                    size="large"
                    prefix={<DollarOutlined />}
                    placeholder="0.00"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="resolution_time"
                  label="Estimated Time"
                  rules={[{ required: true, message: 'Please enter estimated time' }]}
                >
                  <Input
                    placeholder="e.g., 2-3 hours, 1 day"
                    size="large"
                    prefix={<ClockCircleOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Total Cost (GHS)">
                  <div className="text-2xl font-bold text-blue-600 flex items-center h-10">
                    {formatCurrency(
                      (form.getFieldValue('labor_cost') || 0) +
                      partsNeeded.reduce((total, part) => total + (part.estimated_price * part.quantity), 0)
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">
              <span className="text-lg font-semibold">Parts Needed</span>
            </Divider>

            {partsNeeded.map((part, index) => {
              const selectedInventoryPart = availableParts.find(invPart => invPart.id === part.part_id)

              return (
                <Card key={index} size="small" className="mb-4 border-dashed">
                  <Space direction="vertical" className="w-full">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select available dealer part"
                      size="large"
                      value={part.part_id || undefined}
                      optionFilterProp="label"
                      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      onChange={(value) => handleDealerPartSelection(index, value as string | undefined)}
                      options={availableParts.map(dealerPart => ({
                        value: dealerPart.id,
                        label: `${dealerPart.name} - ${dealerPart.dealer?.name || 'Unknown dealer'} (GHS ${dealerPart.price.toFixed(2)})`
                      }))}
                    />

                    {selectedInventoryPart && (
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Dealer: {selectedInventoryPart.dealer?.name || 'Unknown'} - Stock: {selectedInventoryPart.stock}
                        </span>
                        <Button
                          type="link"
                          size="small"
                          icon={<PhoneOutlined />}
                          disabled={!selectedInventoryPart.dealer?.phone}
                          onClick={() => contactDealer(selectedInventoryPart.dealer)}
                        >
                          Call Dealer
                        </Button>
                      </div>
                    )}

                    <Row gutter={16} align="middle">
                      <Col span={10}>
                        <Input
                          placeholder="Part name (e.g., Brake Pads, Oil Filter)"
                          value={part.name}
                          onChange={(e) => updatePartNeeded(index, 'name', e.target.value)}
                          size="large"
                        />
                      </Col>
                      <Col span={5}>
                        <InputNumber
                          min={1}
                          max={selectedInventoryPart?.stock}
                          placeholder="Qty"
                          value={part.quantity}
                          onChange={(value) => updatePartNeeded(index, 'quantity', value)}
                          style={{ width: '100%' }}
                          size="large"
                        />
                      </Col>
                      <Col span={6}>
                        <InputNumber
                          min={0}
                          step={10}
                          placeholder="Price (GHS)"
                          value={part.estimated_price}
                          onChange={(value) => updatePartNeeded(index, 'estimated_price', value)}
                          style={{ width: '100%' }}
                          size="large"
                          prefix="GHS"
                        />
                      </Col>
                      <Col span={2}>
                        <Text className="font-medium">
                          {formatCurrency((part.estimated_price || 0) * (part.quantity || 0))}
                        </Text>
                      </Col>
                      <Col span={1}>
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => removePartNeeded(index)}
                          danger
                          type="text"
                        />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              )
            })}

            <Button
              type="dashed"
              onClick={addPartNeeded}
              icon={<PlusOutlined />}
              size="large"
              style={{ width: '100%', marginBottom: 16 }}
            >
              Add Required Part
            </Button>

            <Card className="bg-gray-50">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="follow_up_required" valuePropName="checked">
                    <label className="flex items-center cursor-pointer">
                      <input type="checkbox" className="mr-2" />
                      <span className="font-medium">Follow-up appointment required</span>
                    </label>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="follow_up_notes"
                label="Follow-up Instructions"
              >
                <TextArea
                  rows={3}
                  placeholder="Specify any follow-up requirements, maintenance schedule, or additional instructions..."
                />
              </Form.Item>
            </Card>
          </Form>
        </Modal>

        {/* View Diagnosis Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <EyeOutlined className="mr-2 text-blue-600" />
              Diagnosis Details
            </div>
          }
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedDiagnosis && (
            <div className="space-y-6">
              <Descriptions title="Basic Information" bordered column={2}>
                <Descriptions.Item label="Title" span={2}>
                  <Text strong>{selectedDiagnosis.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Severity">
                  <Tag color={getSeverityColor(selectedDiagnosis.severity)} icon={getSeverityIcon(selectedDiagnosis.severity)}>
                    {selectedDiagnosis.severity.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedDiagnosis.status)}>
                    {selectedDiagnosis.status.replace('_', ' ').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Labor Cost">
                  {formatCurrency(selectedDiagnosis.labor_cost || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Total Cost">
                  <Text strong className="text-blue-600">
                    {formatCurrency(selectedDiagnosis.estimated_cost || 0)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Resolution Time" span={2}>
                  {selectedDiagnosis.resolution_time || 'Not specified'}
                </Descriptions.Item>
              </Descriptions>

              <div>
                <Title level={4}>Detailed Diagnosis</Title>
                <Card>
                  <Text>{selectedDiagnosis.details}</Text>
                </Card>
              </div>

              {selectedDiagnosis.parts_needed && (
                <div>
                  <Title level={4}>Required Parts</Title>
                  <div className="space-y-2">
                    {Array.isArray(selectedDiagnosis.parts_needed) ? (
                      // Handle array of PartNeeded objects
                      selectedDiagnosis.parts_needed.length > 0 ? (
                        selectedDiagnosis.parts_needed.map((part, index) => (
                          <Card key={index} size="small">
                            <Row justify="space-between" align="middle">
                              <Col>
                                <Text strong>{typeof part === 'string' ? part : part.name}</Text>
                                {typeof part === 'object' && part.quantity && (
                                  <div className="text-gray-500">Quantity: {part.quantity}</div>
                                )}
                              </Col>
                              {typeof part === 'object' && part.estimated_price && (
                                <Col>
                                  <div className="text-right">
                                    <div className="text-gray-500">Unit: {formatCurrency(part.estimated_price)}</div>
                                    <div className="font-semibold text-blue-600">
                                      Total: {formatCurrency(part.estimated_price * (part.quantity || 1))}
                                    </div>
                                  </div>
                                </Col>
                              )}
                            </Row>
                          </Card>
                        ))
                      ) : (
                        <Text type="secondary">No parts listed</Text>
                      )
                    ) : (
                      // Handle string case - split by newlines or commas and display as list
                      String(selectedDiagnosis.parts_needed || '').trim() ? (
                        <Card size="small">
                          <Paragraph className="!mb-0 whitespace-pre-line">
                            {selectedDiagnosis.parts_needed}
                          </Paragraph>
                        </Card>
                      ) : (
                        <Text type="secondary">No parts specified</Text>
                      )
                    )}
                  </div>
                </div>
              )}

              {selectedDiagnosis.follow_up_required && (
                <Alert
                  message="Follow-up Required"
                  description={selectedDiagnosis.follow_up_notes || 'Follow-up appointment scheduled'}
                  type="warning"
                  showIcon
                />
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}




