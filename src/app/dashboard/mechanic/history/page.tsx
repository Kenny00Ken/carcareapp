'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  DatePicker, 
  Select,
  Row,
  Col,
  Statistic,
  Timeline,
  Input,
  message
} from 'antd'
import { 
  HistoryOutlined, 
  EyeOutlined, 
  CarOutlined,
  ToolOutlined,
  DollarOutlined,
  CalendarOutlined,
  SearchOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { MaintenanceRecord, Request, ActivityLog } from '@/types'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select
const { Search } = Input

export default function MechanicHistoryPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [completedRequests, setCompletedRequests] = useState<Request[]>([])
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [activityModalVisible, setActivityModalVisible] = useState(false)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Statistics
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalEarnings: 0,
    avgJobValue: 0,
    thisMonthJobs: 0
  })

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      const [records, requests] = await Promise.all([
        DatabaseService.getMaintenanceRecordsByMechanic(user!.id),
        DatabaseService.getRequestsByMechanic(user!.id)
      ])
      
      setMaintenanceRecords(records)
      const completed = requests.filter(r => r.status === 'completed')
      setCompletedRequests(completed)
      
      // Calculate statistics
      calculateStats(records, completed)
    } catch (error) {
      console.error('Error loading data:', error)
      message.error('Failed to load maintenance history')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (records: MaintenanceRecord[], requests: Request[]) => {
    const totalEarnings = records.reduce((sum, record) => sum + record.total_cost, 0)
    const thisMonth = dayjs().startOf('month')
    const thisMonthRecords = records.filter(r => dayjs(r.maintenance_date).isAfter(thisMonth))
    
    setStats({
      totalJobs: records.length,
      totalEarnings,
      avgJobValue: records.length > 0 ? totalEarnings / records.length : 0,
      thisMonthJobs: thisMonthRecords.length
    })
  }

  const loadActivityLogs = async (requestId: string) => {
    try {
      const logs = await DatabaseService.getActivityLogs(requestId)
      setActivityLogs(logs)
    } catch (error) {
      console.error('Error loading activity logs:', error)
      message.error('Failed to load activity logs')
    }
  }

  const handleViewRecord = (record: MaintenanceRecord) => {
    setSelectedRecord(record)
    setViewModalVisible(true)
  }

  const handleViewActivity = async (request: Request) => {
    setSelectedRequest(request)
    await loadActivityLogs(request.id)
    setActivityModalVisible(true)
  }

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateRange || 
      (dayjs(record.maintenance_date).isAfter(dateRange[0]) && 
       dayjs(record.maintenance_date).isBefore(dateRange[1]))
    
    return matchesSearch && matchesDate
  })

  const filteredRequests = completedRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.car?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.car?.model.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const recordColumns = [
    {
      title: 'Service',
      key: 'service',
      render: (record: MaintenanceRecord) => (
        <div>
          <div className="font-medium">{record.title}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      )
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      render: (record: MaintenanceRecord) => (
        <div>
          <CarOutlined className="mr-1" />
          <span>Car ID: {record.car_id.slice(-8)}</span>
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'maintenance_date',
      key: 'maintenance_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Labor Hours',
      dataIndex: 'labor_hours',
      key: 'labor_hours',
      render: (hours: number) => `${hours}h`
    },
    {
      title: 'Parts Used',
      key: 'parts_used',
      render: (record: MaintenanceRecord) => (
        <Tag color="blue">{record.parts_used?.length || 0} parts</Tag>
      )
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (cost: number) => (
        <span className="font-semibold text-green-600">${cost.toFixed(2)}</span>
      )
    },
    {
      title: 'Warranty',
      dataIndex: 'warranty_period',
      key: 'warranty_period',
      render: (period: number) => period ? `${period} months` : 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: MaintenanceRecord) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewRecord(record)}
        >
          View
        </Button>
      )
    }
  ]

  const requestColumns = [
    {
      title: 'Request',
      key: 'request',
      render: (record: Request) => (
        <div>
          <div className="font-medium">{record.title}</div>
          <div className="text-sm text-gray-500">ID: {record.id.slice(-8)}</div>
        </div>
      )
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
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
      title: 'Completed',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Final Cost',
      dataIndex: 'final_cost',
      key: 'final_cost',
      render: (cost: number) => cost ? `$${cost.toFixed(2)}` : '-'
    },
    {
      title: 'Hours',
      dataIndex: 'actual_hours',
      key: 'actual_hours',
      render: (hours: number) => hours ? `${hours}h` : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Request) => (
        <Button
          icon={<FileTextOutlined />}
          onClick={() => handleViewActivity(record)}
        >
          Activity
        </Button>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="history">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Maintenance History</h2>
          <p className="text-gray-600">View your completed work and maintenance records</p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Jobs"
                value={stats.totalJobs}
                prefix={<ToolOutlined className="text-blue-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Earnings"
                value={stats.totalEarnings}
                precision={2}
                prefix={<DollarOutlined className="text-green-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Avg Job Value"
                value={stats.avgJobValue}
                precision={2}
                prefix={<DollarOutlined className="text-purple-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="This Month"
                value={stats.thisMonthJobs}
                prefix={<CalendarOutlined className="text-orange-600" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Search
                placeholder="Search by service, description, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                format="MMM DD, YYYY"
              />
            </Col>
          </Row>
        </Card>

        {/* Maintenance Records */}
        <Card title={<span><HistoryOutlined /> Maintenance Records</span>}>
          <Table
            columns={recordColumns}
            dataSource={filteredRecords}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        </Card>

        {/* Completed Requests */}
        <Card title={<span><FileTextOutlined /> Completed Requests</span>}>
          <Table
            columns={requestColumns}
            dataSource={filteredRequests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* View Maintenance Record Modal */}
        <Modal
          title="Maintenance Record Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Service Information</h4>
                <p><strong>Title:</strong> {selectedRecord.title}</p>
                <p><strong>Description:</strong> {selectedRecord.description}</p>
                <p><strong>Date:</strong> {dayjs(selectedRecord.maintenance_date).format('MMMM DD, YYYY')}</p>
                <p><strong>Labor Hours:</strong> {selectedRecord.labor_hours}</p>
                <p><strong>Total Cost:</strong> ${selectedRecord.total_cost.toFixed(2)}</p>
                <p><strong>Warrant Period:</strong> {selectedRecord.warranty_period || 0} months</p>
              </div>

              {selectedRecord.parts_used && selectedRecord.parts_used.length > 0 && (
                <div>
                  <h4 className="font-semibold">Parts Used</h4>
                  <div className="space-y-2">
                    {selectedRecord.parts_used.map((part, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{part.name} (Qty: {part.quantity})</span>
                        <span className="font-medium">${part.actual_price?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.next_service_date && (
                <div>
                  <h4 className="font-semibold">Next Service</h4>
                  <p>{dayjs(selectedRecord.next_service_date).format('MMMM DD, YYYY')}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <h4 className="font-semibold">Notes</h4>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Activity Timeline Modal */}
        <Modal
          title="Request Activity Timeline"
          open={activityModalVisible}
          onCancel={() => setActivityModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-semibold">{selectedRequest.title}</h4>
                <p>{selectedRequest.car?.make} {selectedRequest.car?.model} ({selectedRequest.car?.year})</p>
                <p>Owner: {selectedRequest.owner?.name}</p>
              </div>

              <Timeline>
                {activityLogs.map((log, index) => (
                  <Timeline.Item 
                    key={log.id}
                    color={index === 0 ? 'green' : 'blue'}
                  >
                    <div>
                      <div className="font-medium">{log.description}</div>
                      <div className="text-sm text-gray-500">
                        {dayjs(log.timestamp).format('MMM DD, YYYY HH:mm')}
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
} 