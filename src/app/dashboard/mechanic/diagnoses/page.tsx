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
  Upload,
  Row,
  Col,
  Divider,
  Badge
} from 'antd'
import { 
  FileTextOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined,
  CameraOutlined,
  DeleteOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Diagnosis, Request, SeverityLevel, DiagnosisStatus, PartNeeded } from '@/types'

const { TextArea } = Input
const { Option } = Select

export default function MechanicDiagnosesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
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
      const [diagnosesData, requestsData] = await Promise.all([
        DatabaseService.getDiagnosesByMechanic(user!.id),
        DatabaseService.getRequestsByMechanic(user!.id)
      ])
      
      setDiagnoses(diagnosesData)
      // Filter requests that can have diagnoses created
      setMyRequests(requestsData.filter(r => ['claimed', 'diagnosed'].includes(r.status)))
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('Failed to load diagnoses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      const diagnosisData = {
        request_id: values.request_id,
        mechanic_id: user!.id,
        title: values.title,
        details: values.details,
        severity: values.severity as SeverityLevel,
        status: 'submitted' as DiagnosisStatus,
        estimated_cost: values.estimated_cost,
        labor_cost: values.labor_cost,
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
        message.success('Diagnosis created successfully!')
        
        // Send notification to car owner
        const request = myRequests.find(r => r.id === values.request_id)
        if (request) {
          await DatabaseService.createNotification({
            user_id: request.owner_id,
            title: 'Diagnosis Available',
            message: `A diagnosis has been submitted for your service request: ${request.title}`,
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false,
            data: { 
              request_id: request.id, 
              mechanic_name: user!.name,
              estimated_cost: values.estimated_cost 
            }
          })
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
      message.error('Failed to save diagnosis')
    }
  }

  const handleEdit = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis)
    setIsEditing(true)
    setPartsNeeded(diagnosis.parts_needed || [])
    form.setFieldsValue({
      request_id: diagnosis.request_id,
      title: diagnosis.title,
      details: diagnosis.details,
      severity: diagnosis.severity,
      estimated_cost: diagnosis.estimated_cost,
      labor_cost: diagnosis.labor_cost,
      follow_up_required: diagnosis.follow_up_required,
      follow_up_notes: diagnosis.follow_up_notes,
      resolution_time: diagnosis.resolution_time
    })
    setModalVisible(true)
  }

  const addPartNeeded = () => {
    setPartsNeeded([...partsNeeded, {
      name: '',
      quantity: 1,
      estimated_price: 0,
      status: 'needed'
    }])
  }

  const updatePartNeeded = (index: number, field: string, value: any) => {
    const updated = [...partsNeeded]
    updated[index] = { ...updated[index], [field]: value }
    setPartsNeeded(updated)
  }

  const removePartNeeded = (index: number) => {
    setPartsNeeded(partsNeeded.filter((_, i) => i !== index))
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

  const getStatusColor = (status: DiagnosisStatus) => {
    const colors = {
      draft: 'gray',
      submitted: 'blue',
      approved: 'green',
      completed: 'success'
    }
    return colors[status]
  }

  const columns = [
    {
      title: 'Request',
      key: 'request',
      render: (record: Diagnosis) => (
        <div>
          <div className="font-medium">{record.title}</div>
          <div className="text-sm text-gray-500">ID: {record.request_id?.slice(-8)}</div>
        </div>
      )
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: SeverityLevel) => (
        <Tag color={getSeverityColor(severity)}>{severity.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: DiagnosisStatus) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Estimated Cost',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      render: (cost: number) => cost ? `$${cost.toFixed(2)}` : '-'
    },
    {
      title: 'Parts Needed',
      key: 'parts_needed',
      render: (record: Diagnosis) => (
        <Badge count={record.parts_needed?.length || 0} />
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
      render: (record: Diagnosis) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDiagnosis(record)
              setViewModalVisible(true)
            }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="diagnoses">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Diagnoses</h2>
            <p className="text-gray-600">Create and manage vehicle diagnoses</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsEditing(false)
              setSelectedDiagnosis(null)
              setPartsNeeded([])
              form.resetFields()
              setModalVisible(true)
            }}
          >
            Create Diagnosis
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={diagnoses}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Create/Edit Diagnosis Modal */}
        <Modal
          title={isEditing ? 'Edit Diagnosis' : 'Create Diagnosis'}
          open={modalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setModalVisible(false)
            form.resetFields()
            setPartsNeeded([])
            setIsEditing(false)
            setSelectedDiagnosis(null)
          }}
          width={800}
          okText={isEditing ? 'Update' : 'Create'}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="request_id"
                  label="Service Request"
                  rules={[{ required: true, message: 'Please select a request' }]}
                >
                  <Select placeholder="Select a request">
                    {myRequests.map(request => (
                      <Option key={request.id} value={request.id}>
                        {request.title} - {request.car?.make} {request.car?.model}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="severity"
                  label="Severity"
                  rules={[{ required: true, message: 'Please select severity' }]}
                >
                  <Select>
                    <Option value="low">Low</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="high">High</Option>
                    <Option value="critical">Critical</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="title"
              label="Diagnosis Title"
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input placeholder="Brief diagnosis title" />
            </Form.Item>

            <Form.Item
              name="details"
              label="Detailed Diagnosis"
              rules={[{ required: true, message: 'Please enter diagnosis details' }]}
            >
              <TextArea rows={4} placeholder="Detailed diagnosis description..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="labor_cost"
                  label="Labor Cost ($)"
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="estimated_cost"
                  label="Total Estimated Cost ($)"
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="resolution_time"
                  label="Estimated Time"
                >
                  <Input placeholder="e.g., 2-3 hours" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Parts Needed</Divider>
            
            {partsNeeded.map((part, index) => (
              <Card key={index} size="small" className="mb-4">
                <Row gutter={16} align="middle">
                  <Col span={8}>
                    <Input
                      placeholder="Part name"
                      value={part.name}
                      onChange={(e) => updatePartNeeded(index, 'name', e.target.value)}
                    />
                  </Col>
                  <Col span={6}>
                    <InputNumber
                      min={1}
                      placeholder="Quantity"
                      value={part.quantity}
                      onChange={(value) => updatePartNeeded(index, 'quantity', value)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={6}>
                    <InputNumber
                      min={0}
                      step={0.01}
                      placeholder="Est. Price"
                      value={part.estimated_price}
                      onChange={(value) => updatePartNeeded(index, 'estimated_price', value)}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={4}>
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => removePartNeeded(index)}
                      danger
                    />
                  </Col>
                </Row>
              </Card>
            ))}

            <Button
              type="dashed"
              onClick={addPartNeeded}
              icon={<PlusOutlined />}
              style={{ width: '100%', marginBottom: 16 }}
            >
              Add Part
            </Button>

            <Form.Item name="follow_up_required" valuePropName="checked">
              <input type="checkbox" /> Follow-up required
            </Form.Item>

            <Form.Item
              name="follow_up_notes"
              label="Follow-up Notes"
            >
              <TextArea rows={2} placeholder="Follow-up instructions..." />
            </Form.Item>
          </Form>
        </Modal>

        {/* View Diagnosis Modal */}
        <Modal
          title="Diagnosis Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedDiagnosis && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Diagnosis Information</h4>
                <p><strong>Title:</strong> {selectedDiagnosis.title}</p>
                <p><strong>Details:</strong> {selectedDiagnosis.details}</p>
                <p><strong>Severity:</strong> <Tag color={getSeverityColor(selectedDiagnosis.severity)}>{selectedDiagnosis.severity}</Tag></p>
                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedDiagnosis.status)}>{selectedDiagnosis.status}</Tag></p>
                <p><strong>Labor Cost:</strong> ${selectedDiagnosis.labor_cost?.toFixed(2) || '0.00'}</p>
                <p><strong>Total Estimated Cost:</strong> ${selectedDiagnosis.estimated_cost?.toFixed(2) || '0.00'}</p>
                <p><strong>Resolution Time:</strong> {selectedDiagnosis.resolution_time || 'N/A'}</p>
              </div>

              {selectedDiagnosis.parts_needed && selectedDiagnosis.parts_needed.length > 0 && (
                <div>
                  <h4 className="font-semibold">Parts Needed</h4>
                  <div className="space-y-2">
                    {selectedDiagnosis.parts_needed.map((part, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{part.name} (Qty: {part.quantity})</span>
                        <span className="font-medium">${part.estimated_price?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDiagnosis.follow_up_required && (
                <div>
                  <h4 className="font-semibold">Follow-up Required</h4>
                  <p>{selectedDiagnosis.follow_up_notes || 'No additional notes'}</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
} 