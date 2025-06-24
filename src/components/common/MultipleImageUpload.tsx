'use client'

import React, { useState, useCallback } from 'react'
import { Upload, Button, Image, Progress, Space, Typography, Card, Row, Col, Modal, message } from 'antd'
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DragOutlined,
  PlusOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons'
import { StorageService } from '@/services/storage'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'

const { Text, Title } = Typography

interface ImageItem {
  id: string
  url: string
  name: string
  isPrimary?: boolean
}

interface MultipleImageUploadProps {
  value?: string[]
  onChange?: (urls: string[]) => void
  folder?: string
  maxCount?: number
  disabled?: boolean
  accept?: string
  className?: string
  buttonText?: string
  resize?: boolean
  maxWidth?: number
  maxHeight?: number
  allowReorder?: boolean
  showPrimarySelector?: boolean
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  value = [],
  onChange,
  folder = 'cars',
  maxCount = 5,
  disabled = false,
  accept = 'image/*',
  className,
  buttonText = 'Upload Car Images',
  resize = true,
  maxWidth = 1200,
  maxHeight = 800,
  allowReorder = true,
  showPrimarySelector = true,
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Convert URLs to ImageItems
  const images: ImageItem[] = value.map((url, index) => ({
    id: `img-${index}`,
    url,
    name: `Car Image ${index + 1}`,
    isPrimary: index === 0
  }))

  const handleUpload = async (file: File) => {
    if (value.length >= maxCount) {
      message.warning(`Maximum ${maxCount} images allowed`)
      return
    }

    const fileId = `${Date.now()}-${file.name}`
    
    try {
      setUploading(true)
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

      // Validate file
      const validation = StorageService.validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
        }))
      }, 100)

      let finalFile = file
      if (resize) {
        finalFile = await StorageService.resizeImage(file, maxWidth, maxHeight)
      }

      const downloadURL = await StorageService.uploadGeneralImage(finalFile, folder)
      
      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
      
      // Add new image to the list
      const newUrls = [...value, downloadURL]
      onChange?.(newUrls)

      message.success(`Image uploaded successfully!`)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      message.error(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileId]
          return newProgress
        })
      }, 1000)
    }
  }

  const handleRemove = async (index: number) => {
    try {
      const urlToRemove = value[index]
      await StorageService.deleteImage(urlToRemove)
      
      const newUrls = value.filter((_, i) => i !== index)
      onChange?.(newUrls)
      message.success('Image removed successfully')
    } catch (error) {
      console.error('Error removing image:', error)
      message.error('Failed to remove image')
    }
  }

  const handlePreview = (url: string, title: string) => {
    setPreviewImage(url)
    setPreviewTitle(title)
    setPreviewVisible(true)
  }

  const handleSetPrimary = (index: number) => {
    if (index === 0) return // Already primary
    
    const newUrls = [...value]
    const [primaryImage] = newUrls.splice(index, 1)
    newUrls.unshift(primaryImage)
    onChange?.(newUrls)
    message.success('Primary image updated')
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex === dropIndex) return

    const newUrls = [...value]
    const [draggedImage] = newUrls.splice(dragIndex, 1)
    newUrls.splice(dropIndex, 0, draggedImage)
    onChange?.(newUrls)
  }

  const uploadProps: UploadProps = {
    name: 'file',
    accept,
    disabled: disabled || uploading || value.length >= maxCount,
    multiple: true,
    beforeUpload: (file) => {
      handleUpload(file)
      return false // Prevent default upload
    },
    showUploadList: false,
  }

  return (
    <div className={className}>
      <Space direction="vertical" size="large" className="w-full">
        {/* Upload Button and Info */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={5} className="!mb-1">Car Images ({value.length}/{maxCount})</Title>
            <Text type="secondary" className="text-sm">
              Upload multiple photos of your car. The first image will be the primary photo.
            </Text>
          </div>
          
          <Upload {...uploadProps}>
            <Button 
              type="primary"
              icon={<PlusOutlined />} 
              loading={uploading}
              disabled={disabled || value.length >= maxCount}
            >
              {value.length >= maxCount ? 'Maximum reached' : buttonText}
            </Button>
          </Upload>
        </div>

        {/* Upload Progress Indicators */}
        {Object.keys(uploadProgress).length > 0 && (
          <Card size="small">
            <Space direction="vertical" className="w-full">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId}>
                  <Text className="text-sm">Uploading image...</Text>
                  <Progress 
                    percent={progress} 
                    size="small" 
                    status={progress === 100 ? 'success' : 'active'}
                  />
                </div>
              ))}
            </Space>
          </Card>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <Card>
            <Row gutter={[16, 16]}>
              {images.map((image, index) => (
                <Col key={image.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    size="small"
                    className={`relative transition-all duration-200 ${
                      dragOverIndex === index ? 'ring-2 ring-blue-500' : ''
                    } ${index === 0 ? 'border-blue-500 border-2' : ''}`}
                    bodyStyle={{ padding: 8 }}
                    draggable={allowReorder && !disabled}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {/* Primary Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <StarFilled className="mr-1" />
                          Primary
                        </div>
                      </div>
                    )}

                    {/* Drag Handle */}
                    {allowReorder && !disabled && (
                      <div className="absolute top-2 right-2 z-10 cursor-move">
                        <div className="bg-gray-800 bg-opacity-50 text-white p-1 rounded">
                          <DragOutlined />
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative group">
                      <Image
                        width="100%"
                        height={120}
                        src={image.url}
                        alt={image.name}
                        className="object-cover rounded"
                        style={{ objectFit: 'cover' }}
                        preview={false}
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded">
                        <Space>
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            className="text-white hover:text-blue-400"
                            onClick={() => handlePreview(image.url, image.name)}
                          />
                          {showPrimarySelector && index !== 0 && (
                            <Button
                              type="text"
                              size="small"
                              icon={<StarOutlined />}
                              className="text-white hover:text-yellow-400"
                              onClick={() => handleSetPrimary(index)}
                              title="Set as primary image"
                            />
                          )}
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            className="text-white hover:text-red-400"
                            onClick={() => handleRemove(index)}
                            disabled={disabled}
                          />
                        </Space>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="mt-2 text-center">
                      <Text className="text-xs text-gray-500 block">
                        Image {index + 1}
                        {index === 0 && ' (Primary)'}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <Card className="text-center py-8">
            <Space direction="vertical" size="middle">
              <div className="text-4xl text-gray-300">📷</div>
              <div>
                <Title level={4} type="secondary">No images uploaded yet</Title>
                <Text type="secondary">
                  Upload photos of your car to help mechanics identify and work on it
                </Text>
              </div>
              <Upload {...uploadProps}>
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  Upload Your First Image
                </Button>
              </Upload>
            </Space>
          </Card>
        )}

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <Text className="text-sm text-blue-700 dark:text-blue-300 block mb-2">
            <strong>Tips for better car photos:</strong>
          </Text>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>• Take photos in good lighting (natural light is best)</li>
            <li>• Include exterior views from different angles</li>
            <li>• Add interior shots if relevant to the service</li>
            <li>• Capture any specific areas that need attention</li>
            <li>• The first image will be used as the main car photo</li>
          </ul>
        </div>

        {/* Full Size Preview Modal */}
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width="80%"
          style={{ maxWidth: 1000 }}
        >
          <Image
            alt="Car image preview"
            style={{ width: '100%' }}
            src={previewImage}
          />
        </Modal>
      </Space>
    </div>
  )
} 