'use client'

import React, { useState } from 'react'
import { Card, Form, Input, Button, Select, InputNumber, Row, Col, Typography, Space, message, Divider } from 'antd'
import { CarOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ImageUpload } from '@/components/common/ImageUpload'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography
const { Option } = Select

export default function AddCarPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [carImage, setCarImage] = useState<string | undefined>(undefined)

  const currentYear = new Date().getFullYear()

  // Popular car makes and models data
  const carMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda',
    'Subaru', 'Lexus', 'Infiniti', 'Acura', 'Volvo', 'Jaguar',
    'Land Rover', 'Porsche', 'Tesla', 'Cadillac', 'Lincoln',
    'Buick', 'GMC', 'Jeep', 'Ram', 'Dodge', 'Chrysler', 'Other'
  ].sort()

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('You must be logged in to add a car')
      return
    }

    setLoading(true)
    try {
      const carData = {
        owner_id: user.id,
        make: values.make,
        model: values.model,
        year: values.year,
        image_url: carImage,
        // Additional fields that could be added later - filter out undefined values
        ...(values.color && { color: values.color }),
        ...(values.license_plate && { license_plate: values.license_plate }),
        ...(values.vin && { vin: values.vin }),
        ...(values.mileage && { mileage: values.mileage }),
        ...(values.engine_type && { engine_type: values.engine_type }),
        ...(values.transmission && { transmission: values.transmission }),
        ...(values.notes && { notes: values.notes }),
      }

      const carId = await DatabaseService.createCar(carData)
      
      message.success('Car added successfully!')
      router.push('/dashboard/car-owner/cars')
    } catch (error) {
      console.error('Error adding car:', error)
      message.error('Failed to add car. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string | null) => {
    setCarImage(url || undefined)
  }

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            size="large"
          >
            Back
          </Button>
          <div>
            <Title level={2}>Add New Car</Title>
            <Text type="secondary">
              Enter your vehicle information to start tracking maintenance
            </Text>
          </div>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-4"
            initialValues={{
              year: currentYear,
            }}
          >
            {/* Basic Information */}
            <div>
              <Title level={4}>Basic Information</Title>
              <Divider />
              
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="make"
                    label="Make"
                    rules={[{ required: true, message: 'Please select car make' }]}
                  >
                    <Select
                      placeholder="Select car make"
                      size="large"
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                      }
                    >
                      {carMakes.map(make => (
                        <Option key={make} value={make}>{make}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="model"
                    label="Model"
                    rules={[{ required: true, message: 'Please enter car model' }]}
                  >
                    <Input 
                      placeholder="e.g., Camry, Civic, Focus"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="year"
                    label="Year"
                    rules={[{ required: true, message: 'Please select year' }]}
                  >
                    <InputNumber
                      min={1900}
                      max={currentYear + 1}
                      placeholder="Year"
                      size="large"
                      className="w-full"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Additional Details */}
            <div>
              <Title level={4}>Additional Details</Title>
              <Divider />
              
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="color"
                    label="Color"
                  >
                    <Input 
                      placeholder="e.g., Red, Blue, Silver"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="license_plate"
                    label="License Plate"
                  >
                    <Input 
                      placeholder="License plate number"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="vin"
                    label="VIN (Vehicle Identification Number)"
                  >
                    <Input 
                      placeholder="17-character VIN"
                      size="large"
                      maxLength={17}
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="mileage"
                    label="Current Mileage"
                  >
                    <InputNumber
                      min={0}
                      placeholder="Miles"
                      size="large"
                      className="w-full"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value: any) => value?.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="engine_type"
                    label="Engine Type"
                  >
                    <Select
                      placeholder="Select engine type"
                      size="large"
                      allowClear
                    >
                      <Option value="gasoline">Gasoline</Option>
                      <Option value="diesel">Diesel</Option>
                      <Option value="hybrid">Hybrid</Option>
                      <Option value="electric">Electric</Option>
                      <Option value="plugin-hybrid">Plug-in Hybrid</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="transmission"
                    label="Transmission"
                  >
                    <Select
                      placeholder="Select transmission"
                      size="large"
                      allowClear
                    >
                      <Option value="automatic">Automatic</Option>
                      <Option value="manual">Manual</Option>
                      <Option value="cvt">CVT</Option>
                      <Option value="semi-automatic">Semi-Automatic</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Car Image */}
            <div>
              <Title level={4}>Car Photo</Title>
              <Divider />
              
              <Form.Item
                label="Upload car photo (optional)"
                extra="Supported formats: JPEG, PNG, WebP • Max size: 5MB"
              >
                <ImageUpload
                  value={carImage}
                  onChange={handleImageUpload}
                  folder="cars"
                  buttonText="Upload Car Photo"
                  className="w-full"
                />
              </Form.Item>
            </div>

            {/* Notes */}
            <div>
              <Title level={4}>Notes</Title>
              <Divider />
              
              <Form.Item
                name="notes"
                label="Additional Notes"
              >
                <Input.TextArea
                  placeholder="Any additional information about your car..."
                  rows={4}
                  size="large"
                />
              </Form.Item>
            </div>

            {/* Submit Buttons */}
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Add Car
                </Button>
                <Button
                  onClick={() => router.back()}
                  size="large"
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DashboardLayout>
  )
} 