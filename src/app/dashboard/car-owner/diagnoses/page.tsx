'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  Button,
  Modal,
  Descriptions,
  Image,
  Empty,
  Spin,
  message,
  Input,
  Select,
  DatePicker
} from 'antd'
import { 
  FileTextOutlined, 
  CarOutlined, 
  ToolOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Diagnosis, Request, Car } from '@/types'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

interface DiagnosisWithDetails extends Diagnosis {
  request?: Request
  car?: Car
  mechanic_name?: string
}

export default function CarOwnerDiagnosesPage() {
  const { user } = useAuth()
  const [diagnoses, setDiagnoses] = useState<DiagnosisWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisWithDetails | null>(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      loadDiagnoses()
    }
  }, [user])

  const loadDiagnoses = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // Get all requests for this car owner
      const userRequests = await DatabaseService.getRequestsByOwner(user.id)
      
      // Get all diagnoses for these requests
      const allDiagnoses: DiagnosisWithDetails[] = []
      
      for (const request of userRequests) {
        const requestDiagnoses = await DatabaseService.getDiagnosesByRequest(request.id)
        
        for (const diagnosis of requestDiagnoses) {
          // Get car details
          const car = await DatabaseService.getCar(request.car_id) || undefined
          
          // Get mechanic details
          let mechanic_name = 'Unknown Mechanic'
          if (diagnosis.mechanic_id) {
            const mechanic = await DatabaseService.getUser(diagnosis.mechanic_id)
            mechanic_name = mechanic?.name || 'Unknown Mechanic'
          }

          allDiagnoses.push({
            ...diagnosis,
            request,
            car,
            mechanic_name
          })
        }
      }

      // Sort by creation date (newest first)
      allDiagnoses.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime()
        const bTime = new Date(b.created_at || 0).getTime()
        return bTime - aTime
      })

      setDiagnoses(allDiagnoses)
    } catch (error) {
      console.error('Error loading diagnoses:', error)
      message.error('Failed to load diagnoses')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (diagnosis: DiagnosisWithDetails) => {
    setSelectedDiagnosis(diagnosis)
    setDetailsModalVisible(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'green'
      case 'medium': return 'orange'
      case 'high': return 'red'
      case 'critical': return 'red'
      default: return 'blue'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft': return 'gray'
      case 'submitted': return 'blue'
      case 'approved': return 'green'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  // Filter diagnoses based on search and filters
    const filteredDiagnoses = diagnoses.filter(diagnosis => {
    const matchesSearch = !searchTerm ||
      (diagnosis.title as string)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (diagnosis.details as string)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.car?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.car?.model?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || diagnosis.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || diagnosis.severity === severityFilter

    const matchesDate = !dateRange || (
      new Date(diagnosis.created_at || 0) >= new Date(dateRange[0]) &&
      new Date(diagnosis.created_at || 0) <= new Date(dateRange[1])
    )

    return matchesSearch && matchesStatus && matchesSeverity && matchesDate
  })

  // Calculate statistics
  const stats = {
    total: diagnoses.length,
    pending: diagnoses.filter(d => d.status === 'submitted').length,
    completed: diagnoses.filter(d => d.status === 'completed').length,
    totalCost: diagnoses.reduce((sum, d) => sum + (d.estimated_cost || 0), 0)
  }

  const columns = [
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (record: DiagnosisWithDetails) => (
        <div className="flex items-center space-x-3">
          <CarOutlined className="text-blue-500" />
          <div>
            <div className="font-medium">
              {record.car?.make} {record.car?.model}
            </div>
            <div className="text-sm text-gray-500">
              {record.car?.year}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Diagnosis',
      key: 'diagnosis',
      render: (record: DiagnosisWithDetails) => (
        <div>
          <div className="font-medium">{record.title as string}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {record.details as string}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Tag color={getSeverityColor(record.severity as string)}>
              {(record.severity as string)?.toUpperCase()}
            </Tag>
            <Tag color={getStatusColor(record.status as string)}>
              {(record.status as string)?.toUpperCase()}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Mechanic',
      key: 'mechanic',
      render: (record: DiagnosisWithDetails) => (
        <div className="flex items-center space-x-2">
          <ToolOutlined className="text-green-500" />
          <span>{record.mechanic_name}</span>
        </div>
      )
    },
    {
      title: 'Cost Estimate',
      key: 'cost',
      render: (record: DiagnosisWithDetails) => (
        <div>
          <div className="font-semibold text-green-600">
            GHS {record.estimated_cost?.toFixed(2) || '0.00'}
          </div>
          {record.resolution_time && (
            <div className="text-sm text-gray-500">
              {record.resolution_time as string}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Date',
      key: 'date',
      render: (record: DiagnosisWithDetails) => (
        <div>
          <div>{new Date(record.created_at || 0).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">
            {new Date(record.created_at || 0).toLocaleTimeString()}
          </div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: DiagnosisWithDetails) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          type="primary"
          size="small"
        >
          View Details
        </Button>
      )
    }
  ]

  if (loading) {
    return (
      <DashboardLayout activeKey="diagnoses">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="diagnoses">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Title level={2} className="!mb-2">
            <FileTextOutlined className="mr-2" />
            Vehicle Diagnoses
          </Title>
          <Text type="secondary">
            View detailed diagnoses and estimates for your vehicles
          </Text>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Diagnoses"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Pending Review"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Completed"
                value={stats.completed}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Estimates"
                value={stats.totalCost}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8}>
              <Input
                placeholder="Search diagnoses..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">All Status</Option>
                <Option value="draft">Draft</Option>
                <Option value="submitted">Submitted</Option>
                <Option value="approved">Approved</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Severity"
                value={severityFilter}
                onChange={setSeverityFilter}
                style={{ width: '100%' }}
              >
                <Option value="all">All Severity</Option>
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="critical">Critical</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                placeholder={['Start Date', 'End Date']}
              />
            </Col>
          </Row>
        </Card>

        {/* Diagnoses Table */}
        <Card>
          {filteredDiagnoses.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                diagnoses.length === 0 
                  ? "No diagnoses found. Submit a service request to get started!"
                  : "No diagnoses match your current filters."
              }
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredDiagnoses}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} diagnoses`
              }}
              scroll={{ x: 1000 }}
            />
          )}
        </Card>

        {/* Details Modal */}
        <Modal
          title="Diagnosis Details"
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedDiagnosis && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Descriptions title="Basic Information" bordered>
                <Descriptions.Item label="Vehicle" span={2}>
                  {selectedDiagnosis.car?.make} {selectedDiagnosis.car?.model} ({selectedDiagnosis.car?.year})
                </Descriptions.Item>
                <Descriptions.Item label="Mechanic">
                  {selectedDiagnosis.mechanic_name}
                </Descriptions.Item>
                <Descriptions.Item label="Title" span={3}>
                  {selectedDiagnosis.title as string}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedDiagnosis.status as string)}>
                    {(selectedDiagnosis.status as string)?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Severity">
                  <Tag color={getSeverityColor(selectedDiagnosis.severity)}>
                    {selectedDiagnosis.severity?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {new Date(selectedDiagnosis.created_at || 0).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {/* Description */}
              <div>
                <Title level={5}>Description</Title>
                <Paragraph>{selectedDiagnosis.details}</Paragraph>
              </div>

              {/* Cost Breakdown */}
              <div>
                <Title level={5}>Cost Estimate</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                        title="Total Estimate"
                        value={selectedDiagnosis.estimated_cost || 0}
                        prefix="GHS"
                        precision={2}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small">
                      <Statistic
                                                  title="Labor Cost"
                          value={selectedDiagnosis.labor_cost || 0}
                          prefix="GHS"
                          precision={2}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>

              {/* Parts Needed */}
              {selectedDiagnosis.parts_needed && selectedDiagnosis.parts_needed.length > 0 && (
                <div>
                  <Title level={5}>Parts Needed</Title>
                  <div className="space-y-2">
                    {selectedDiagnosis.parts_needed.map((part, index) => (
                      <Card key={index} size="small">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{part.name}</div>
                            <div className="text-sm text-gray-500">Qty: {part.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">GHS {part.estimated_price?.toFixed(2)}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Required */}
              {selectedDiagnosis.follow_up_required && (
                <div>
                  <Title level={5}>Follow-up Required</Title>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <Text type="warning">
                      <ClockCircleOutlined className="mr-2" />
                      Follow-up inspection recommended
                    </Text>
                  </Card>
                </div>
              )}

              {/* Notes */}
              {selectedDiagnosis.follow_up_notes && (
                <div>
                  <Title level={5}>Additional Notes</Title>
                  <Paragraph>{selectedDiagnosis.follow_up_notes}</Paragraph>
                </div>
              )}

              {/* Images */}
              {selectedDiagnosis.image_urls && selectedDiagnosis.image_urls.length > 0 && (
                <div>
                  <Title level={5}>Diagnostic Images</Title>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedDiagnosis.image_urls.map((url, index) => (
                      <Image
                        key={index}
                        src={url}
                        alt={`Diagnostic image ${index + 1}`}
                        className="rounded"
                        width="100%"
                        height={150}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
} 