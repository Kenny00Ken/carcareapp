// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAc4NLbLEz5-PmNygKSJh5oZ31x0otP5LY",
  authDomain: "mechanicsweb.firebaseapp.com",
  projectId: "mechanicsweb",
  storageBucket: "mechanicsweb.firebasestorage.app",
  messagingSenderId: "827236770261",
  appId: "1:827236770261:web:1e5e3fd414cfba28289d5c"
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'Car Care Notification'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'car-care-notification',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // Handle different types of notifications
  const notificationData = event.notification.data
  let url = '/'

  if (notificationData?.type === 'request_update') {
    if (notificationData.action === 'view_requests') {
      url = '/dashboard/mechanic/requests'
    } else if (notificationData.action === 'view_request') {
      url = `/dashboard/car-owner/requests/${notificationData.request_id}`
    }
  } else if (notificationData?.type === 'diagnosis') {
    url = `/dashboard/car-owner/requests/${notificationData.request_id}`
  } else if (notificationData?.type === 'message') {
    url = `/dashboard/car-owner/requests/${notificationData.request_id}/chat`
  }

  // Open the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window if no existing window found
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
}) 