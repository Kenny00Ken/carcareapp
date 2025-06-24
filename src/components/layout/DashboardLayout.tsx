'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Badge, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import {
  CarOutlined,
  ToolOutlined,
  ShopOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined,
  BulbOutlined,
  MoonOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types'
import { DatabaseService } from '@/services/database'

const { Header, Sider, Content } = Layout
const { Title } = Typography

interface DashboardLayoutProps {
  children: React.ReactNode
  activeKey?: string
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeKey = 'dashboard' 
}) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = DatabaseService.subscribeToUserNotifications(user.id, (notifications) => {
        setNotificationCount(notifications.length)
      })
      return unsubscribe
    }
  }, [user])

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'CarOwner':
        return <CarOutlined />
      case 'Mechanic':
        return <ToolOutlined />
      case 'Dealer':
        return <ShopOutlined />
      default:
        return <UserOutlined />
    }
  }

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'CarOwner':
        return 'Car Owner Dashboard'
      case 'Mechanic':
        return 'Mechanic Dashboard'
      case 'Dealer':
        return 'Dealer Dashboard'
      default:
        return 'Dashboard'
    }
  }

  const getMenuItems = (role: UserRole) => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        onClick: () => router.push(`/dashboard/${role.toLowerCase().replace('owner', '-owner')}`),
      },
    ]

    switch (role) {
      case 'CarOwner':
        return [
          ...baseItems,
          {
            key: 'cars',
            icon: <CarOutlined />,
            label: 'My Cars',
            onClick: () => router.push('/dashboard/car-owner/cars'),
          },
          {
            key: 'requests',
            icon: <FileTextOutlined />,
            label: 'Repair Requests',
            onClick: () => router.push('/dashboard/car-owner/requests'),
          },
          {
            key: 'diagnoses',
            icon: <ToolOutlined />,
            label: 'Diagnoses',
            onClick: () => router.push('/dashboard/car-owner/diagnoses'),
          },
        ]
      case 'Mechanic':
        return [
          ...baseItems,
          {
            key: 'requests',
            icon: <FileTextOutlined />,
            label: 'Service Requests',
            onClick: () => router.push('/dashboard/mechanic/requests'),
          },
          {
            key: 'diagnoses',
            icon: <ToolOutlined />,
            label: 'Diagnoses',
            onClick: () => router.push('/dashboard/mechanic/diagnoses'),
          },
          {
            key: 'parts',
            icon: <ShopOutlined />,
            label: 'Parts Catalog',
            onClick: () => router.push('/dashboard/mechanic/parts'),
          },
          {
            key: 'history',
            icon: <FileTextOutlined />,
            label: 'Maintenance History',
            onClick: () => router.push('/dashboard/mechanic/history'),
          },
        ]
      case 'Dealer':
        return [
          ...baseItems,
          {
            key: 'parts',
            icon: <ShopOutlined />,
            label: 'Parts Inventory',
            onClick: () => router.push('/dashboard/dealer/parts'),
          },
          {
            key: 'transactions',
            icon: <FileTextOutlined />,
            label: 'Transactions',
            onClick: () => router.push('/dashboard/dealer/transactions'),
          },
          {
            key: 'analytics',
            icon: <DashboardOutlined />,
            label: 'Sales Analytics',
            onClick: () => router.push('/dashboard/dealer/analytics'),
          },
        ]
      default:
        return baseItems
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/settings'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="!bg-white dark:!bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {getRoleIcon(user.role)}
            {!collapsed && (
              <Title level={4} className="!mb-0 !text-blue-600">
                Car Care
              </Title>
            )}
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={getMenuItems(user.role)}
          className="!border-r-0 !bg-transparent"
        />
      </Sider>
      
      <Layout>
        <Header className="!bg-white dark:!bg-gray-800 !px-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            <Title level={4} className="!mb-0">
              {getRoleTitle(user.role)}
            </Title>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={theme === 'light' ? <MoonOutlined /> : <BulbOutlined />}
              onClick={toggleTheme}
            />
            
            <Badge count={notificationCount} showZero={false}>
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => router.push('/notifications')}
              />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
                <Avatar icon={<UserOutlined />} />
                <span className="font-medium">{user.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="!p-6 !bg-gray-50 dark:!bg-gray-900">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
} 