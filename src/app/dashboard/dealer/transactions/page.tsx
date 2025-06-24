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
  message, 
  Tabs,
  Badge,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Timeline,
  Select
} from 'antd'
import { 
  ShoppingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Transaction, TransactionStatus } from '@/types'
import dayjs from 'dayjs'

const { TabPane } = Tabs
const { TextArea } = Input

export default function DealerTransactionsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [approvalModalVisible, setApprovalModalVisible] = useState(false)
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false)
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve')
  const [form] = Form.useForm()

  // Statistics
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (user?.id) {
      loadTransactions()
    }
  }, [user])

  useEffect(() => {
    // Subscribe to real-time updates for pending transactions
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToPendingTransactions(
        user.id,
        (updatedTransactions) => {
          // Reload all transactions when pending ones change
          loadTransactions()
        }
      )
      return unsubscribe
    }
  }, [user])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const transactionsData = await DatabaseService.getTransactionsByDealer(user!.id)
      setTransactions(transactionsData)
      calculateStats(transactionsData)
    } catch (error) {
      console.error('Error loading transactions:', error)
      message.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (transactions: Transaction[]) => {
    const pending = transactions.filter(t => t.status === 'pending').length
    const approved = transactions.filter(t => t.status === 'approved').length
    const rejected = transactions.filter(t => t.status === 'rejected').length
    const completed = transactions.filter(t => t.status === 'completed')
    const revenue = completed.reduce((sum, t) => sum + t.total_amount, 0)

    setStats({
      pendingCount: pending,
      approvedCount: approved,
      rejectedCount: rejected,
      totalRevenue: revenue
    })
  }

  const handleApproveTransaction = async (transactionId: string, notes?: string) => {
    try {
      await DatabaseService.approveTransaction(transactionId, user!.id)
      
      // Send notification to mechanic
      const transaction = transactions.find(t => t.id === transactionId)
      if (transaction) {
        await DatabaseService.createNotification({
          user_id: transaction.mechanic_id,
          title: 'Parts Request Approved',
          message: `Your request for ${transaction.part?.name} has been approved`,
          type: 'success',
          timestamp: new Date().toISOString(),
          read: false,
          data: { 
            transaction_id: transactionId,
            part_name: transaction.part?.name,
            amount: transaction.total_amount
          }
        })
      }

      message.success('Transaction approved successfully!')
      setApprovalModalVisible(false)
      form.resetFields()
      loadTransactions()
    } catch (error) {
      console.error('Error approving transaction:', error)
      message.error('Failed to approve transaction')
    }
  }

  const handleRejectTransaction = async (transactionId: string, reason: string) => {
    try {
      await DatabaseService.updateTransaction(transactionId, { 
        status: 'rejected',
        notes: reason
      })
      
      // Send notification to mechanic
      const transaction = transactions.find(t => t.id === transactionId)
      if (transaction) {
        await DatabaseService.createNotification({
          user_id: transaction.mechanic_id,
          title: 'Parts Request Rejected',
          message: `Your request for ${transaction.part?.name} has been rejected`,
          type: 'warning',
          timestamp: new Date().toISOString(),
          read: false,
          data: { 
            transaction_id: transactionId,
            part_name: transaction.part?.name,
            reason: reason
          }
        })
      }

      message.success('Transaction rejected')
      setRejectionModalVisible(false)
      form.resetFields()
      loadTransactions()
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      message.error('Failed to reject transaction')
    }
  }

  const getStatusColor = (status: TransactionStatus) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue',
      cancelled: 'gray'
    }
    return colors[status]
  }

  const getPriorityColor = (urgency: string) => {
    const colors = { low: 'green', medium: 'orange', high: 'red' }
    return colors[urgency as keyof typeof colors] || 'blue'
  }

  const baseColumns = [
    {
      title: 'Request Details',
      key: 'details',
      render: (record: Transaction) => (
        <div>
          <div className="font-medium">{record.part?.name}</div>
          <div className="text-sm text-gray-500">ID: {record.id.slice(-8)}</div>
          <div className="text-sm text-gray-500">Qty: {record.quantity}</div>
        </div>
      )
    },
    {
      title: 'Mechanic',
      key: 'mechanic',
      render: (record: Transaction) => (
        <div>
          <div className="font-medium">{record.mechanic?.name}</div>
          <div className="text-sm text-gray-500">{record.mechanic?.phone}</div>
        </div>
      )
    },
    {
      title: 'Service Request',
      key: 'service_request',
      render: (record: Transaction) => (
        <div>
          <div>{record.request?.title || 'N/A'}</div>
          <div className="text-sm text-gray-500">
            {record.request?.car?.make} {record.request?.car?.model}
          </div>
          {record.request?.urgency && (
            <Tag size="small" color={getPriorityColor(record.request.urgency)}>
              {record.request.urgency.toUpperCase()}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (record: Transaction) => (
        <div>
          <div className="font-semibold">${record.total_amount.toFixed(2)}</div>
          <div className="text-sm text-gray-500">${record.unit_price.toFixed(2)} each</div>
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <div>
          <div>{dayjs(date).format('MMM DD, YYYY')}</div>
          <div className="text-sm text-gray-500">{dayjs(date).format('HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TransactionStatus) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Transaction) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedTransaction(record)
              setViewModalVisible(true)
            }}
          />
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Approve this transaction?"
                onConfirm={() => handleApproveTransaction(record.id)}
                okText="Approve"
                cancelText="Cancel"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                >
                  Approve
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => {
                  setSelectedTransaction(record)
                  setRejectionModalVisible(true)
                }}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  const pendingTransactions = transactions.filter(t => t.status === 'pending')
  const approvedTransactions = transactions.filter(t => t.status === 'approved')
  const completedTransactions = transactions.filter(t => t.status === 'completed')
  const rejectedTransactions = transactions.filter(t => t.status === 'rejected')

  return (
    <DashboardLayout activeKey="transactions">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Transaction Management</h2>
          <p className="text-gray-600">Manage parts requests from mechanics</p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Requests"
                value={stats.pendingCount}
                prefix={<ClockCircleOutlined className="text-orange-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Approved"
                value={stats.approvedCount}
                prefix={<CheckCircleOutlined className="text-green-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Rejected"
                value={stats.rejectedCount}
                prefix={<CloseCircleOutlined className="text-red-600" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={stats.totalRevenue}
                precision={2}
                prefix={<DollarOutlined className="text-purple-600" />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="pending">
          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                Pending
                <Badge count={pendingTransactions.length} className="ml-2" />
              </span>
            } 
            key="pending"
          >
            <Card>
              <Table
                columns={baseColumns}
                dataSource={pendingTransactions}
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
                <CheckCircleOutlined />
                Approved
                <Badge count={approvedTransactions.length} className="ml-2" />
              </span>
            } 
            key="approved"
          >
            <Card>
              <Table
                columns={baseColumns.filter(col => col.key !== 'actions')}
                dataSource={approvedTransactions}
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
                <DollarOutlined />
                Completed
                <Badge count={completedTransactions.length} className="ml-2" />
              </span>
            } 
            key="completed"
          >
            <Card>
              <Table
                columns={baseColumns.filter(col => col.key !== 'actions')}
                dataSource={completedTransactions}
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
                <CloseCircleOutlined />
                Rejected
                <Badge count={rejectedTransactions.length} className="ml-2" />
              </span>
            } 
            key="rejected"
          >
            <Card>
              <Table
                columns={baseColumns.filter(col => col.key !== 'actions')}
                dataSource={rejectedTransactions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* View Transaction Details Modal */}
        <Modal
          title="Transaction Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div>
                <h4 className="font-semibold mb-3">Transaction Information</h4>
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>Transaction ID:</strong> {selectedTransaction.id}</p>
                    <p><strong>Status:</strong> <Tag color={getStatusColor(selectedTransaction.status)}>{selectedTransaction.status.toUpperCase()}</Tag></p>
                    <p><strong>Date:</strong> {dayjs(selectedTransaction.created_at).format('MMMM DD, YYYY HH:mm')}</p>
                    <p><strong>Quantity:</strong> {selectedTransaction.quantity}</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Unit Price:</strong> ${selectedTransaction.unit_price.toFixed(2)}</p>
                    <p><strong>Total Amount:</strong> <span className="font-semibold text-green-600">${selectedTransaction.total_amount.toFixed(2)}</span></p>
                    {selectedTransaction.approved_at && (
                      <p><strong>Approved:</strong> {dayjs(selectedTransaction.approved_at).format('MMM DD, YYYY HH:mm')}</p>
                    )}
                  </Col>
                </Row>
              </div>

              {/* Part Details */}
              <div>
                <h4 className="font-semibold mb-3">Part Details</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Row gutter={16}>
                    <Col span={16}>
                      <h5 className="font-medium">{selectedTransaction.part?.name}</h5>
                      <p><strong>Brand:</strong> {selectedTransaction.part?.brand}</p>
                      <p><strong>Part Number:</strong> {selectedTransaction.part?.part_number}</p>
                      <p><strong>Category:</strong> {selectedTransaction.part?.category}</p>
                      <p><strong>Current Stock:</strong> {selectedTransaction.part?.stock} units</p>
                    </Col>
                    {selectedTransaction.part?.image_url && (
                      <Col span={8}>
                        <img
                          src={selectedTransaction.part.image_url}
                          alt={selectedTransaction.part.name}
                          className="w-full h-24 object-cover rounded"
                        />
                      </Col>
                    )}
                  </Row>
                </div>
              </div>

              {/* Mechanic Details */}
              <div>
                <h4 className="font-semibold mb-3">Mechanic Information</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p><UserOutlined className="mr-2" /><strong>Name:</strong> {selectedTransaction.mechanic?.name}</p>
                  <p><PhoneOutlined className="mr-2" /><strong>Phone:</strong> {selectedTransaction.mechanic?.phone}</p>
                  <p><strong>Email:</strong> {selectedTransaction.mechanic?.email}</p>
                </div>
              </div>

              {/* Service Request Details */}
              {selectedTransaction.request && (
                <div>
                  <h4 className="font-semibold mb-3">Associated Service Request</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p><strong>Title:</strong> {selectedTransaction.request.title}</p>
                    <p><strong>Vehicle:</strong> {selectedTransaction.request.car?.make} {selectedTransaction.request.car?.model} ({selectedTransaction.request.car?.year})</p>
                    <p><strong>Owner:</strong> {selectedTransaction.request.owner?.name}</p>
                    <p><strong>Urgency:</strong> <Tag color={getPriorityColor(selectedTransaction.request.urgency)}>{selectedTransaction.request.urgency.toUpperCase()}</Tag></p>
                    <p><strong>Description:</strong> {selectedTransaction.request.description}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.notes && (
                <div>
                  <h4 className="font-semibold mb-3">Notes</h4>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p>{selectedTransaction.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Rejection Modal */}
        <Modal
          title="Reject Transaction"
          open={rejectionModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setRejectionModalVisible(false)
            form.resetFields()
          }}
          okText="Reject"
          okType="danger"
        >
          <Form
            form={form}
            onFinish={(values) => {
              if (selectedTransaction) {
                handleRejectTransaction(selectedTransaction.id, values.reason)
              }
            }}
            layout="vertical"
          >
            <Form.Item
              name="reason"
              label="Rejection Reason"
              rules={[{ required: true, message: 'Please provide a reason for rejection' }]}
            >
              <TextArea
                rows={4}
                placeholder="Please provide a detailed reason for rejecting this request..."
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 