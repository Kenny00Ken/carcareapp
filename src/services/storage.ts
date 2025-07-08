import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { v4 as uuidv4 } from 'uuid'

export class StorageService {
  // Upload image and return download URL
  static async uploadImage(
    file: File, 
    folder: string, 
    fileName?: string
  ): Promise<string> {
    try {
      // Generate unique filename if not provided
      const finalFileName = fileName || `${uuidv4()}_${file.name}`
      
      // Create storage reference
      const storageRef = ref(storage, `${folder}/${finalFileName}`)
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      console.log('Image uploaded successfully:', downloadURL)
      return downloadURL
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Upload car image
  static async uploadCarImage(carId: string, file: File): Promise<string> {
    return this.uploadImage(file, `cars/${carId}`)
  }

  // Upload diagnosis image
  static async uploadDiagnosisImage(diagnosisId: string, file: File): Promise<string> {
    return this.uploadImage(file, `diagnoses/${diagnosisId}`)
  }

  // Upload part image
  static async uploadPartImage(partId: string, file: File): Promise<string> {
    return this.uploadImage(file, `parts/${partId}`)
  }

  // Upload user profile image
  static async uploadUserProfileImage(userId: string, file: File): Promise<string> {
    return this.uploadImage(file, `users/${userId}/profile`)
  }

  // Upload general image
  static async uploadGeneralImage(file: File, folder = 'uploads'): Promise<string> {
    return this.uploadImage(file, folder)
  }

  // Delete image by URL
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl)
      await deleteObject(imageRef)
      console.log('Image deleted successfully')
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  // Validate file before upload
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Please upload a valid image file (JPEG, PNG, WebP)'
      }
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB'
      }
    }

    return { valid: true }
  }

  // Resize image before upload (optional - requires canvas)
  static async resizeImage(
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 600, 
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(resizedFile)
            } else {
              resolve(file) // Return original if resizing fails
            }
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Get storage path from URL
  static getStoragePathFromURL(url: string): string {
    try {
      const decodedUrl = decodeURIComponent(url)
      const matches = decodedUrl.match(/\/o\/(.+?)\?/)
      return matches ? matches[1] : ''
    } catch (error) {
      console.error('Error extracting storage path:', error)
      return ''
    }
  }
} 