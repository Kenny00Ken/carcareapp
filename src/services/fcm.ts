'use client'

import { getMessagingInstance } from './firebase'
import { getToken, onMessage, MessagePayload } from 'firebase/messaging'
import { DatabaseService } from './database'

export class FCMService {
  private static messaging: any = null
  private static vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || 'BLU9PEgJczPp8nKOADTXOK8H3_MNjJ6cBgA_y5r5A-K9jgW-ufb3w8JNQAq-k-Zz4d8gSs6w3-K6-o0y6MaQ'

  static async initialize(autoRequest: boolean = true): Promise<void> {
    try {
      this.messaging = await getMessagingInstance()
      if (!this.messaging) {
        console.log('FCM not supported in this browser')
        return
      }

      // Check current permission status
      const permission = Notification.permission
      console.log('Current notification permission:', permission)

      if (permission === 'granted') {
        console.log('Notification permission already granted.')
        await this.getToken()
      } else if (permission === 'default' && autoRequest) {
        // Only auto-request if permission is default (not explicitly denied)
        console.log('Auto-requesting notification permission...')
        await this.requestPermission()
      } else {
        console.log('Notification permission denied by user')
      }
    } catch (error) {
      console.error('Error initializing FCM:', error)
    }
  }

  static async requestPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission()
      console.log('Notification permission result:', permission)
      
      if (permission === 'granted') {
        console.log('Notification permission granted!')
        await this.getToken()
      }
      
      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  static getPermissionStatus(): NotificationPermission {
    return Notification.permission
  }

  static async getToken(userId?: string): Promise<string | null> {
    try {
      if (!this.messaging) return null

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      })

      if (token && userId) {
        // Store token in database for the user
        await DatabaseService.updateUser(userId, { fcm_token: token })
      }

      return token
    } catch (error) {
      console.error('Error getting FCM token:', error)
      return null
    }
  }

  static async subscribeToMessages(
    onMessageReceived: (payload: MessagePayload) => void
  ): Promise<void> {
    try {
      if (!this.messaging) return

      onMessage(this.messaging, (payload) => {
        console.log('Message received:', payload)
        onMessageReceived(payload)
      })
    } catch (error) {
      console.error('Error subscribing to messages:', error)
    }
  }

  static async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // Get user's FCM token
      const user = await DatabaseService.getUser(userId)
      if (!user?.fcm_token) {
        console.log('No FCM token found for user:', userId)
        return
      }

      // Create notification in database
      await DatabaseService.createNotification({
        user_id: userId,
        title,
        message: body,
        type: data?.type || 'info',
        timestamp: new Date().toISOString(),
        read: false,
        data
      })

      // Send via FCM (would be handled by cloud function in production)
      if (typeof window !== 'undefined') {
        // Browser notification for immediate feedback
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'car-care-notification'
        })
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  static async sendRequestNotificationToMechanic(
    mechanicId: string,
    requestData: {
      requestId: string
      title: string
      carInfo: string
      urgency: string
      location: string
    }
  ): Promise<void> {
    const title = 'New Service Request Available'
    const body = `${requestData.carInfo}: ${requestData.title} (${requestData.urgency.toUpperCase()} priority)`
    
    await this.sendNotificationToUser(mechanicId, title, body, {
      type: 'request_update',
      request_id: requestData.requestId,
      car_info: requestData.carInfo,
      urgency: requestData.urgency,
      location: requestData.location,
      action: 'view_requests'
    })
  }

  static async sendStatusUpdateToOwner(
    ownerId: string,
    updateData: {
      requestId: string
      status: string
      carInfo: string
      mechanicName?: string
      message?: string
    }
  ): Promise<void> {
    const title = 'Service Request Update'
    const body = updateData.message || `Your ${updateData.carInfo} service request status: ${updateData.status.replace('_', ' ').toUpperCase()}`
    
    await this.sendNotificationToUser(ownerId, title, body, {
      type: 'request_update',
      request_id: updateData.requestId,
      car_info: updateData.carInfo,
      mechanic_name: updateData.mechanicName,
      status: updateData.status,
      action: 'view_request'
    })
  }

  static async sendDiagnosisNotificationToOwner(
    ownerId: string,
    diagnosisData: {
      requestId: string
      carInfo: string
      mechanicName: string
      estimatedCost?: number
      title: string
    }
  ): Promise<void> {
    const title = 'Diagnosis Complete'
    const body = `Diagnosis for your ${diagnosisData.carInfo} is ready. ${diagnosisData.estimatedCost ? `Estimated cost: GHS ${diagnosisData.estimatedCost}` : ''}`
    
    await this.sendNotificationToUser(ownerId, title, body, {
      type: 'diagnosis',
      request_id: diagnosisData.requestId,
      car_info: diagnosisData.carInfo,
      mechanic_name: diagnosisData.mechanicName,
      amount: diagnosisData.estimatedCost,
      action: 'view_diagnosis'
    })
  }

  static async sendMessageNotification(
    recipientId: string,
    messageData: {
      requestId: string
      senderName: string
      carInfo: string
      messagePreview: string
    }
  ): Promise<void> {
    const title = `New message from ${messageData.senderName}`
    const body = `${messageData.carInfo}: ${messageData.messagePreview}`
    
    await this.sendNotificationToUser(recipientId, title, body, {
      type: 'message',
      request_id: messageData.requestId,
      car_info: messageData.carInfo,
      sender_name: messageData.senderName,
      action: 'view_chat'
    })
  }
}

// Service worker registration for FCM
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      console.log('Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
} 