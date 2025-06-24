'use client'

import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Typography, Image, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Car } from '@/types'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography

export default function CarsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadCars()
    }
  }, [user])

  const loadCars = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userCars = await DatabaseService.getCarsByOwner(user.id)
      setCars(userCars)
    } catch (error) {
      console.error('Error loading cars:', error)
      message.error('Failed to load cars')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (carId: string) => {
    try {
      setDeleteLoading(carId)
      await DatabaseService.deleteCar(carId)
      setCars(cars.filter(car => car.id !== carId))
      message.success('Car deleted successfully!')
    } catch (error) {
      console.error('Error deleting car:', error)
      message.error('Failed to delete car')
    } finally {
      setDeleteLoading(null)
    }
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      width: 100,
      render: (imageUrl: string, record: Car) => {
        // Get primary image from image_url or first from image_urls array
        let primaryImage = imageUrl
        if (!primaryImage && record.image_urls && Array.isArray(record.image_urls) && record.image_urls.length > 0) {
          primaryImage = record.image_urls[0]
        }
        
        const totalImages = record.image_urls ? record.image_urls.length : (imageUrl ? 1 : 0)
        
        return (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {primaryImage ? (
              <>
                <Image
                  src={primaryImage}
                  alt={`${record.make} ${record.model}`}
                  width={64}
                  height={64}
                  className="object-cover"
                  preview={false}
                />
                {totalImages > 1 && (
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-tl">
                    +{totalImages - 1}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-xs text-center">
                No Image
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: 'Make & Model',
      key: 'makeModel',
      render: (record: Car) => (
        <div>
          <div className="font-medium">{record.make} {record.model}</div>
          <div className="text-gray-500 text-sm">Year: {record.year}</div>
        </div>
      ),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      width: 100,
      sorter: (a: Car, b: Car) => a.year - b.year,
    },
    {
      title: 'Added',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
      sorter: (a: Car, b: Car) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: Car) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/dashboard/car-owner/cars/${record.id}`)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/dashboard/car-owner/cars/${record.id}/edit`)}
            title="Edit Car"
          />
          <Popconfirm
            title="Delete Car"
            description="Are you sure you want to delete this car?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.id}
              title="Delete Car"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (!user) {
    return (
      <DashboardLayout activeKey="cars">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="cars">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2}>My Cars</Title>
            <Text type="secondary">
              Manage your vehicle information and service history
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => router.push('/dashboard/car-owner/cars/add')}
          >
            Add New Car
          </Button>
        </div>

        <Card>
          {cars.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="text-6xl text-gray-300 mb-4">🚗</div>
                <Title level={3} type="secondary">No cars added yet</Title>
                <Text type="secondary">
                  Add your first car to start tracking maintenance and repairs
                </Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => router.push('/dashboard/car-owner/cars/add')}
              >
                Add Your First Car
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={cars}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} cars`,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
} 