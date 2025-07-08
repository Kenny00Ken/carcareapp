# Firebase Cloud Messaging Setup Guide

## Prerequisites
- Firebase project with FCM enabled
- Web Push Certificate (VAPID key pair)

## Setup Steps

### 1. Firebase Console Configuration
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. In the "Web configuration" section, generate a new key pair
3. Copy the generated key pair (public key will be used as VAPID key)

### 2. Environment Variables
Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_public_key_here
```

### 3. Service Worker
The service worker is already configured in `public/firebase-messaging-sw.js`. Make sure it's accessible at your domain root.

### 4. Notification Permissions
The app will automatically request notification permissions when users log in. Users need to allow notifications to receive real-time updates.

## Features Implemented

### Real-time Notifications
- **Mechanics**: Receive notifications when new service requests are created
- **Car Owners**: Receive notifications when:
  - Mechanic claims their request
  - Request status is updated
  - Diagnosis is completed
  - Messages are received

### Notification Types
- `request_update`: Service request status changes
- `diagnosis`: Diagnosis completed notifications
- `message`: Chat message notifications
- `transaction`: Transaction/payment notifications

### Navigation Actions
Clicking on notifications will automatically navigate users to the relevant page:
- **view_requests**: Navigate to mechanic requests list
- **view_request**: Navigate to specific request details
- **view_diagnosis**: Navigate to diagnosis details
- **view_chat**: Navigate to chat conversation

## Real-time Features

### Car Owner Dashboard
- Real-time car count updates
- Real-time active/completed request counts
- Live notification badge count

### Service Requests
- Real-time request list updates
- Live status changes
- Automatic mechanic notifications when requests are created

### Notifications
- Real-time notification badge in header
- Live notification list updates
- Clickable notifications with auto-navigation

## Testing

### Local Development
1. Ensure your local development server is running on HTTPS (required for FCM)
2. Allow notification permissions when prompted
3. Test creating service requests to verify mechanic notifications
4. Test status updates to verify car owner notifications

### Production
1. Deploy the service worker to your domain root
2. Configure your web server to serve the service worker with proper headers
3. Test across different browsers and devices

## Troubleshooting

### Common Issues
1. **Notifications not working**: Check browser permissions and HTTPS requirement
2. **Service worker not registering**: Verify file path and server configuration
3. **VAPID key errors**: Ensure the key is properly configured in environment variables

### Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited support (requires user interaction)
- Mobile browsers: Varies by platform

## Security Considerations
- VAPID keys should be kept secure
- Service worker should be served with appropriate cache headers
- User consent is required for notifications (handled automatically)

## Next Steps
For production deployment, consider:
1. Setting up Firebase Cloud Functions for server-side notification sending
2. Implementing notification analytics
3. Adding notification preferences for users
4. Implementing push notification scheduling 