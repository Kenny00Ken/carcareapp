'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User as FirebaseUser, 
  signInWithPhoneNumber, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import { User, UserRole } from '@/types'
import { App, message } from 'antd'
import { FCMService, registerServiceWorker } from '@/services/fcm'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (userData: Partial<User>) => Promise<void>
  setupRecaptcha: () => RecaptchaVerifier
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize FCM for authenticated user
  const initializeFCMForUser = async (userData: User) => {
    try {
      // Register service worker
      await registerServiceWorker()
      
      // Initialize FCM
      await FCMService.initialize()
      
      // Get and update FCM token
      const token = await FCMService.getToken(userData.id)
      if (token && (!userData.fcm_token || userData.fcm_token !== token)) {
        // Update user with new FCM token if it changed
        await setDoc(doc(db, 'users', userData.id), {
          fcm_token: token,
          updated_at: new Date().toISOString()
        }, { merge: true })
      }

      // Subscribe to FCM messages
      FCMService.subscribeToMessages((payload) => {
        console.log('FCM message received:', payload)
        
        // Handle notification based on type
        if (payload.data?.action === 'view_requests') {
          // Could trigger a UI update or refresh
          window.dispatchEvent(new CustomEvent('fcmNotificationReceived', {
            detail: payload
          }))
        }
      })
    } catch (error) {
      console.error('Error initializing FCM:', error)
    }
  }
  
  // Get message context safely
  let messageApi: any = null
  try {
    const appContext = App.useApp()
    messageApi = appContext.message
  } catch (error) {
    // Fallback to console if context is not available
    messageApi = {
      error: (msg: string) => console.error('Auth Error:', msg),
      success: (msg: string) => console.log('Auth Success:', msg)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? firebaseUser.email : 'null')
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          console.log('Fetching user document for:', firebaseUser.uid)
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            const userData = { id: firebaseUser.uid, ...userDoc.data() } as User
            console.log('User document found:', userData)
            setUser(userData)
            
            // Initialize FCM for authenticated user
            await initializeFCMForUser(userData)
          } else {
            console.log('No user document found - new user needs role selection')
            // New user - needs to complete profile setup
            setUser(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          messageApi.error('Error loading user profile')
          setUser(null)
        }
      } else {
        console.log('User signed out')
        setUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const setupRecaptcha = (): RecaptchaVerifier => {
    return new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved')
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired')
      }
    })
  }

  const signInWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      const recaptchaVerifier = setupRecaptcha()
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
      return confirmationResult
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      messageApi.error('Error sending OTP. Please try again.')
      throw error
    }
  }

  const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string): Promise<void> => {
    try {
      const result = await confirmationResult.confirm(otp)
      messageApi.success('Phone number verified successfully!')
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      messageApi.error('Invalid OTP. Please try again.')
      throw error
    }
  }

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      console.log('Attempting Google sign in...')
      const result = await signInWithPopup(auth, provider)
      console.log('Google sign in successful:', result.user.email)
      messageApi.success('Signed in successfully!')
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      
      let errorMessage = 'Error signing in with Google. Please try again.'
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.'
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domain not authorized for Google authentication.'
      }
      
      messageApi.error(errorMessage)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      setUser(null)
      setFirebaseUser(null)
      messageApi.success('Signed out successfully!')
    } catch (error: any) {
      console.error('Error signing out:', error)
      messageApi.error('Error signing out. Please try again.')
      throw error
    }
  }

  const updateUserProfile = async (userData: Partial<User>): Promise<void> => {
    if (!firebaseUser) {
      console.error('No Firebase user found')
      throw new Error('No authenticated user')
    }

    try {
      console.log('Updating user profile:', userData)
      const userRef = doc(db, 'users', firebaseUser.uid)
      
      // Use setDoc instead of updateDoc to ensure document is created
      await setDoc(userRef, {
        ...userData,
        id: firebaseUser.uid,
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { merge: true })
      
      console.log('User document saved successfully')
      
      // Fetch the updated document to confirm it was saved
      const updatedDoc = await getDoc(userRef)
              if (updatedDoc.exists()) {
          const updatedUser = { id: firebaseUser.uid, ...updatedDoc.data() } as User
          console.log('Updated user data:', updatedUser)
          setUser(updatedUser)
          messageApi.success('Profile updated successfully!')
          
          // Trigger navigation event for components listening
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
              detail: updatedUser 
            }))
          }
        } else {
          throw new Error('Failed to save user profile')
        }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      message.error('Error updating profile. Please try again.')
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInWithPhone,
    verifyOTP,
    signInWithGoogle,
    logout,
    updateUserProfile,
    setupRecaptcha,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 