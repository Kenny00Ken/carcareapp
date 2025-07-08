import { UserRole } from '@/types'

export const getDashboardRoute = (role: UserRole): string => {
  const dashboardRoutes: Record<UserRole, string> = {
    'CarOwner': '/dashboard/car-owner',
    'Mechanic': '/dashboard/mechanic',
    'Dealer': '/dashboard/dealer'
  }
  
  return dashboardRoutes[role] || '/auth/role-selection'
}

export const redirectToDashboard = (router: any, role: UserRole) => {
  const route = getDashboardRoute(role)
  console.log(`Redirecting ${role} to dashboard:`, route)
  router.replace(route)
}

export const redirectToRoleSelection = (router: any) => {
  console.log('Redirecting to role selection')
  router.replace('/auth/role-selection')
}


export const isValidRole = (role: unknown): role is UserRole => {
  return typeof role === 'string' && ['CarOwner', 'Mechanic', 'Dealer'].includes(role)
} 