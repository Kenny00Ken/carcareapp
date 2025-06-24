'use client'

import React, { useState } from 'react'
import { Upload, Button, Image, Progress, Space, Typography } from 'antd'
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { StorageService } from '@/services/storage'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'

const { Text } = Typography

interface ImageUploadProps {
  value?: string
  onChange?: (url: string | null) => void
  folder?: string
  maxCount?: number
  disabled?: boolean
  accept?: string
  className?: string
  buttonText?: string
  showPreview?: boolean
  resize?: boolean
  maxWidth?: number
  maxHeight?: number
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = 'uploads',
  maxCount = 1,
  disabled = false,
  accept = 'image/*',
  className,
  buttonText = 'Upload Image',
  showPreview = true,
  resize = true,
  maxWidth = 800,
  maxHeight = 600,
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewVisible, setPreviewVisible] = useState(false)

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      setProgress(0)

      // Validate file
      const validation = StorageService.validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      let finalFile = file
      if (resize) {
        finalFile = await StorageService.resizeImage(file, maxWidth, maxHeight)
      }

      const downloadURL = await StorageService.uploadGeneralImage(finalFile, folder)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      onChange?.(downloadURL)
      
      // Update file list for display
      setFileList([{
        uid: '1',
        name: file.name,
        status: 'done',
        url: downloadURL,
      }])

    } catch (error: any) {
      console.error('Upload error:', error)
      setFileList([{
        uid: '1',
        name: file.name,
        status: 'error',
        error: error.message,
      }])
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleRemove = async () => {
    try {
      if (value) {
        await StorageService.deleteImage(value)
      }
      onChange?.(null)
      setFileList([])
    } catch (error) {
      console.error('Error removing image:', error)
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    accept,
    disabled: disabled || uploading,
    maxCount,
    fileList,
    beforeUpload: (file) => {
      handleUpload(file)
      return false // Prevent default upload
    },
    onRemove: handleRemove,
    showUploadList: false, // We'll create custom upload list
  }

  return (
    <div className={className}>
      <Space direction="vertical" size="middle" className="w-full">
        {/* Upload Button */}
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            disabled={disabled || (!!value && maxCount === 1)}
          >
            {uploading ? `Uploading... ${progress}%` : buttonText}
          </Button>
        </Upload>

        {/* Progress Bar */}
        {uploading && (
          <Progress 
            percent={progress} 
            size="small" 
            status={progress === 100 ? 'success' : 'active'}
          />
        )}

        {/* Image Preview */}
        {value && showPreview && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <Space align="start" size="middle">
              <div className="relative">
                <Image
                  width={100}
                  height={100}
                  src={value}
                  alt="Uploaded image"
                  className="object-cover rounded"
                  style={{ objectFit: 'cover' }}
                  preview={false}
                />
              </div>
              
              <div className="flex-1">
                <Text type="secondary" className="text-xs block mb-2">
                  Image uploaded successfully
                </Text>
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewVisible(true)}
                  >
                    Preview
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemove}
                    disabled={disabled}
                  >
                    Remove
                  </Button>
                </Space>
              </div>
            </Space>
          </div>
        )}

        {/* Full Size Preview Modal */}
        {value && (
          <Image
            width={0}
            height={0}
            src={value}
            alt="Full size preview"
            style={{ display: 'none' }}
            preview={{
              visible: previewVisible,
              onVisibleChange: setPreviewVisible,
            }}
          />
        )}

        {/* Upload Tips */}
        <Text type="secondary" className="text-xs">
          Supported formats: JPEG, PNG, WebP • Max size: 5MB
          {resize && ` • Images will be resized to ${maxWidth}x${maxHeight}`}
        </Text>
      </Space>
    </div>
  )
} 