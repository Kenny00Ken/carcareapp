'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  message, 
  Row, 
  Col,
  InputNumber,
  DatePicker,
  Spin,
  Upload
} from 'antd'
import { CarOutlined, SaveOutlined, LeftOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { MultipleImageUpload } from '@/components/common/MultipleImageUpload'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Car } from '@/types'
import dayjs from 'dayjs'

const { Option } = Select

export default function EditCarPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [car, setCar] = useState<Car | null>(null)
  const [form] = Form.useForm()
  const [carImages, setCarImages] = useState<string[]>([])

  const carId = params.id as string

  useEffect(() => {
    if (user?.id && carId) {
      loadCar()
    }
  }, [user, carId])

  const loadCar = async () => {
    setLoading(true)
    try {
      const carData = await DatabaseService.getCar(carId)
      if (carData && carData.owner_id === user!.id) {
        setCar(carData)
        // Initialize images from car data
        const existingImages = []
        if (carData.image_url) {
          existingImages.push(carData.image_url)
        }
        if (carData.image_urls && Array.isArray(carData.image_urls)) {
          // Merge and remove duplicates
          const allImages = [...existingImages, ...carData.image_urls]
          const uniqueImages = Array.from(new Set(allImages))
          setCarImages(uniqueImages)
        } else {
          setCarImages(existingImages)
        }
        
        form.setFieldsValue({
          ...carData,
          purchase_date: carData.purchase_date ? dayjs(carData.purchase_date as string) : null
        })
      } else {
        message.error('Car not found or access denied')
        router.push('/dashboard/car-owner/cars')
      }
    } catch (error) {
      console.error('Error loading car:', error)
      message.error('Failed to load car details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true)
    try {
      const updateData = {
        ...values,
        purchase_date: values.purchase_date ? (values.purchase_date as any).format('YYYY-MM-DD') : null,
        image_url: carImages[0] || null, // Primary image
        image_urls: carImages, // All images
      }
      
      // Filter out undefined values to prevent Firestore errors
      const cleanedUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      )
      
      await DatabaseService.updateCar(carId, cleanedUpdateData)
      message.success('Car updated successfully!')
      router.push('/dashboard/car-owner/cars')
    } catch (error) {
      console.error('Error updating car:', error)
      message.error('Failed to update car')
    } finally {
      setLoading(false)
    }
  }

  const handleImagesChange = (urls: string[]) => {
    setCarImages(urls)
  }

  const handleBack = () => {
    router.push('/dashboard/car-owner/cars')
  }

  const handleImageUpload = (uploadedUrls: string[], _primaryIndex: number) => {
    // Implementation of handleImageUpload
  }

  if (!car) {
    return (
      <DashboardLayout activeKey="cars">
        <div className="flex justify-center items-center h-64">
          <div>Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeKey="cars">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button icon={<LeftOutlined />} onClick={handleBack}>
            Back to Cars
          </Button>
          <div>
            <h2 className="text-2xl font-bold mb-2">Edit Car</h2>
            <p className="text-gray-600">Update your vehicle information</p>
          </div>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="make"
                  label="Make"
                  rules={[{ required: true, message: 'Please enter car make' }]}
                >
                  <Input placeholder="e.g., Toyota" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="model"
                  label="Model"
                  rules={[{ required: true, message: 'Please enter car model' }]}
                >
                  <Input placeholder="e.g., Camry" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="year"
                  label="Year"
                  rules={[{ required: true, message: 'Please enter car year' }]}
                >
                  <InputNumber
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    style={{ width: '100%' }}
                    placeholder="2020"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="color"
                  label="Color"
                >
                  <Input placeholder="e.g., Red" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="license_plate"
                  label="License Plate"
                >
                  <Input placeholder="ABC-123" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vin"
                  label="VIN Number"
                >
                  <Input placeholder="Vehicle Identification Number" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="mileage"
                  label="Current Mileage"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="50000"
                    addonAfter="miles"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="purchase_date"
                  label="Purchase Date"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea
                rows={4}
                placeholder="Any additional notes about your vehicle..."
              />
            </Form.Item>

            {/* Car Images */}
            <Form.Item
              label="Car Photos"
              extra="Update photos of your car. The first image will be the primary photo displayed to mechanics."
            >
              <MultipleImageUpload
                value={carImages}
                onChange={handleImagesChange}
                folder="cars"
                maxCount={5}
                buttonText="Update Car Photos"
                className="w-full"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex space-x-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Update Car
                </Button>
                <Button onClick={handleBack}>
                  Cancel
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
