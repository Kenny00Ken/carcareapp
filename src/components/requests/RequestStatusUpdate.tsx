'use client'

import React, { useState } from 'react'
import { Modal, Select, Button, Form, Input, Space, Typography, Alert, message } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, ToolOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Request, RequestStatus } from '@/types'
import { DatabaseService } from '@/services/database'
import { useAuth } from '@/contexts/AuthContext'

const { Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface RequestStatusUpdateProps {
  visible: boolean
  onCancel: () => void
  request: Request
  onUpdate?: (updatedRequest: Request) => void
}

const statusOptions = [
  {
    value: 'claimed' as RequestStatus,
    label: 'Claimed',
    icon: <ClockCircleOutlined />,
    description: 'Request has been claimed by mechanic',
    color: 'blue'
  },
  {
    value: 'diagnosed' as RequestStatus,
    label: 'Diagnosed',
    icon: <ToolOutlined />,
    description: 'Initial diagnosis completed',
    color: 'cyan'
  },
  {
    value: 'quoted' as RequestStatus,
    label: 'Quoted',
    icon: <ShoppingCartOutlined />,
    description: 'Quote provided to customer',
    color: 'purple'
  },
  {
    value: 'approved' as RequestStatus,
    label: 'Approved',
    icon: <CheckCircleOutlined />,
    description: 'Customer approved the quote',
    color: 'green'
  },
  {
    value: 'in_progress' as RequestStatus,
    label: 'In Progress',
    icon: <ToolOutlined />,
    description: 'Work is currently being performed',
    color: 'geekblue'
  },
  {
    value: 'parts_requested' as RequestStatus,
    label: 'Parts Requested',
    icon: <ShoppingCartOutlined />,
    description: 'Parts have been requested from dealer',
    color: 'gold'
  },
  {
    value: 'parts_received' as RequestStatus,
    label: 'Parts Received',
    icon: <CheckCircleOutlined />,
    description: 'Required parts have been received',
    color: 'lime'
  },
  {
    value: 'completed' as RequestStatus,
    label: 'Completed',
    icon: <CheckCircleOutlined />,
    description: 'Service has been completed',
    color: 'green'
  }
]

export const RequestStatusUpdate: React.FC<RequestStatusUpdateProps> = ({
  visible,
  onCancel,
  request,
  onUpdate
}) => {
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | undefined>(request.status)

  const getCurrentStatusIndex = () => {
    return statusOptions.findIndex(option => option.value === request.status)
  }

  const getAvailableStatuses = () => {
    const currentIndex = getCurrentStatusIndex()
    // Allow selecting current status and next logical statuses
    return statusOptions.filter((_, index) => index >= currentIndex)
  }

  const handleStatusChange = (status: RequestStatus) => {
    setSelectedStatus(status)
  }

  const handleSubmit = async (values: any) => {
    if (!user || !selectedStatus) return

    try {
      setLoading(true)
      
      // Update request status with optional notes
      const updateData = {
        status: selectedStatus,
        ...(values.notes && { status_notes: values.notes }),
        updated_at: new Date().toISOString()
      }

      await DatabaseService.updateRequest(request.id, updateData)

      // Create activity log
      await DatabaseService.logActivity(
        user.id,
        'status_updated',
        `Request status updated to: ${selectedStatus.replace('_', ' ')}`,
        request.id,
        { 
          previous_status: request.status, 
          new_status: selectedStatus,
          notes: values.notes 
        }
      )

      // Send notification to car owner via FCM
      try {
        const { FCMService } = await import('@/services/fcm')
        await FCMService.sendStatusUpdateToOwner(request.owner_id, {
          requestId: request.id,
          status: selectedStatus,
          carInfo: request.car ? `${request.car.make} ${request.car.model}` : 'Your vehicle',
          mechanicName: user.name,
          message: values.notes ? `Status updated with note: ${values.notes}` : undefined
        })
      } catch (fcmError) {
        console.error('Error sending FCM notification:', fcmError)
        // Still create database notification as fallback
        await DatabaseService.createNotification({
          user_id: request.owner_id,
          title: 'Request Status Updated',
          message: `Your request "${request.title}" status has been updated to: ${selectedStatus.replace('_', ' ')}`,
          type: 'request_update',
          timestamp: new Date().toISOString(),
          read: false,
          data: {
            request_id: request.id,
            new_status: selectedStatus,
            mechanic_name: user.name,
            action: 'view_request'
          }
        })
      }

      message.success('Request status updated successfully')
      
      // Call the onUpdate callback with updated request
      if (onUpdate) {
        onUpdate({
          ...request,
          status: selectedStatus,
          status_notes: values.notes,
          updated_at: new Date().toISOString()
        })
      }
      
      onCancel()
      form.resetFields()
    } catch (error) {
      console.error('Error updating request status:', error)
      message.error('Failed to update request status')
    } finally {
      setLoading(false)
    }
  }

  const selectedStatusOption = statusOptions.find(option => option.value === selectedStatus)

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ToolOutlined className="text-blue-500" />
          <span>Update Request Status</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Request Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Text strong className="block mb-2">Request Details</Text>
          <Paragraph className="!mb-2">
            <strong>Title:</strong> {request.title}
          </Paragraph>
          <Paragraph className="!mb-2">
            <strong>Vehicle:</strong> {request.car ? `${request.car.make} ${request.car.model}` : 'Unknown'}
          </Paragraph>
          <Paragraph className="!mb-0">
            <strong>Current Status:</strong> 
            <span className="ml-2 capitalize text-blue-600 font-medium">
              {request.status?.replace('_', ' ')}
            </span>
          </Paragraph>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            status: request.status
          }}
        >
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select
              placeholder="Select new status"
              size="large"
              onChange={handleStatusChange}
              value={selectedStatus}
            >
              {getAvailableStatuses().map(option => (
                <Option key={option.value} value={option.value}>
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedStatusOption && (
            <Alert
              message={selectedStatusOption.label}
              description={selectedStatusOption.description}
              type="info"
              showIcon
              className="mb-4"
            />
          )}

          <Form.Item
            name="notes"
            label="Additional Notes (Optional)"
          >
            <TextArea
              placeholder="Add any additional notes about this status update..."
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Space className="w-full justify-end">
              <Button onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!selectedStatus || selectedStatus === request.status}
              >
                Update Status
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Alert
          message="Important"
          description="The car owner will be automatically notified when you update the request status."
          type="warning"
          showIcon
        />
      </div>
    </Modal>
  )
}

export default RequestStatusUpdate