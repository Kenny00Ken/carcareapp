import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { redirectToDashboard, redirectToRoleSelection } from '@/utils/navigation'

interface UseAuthRedirectOptions {
  redirectOnAuth?: boolean
  allowedRoles?: string[]
  redirectTo?: string
  redirectOnSignOut?: boolean
}

export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const { 
    redirectOnAuth = true,
    allowedRoles = [],
    redirectTo,
    redirectOnSignOut = true
  } = options
  
  const { user, firebaseUser, loading } = useAuth()
  const router = useRouter()
  
  // Track previous authentication state to detect sign-out
  const prevFirebaseUser = useRef(firebaseUser)

  useEffect(() => {
    if (loading) return

    // Detect sign-out: user was authenticated before but now isn't
    if (redirectOnSignOut && prevFirebaseUser.current && !firebaseUser) {
      console.log('User signed out, redirecting to landing page')
      router.replace('/')
      prevFirebaseUser.current = firebaseUser
      return
    }

    // Update previous user reference
    prevFirebaseUser.current = firebaseUser

    // If user is authenticated and we should redirect
    if (redirectOnAuth && firebaseUser) {
      if (user && user.role) {
        // Check if user's role is allowed for this page
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          console.log(`User role ${user.role} not allowed, redirecting to their dashboard`)
          redirectToDashboard(router, user.role)
          return
        }

        // If no specific redirectTo, go to their dashboard
        if (!redirectTo) {
          console.log('Authenticated user with role, redirecting to dashboard')
          redirectToDashboard(router, user.role)
        } else {
          console.log('Redirecting to specified route:', redirectTo)
          router.replace(redirectTo)
        }
      } else {
        // User is authenticated but has no profile/role
        console.log('Authenticated user without profile, redirecting to role selection')
        redirectToRoleSelection(router)
      }
    }

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      const updatedUser = event.detail
      if (updatedUser && updatedUser.role) {
        console.log('Profile updated, redirecting to dashboard')
        redirectToDashboard(router, updatedUser.role)
      }
    }

    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    }
  }, [user, firebaseUser, loading, router, redirectOnAuth, allowedRoles, redirectTo])

  return {
    isAuthenticated: !!firebaseUser,
    hasProfile: !!user,
    hasRole: !!(user && user.role),
    loading
  }
} 