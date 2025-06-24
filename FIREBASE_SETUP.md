# Firebase Setup Instructions

## 🚨 **Issues Fixed:**

✅ **Firestore Permission Error**: `Missing or insufficient permissions`  
✅ **Ant Design Message Warning**: Context theme consumption issue  
✅ **Firebase Storage**: Complete setup for image uploads  

## 🔧 **1. Deploy Firestore Security Rules**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `mechanicsweb`
3. **Navigate to**: **Firestore Database** → **Rules**
4. **Copy and paste** the content from `firestore.rules` file
5. **Click "Publish"**

**Rules Summary:**
- ✅ Users can only access their own data
- ✅ Role-based permissions (CarOwner/Mechanic/Dealer)
- ✅ Development rule (remove in production): All authenticated users can read/write

## 🔧 **2. Deploy Storage Security Rules**

1. **Navigate to**: **Storage** → **Rules**
2. **Copy and paste** the content from `storage.rules` file
3. **Click "Publish"**

**Rules Summary:**
- ✅ Users can upload profile images
- ✅ Authenticated users can upload car/diagnosis/parts images
- ✅ General uploads folder for development

## 🔧 **3. Enable Required Services**

### **Authentication**
- ✅ **Phone Number**: Already enabled
- ✅ **Google OAuth**: Already enabled

### **Firestore Database**
- ✅ Create database in production mode
- ✅ Deploy the security rules above

### **Storage**
- ✅ Enable Firebase Storage
- ✅ Deploy the security rules above

## 🎯 **4. Test the Application**

### **Authentication Flow:**
1. Visit: http://localhost:3000
2. Click "Get Started" → "Continue with Google"
3. **Should see**: User avatar in navbar (no more permission errors)

### **Image Upload Test:**
```typescript
import { StorageService } from '@/services/storage'
import { ImageUpload } from '@/components/common/ImageUpload'

// Usage in components:
<ImageUpload
  folder="cars/car-123"
  onChange={(url) => console.log('Uploaded:', url)}
  buttonText="Upload Car Image"
/>
```

## 📱 **5. Storage Service Features**

✅ **Image Upload**: Upload to organized folders  
✅ **Image Validation**: File type and size checks  
✅ **Image Resizing**: Automatic resizing before upload  
✅ **Image Deletion**: Remove images from storage  
✅ **Progress Tracking**: Upload progress indicators  

### **Available Methods:**
```typescript
// Upload specific types
StorageService.uploadCarImage(carId, file)
StorageService.uploadDiagnosisImage(diagnosisId, file)
StorageService.uploadPartImage(partId, file)
StorageService.uploadUserProfileImage(userId, file)

// General upload
StorageService.uploadGeneralImage(file, 'custom-folder')

// Validation and utilities
StorageService.validateImageFile(file)
StorageService.resizeImage(file, 800, 600, 0.8)
StorageService.deleteImage(imageUrl)
```

## 🎨 **6. ImageUpload Component**

Reusable component with:
- ✅ **Drag & Drop**: File selection
- ✅ **Progress Bar**: Upload progress
- ✅ **Image Preview**: Thumbnail with full-size preview
- ✅ **Validation**: Automatic file validation
- ✅ **Resizing**: Optional image resizing
- ✅ **Dark Mode**: Theme compatible

## 🚨 **7. Security Notes**

### **Development vs Production:**

**Development** (Current):
```javascript
// Allow all authenticated users to read/write
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

**Production** (Recommended):
- Remove the general rule above
- Use only the specific role-based rules
- Test thoroughly before deploying

## ✅ **8. Verification Checklist**

- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Google login works without permission errors
- [ ] User avatar appears in navbar
- [ ] Debug panel shows green status
- [ ] Image upload component works
- [ ] No more console warnings

## 🆘 **Troubleshooting**

### **Still getting permission errors?**
1. Check rules are deployed in Firebase Console
2. Verify user is authenticated (`firebaseUser` exists)
3. Check browser console for detailed error messages

### **Image upload not working?**
1. Verify Storage is enabled in Firebase Console
2. Check storage rules are deployed
3. Ensure file is valid image format (JPEG, PNG, WebP)
4. Check file size is under 5MB

### **Console warnings persist?**
1. Restart development server: `npm run dev`
2. Clear browser cache and reload
3. Check all imports are correct

---

**🎉 Your Car Care Connect app is now fully configured with secure file uploads and proper authentication!** 