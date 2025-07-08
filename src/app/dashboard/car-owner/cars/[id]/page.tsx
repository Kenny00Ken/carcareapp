'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Typography, Descriptions, message, Spin, Empty, Image, Row, Col } from 'antd'
import { EditOutlined, ArrowLeftOutlined, CarOutlined, PictureOutlined } from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Car } from '@/types'
import { useRouter, useParams } from 'next/navigation'

const { Title, Text } = Typography

export default function CarDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const carId = params.id as string

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && carId) {
      loadCarDetails()
    }
  }, [user, carId])

  const loadCarDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const carData = await DatabaseService.getCar(carId)

      if (!carData) {
        setError('Car not found')
        return
      }

      if (carData.owner_id !== user!.id) {
        setError('You do not have permission to view this car')
        return
      }

      setCar(carData)
    } catch (error) {
      console.error('Error loading car details:', error)
      setError('Failed to load car details')
      message.error('Failed to load car details')
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) {
    return (
      <DashboardLayout activeKey="cars">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" tip="Loading car details..." />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !car) {
    return (
      <DashboardLayout activeKey="cars">
        <div className="flex items-center justify-center h-64">
          <Empty description={error || 'Car not found'}>
            <Button type="primary" onClick={() => router.push('/dashboard/car-owner/cars')}>
              Back to Cars
            </Button>
          </Empty>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="cars">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/dashboard/car-owner/cars')}
              className="!w-full sm:!w-auto"
            >
              <span className="hidden sm:inline">Back to Cars</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <Title level={2} className="!mb-0 !text-lg sm:!text-xl md:!text-2xl">
                {car.make} {car.model} ({car.year})
              </Title>
              <Text type="secondary" className="!text-sm sm:!text-base">Car Details & Service History</Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="large"
            onClick={() => router.push(`/dashboard/car-owner/cars/${carId}/edit`)}
            className="!w-full sm:!w-auto"
          >
            <span className="hidden sm:inline">Edit Car</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>

        <Card 
          title={
            <div className="flex items-center">
              <CarOutlined className="mr-2" />
              <span className="text-sm sm:text-base">Vehicle Information</span>
            </div>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
            <Descriptions.Item label="Make">
              <Text strong>{car.make}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Model">
              <Text strong>{car.model}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Year">
              <Text strong>{car.year}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Color">
              <Text>{car.color || 'Not specified'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="License Plate">
              <Text>{car.license_plate || 'Not specified'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="VIN">
              <Text copyable={car.vin ? true : false}>
                {car.vin || 'Not specified'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mileage">
              <Text>{car.mileage ? `${car.mileage.toLocaleString()} km` : 'Not specified'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Engine Type">
              <Text>{(car.engine_type as string) || 'Not specified'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Transmission" span={2}>
              <Text>{(car.transmission as string) || 'Not specified'}</Text>
            </Descriptions.Item>
            {car.notes && (
              <Descriptions.Item label="Notes" span={2}>
                <Text>{car.notes as string}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Added" span={2}>
              <Text type="secondary">
                {new Date(car.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Car Images Gallery */}
        {(() => {
          const images = []
          if (car.image_url) images.push(car.image_url)
          if (car.image_urls && Array.isArray(car.image_urls)) {
            const allImages = [...images, ...car.image_urls]
            const uniqueImages = Array.from(new Set(allImages))
            return uniqueImages.length > 0 ? (
              <Card
                title={
                  <div className="flex items-center">
                    <PictureOutlined className="mr-2" />
                    <span className="text-sm sm:text-base">Car Photos ({uniqueImages.length})</span>
                  </div>
                }
              >
                <Row gutter={[16, 16]}>
                  {uniqueImages.map((imageUrl, index) => (
                    <Col key={index} xs={12} sm={8} md={6} lg={4}>
                      <div className="relative">
                        {index === 0 && (
                          <div className="absolute top-2 left-2 z-10">
                            <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Primary
                            </div>
                          </div>
                        )}
                        <Image
                          width="100%"
                          height={150}
                          src={imageUrl}
                          alt={`${car.make} ${car.model} - Image ${index + 1}`}
                          className="object-cover rounded-lg"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </Col>
                  ))}
                </Row>
                <div className="mt-4 text-center">
                  <Text type="secondary" className="text-xs sm:text-sm">
                    Click on any image to view in full size
                  </Text>
                </div>
              </Card>
            ) : (
              <Card
                title={
                  <div className="flex items-center">
                    <PictureOutlined className="mr-2" />
                    <span className="text-sm sm:text-base">Car Photos</span>
                  </div>
                }
              >
                <Empty 
                  description="No photos available"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button 
                    type="primary" 
                    onClick={() => router.push(`/dashboard/car-owner/cars/${carId}/edit`)}
                    className="!w-full sm:!w-auto"
                  >
                    Add Photos
                  </Button>
                </Empty>
              </Card>
            )
          }
          return null
        })()}
      </div>
    </DashboardLayout>
  )
}