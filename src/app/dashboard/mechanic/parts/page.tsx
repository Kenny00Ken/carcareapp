'use client'

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Modal, 
  Form, 
  InputNumber,
  message, 
  Tag,
  Row,
  Col,
  Image,
  Tabs,
  Badge,
  Typography,
  Avatar,
  Empty,
  Statistic,
  Tooltip,
  Divider,
  Alert,
  Descriptions
} from 'antd'
import { 
  SearchOutlined, 
  ShoppingCartOutlined, 
  EyeOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ShopOutlined,
  InboxOutlined,
  DollarOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  UpOutlined,
  DownOutlined,
  MenuOutlined
} from '@ant-design/icons'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { DatabaseService } from '@/services/database'
import { Part, Transaction, Request, TransactionStatus, Diagnosis } from '@/types'
import { App } from 'antd'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography

export default function MechanicPartsPage() {
  const { user } = useAuth()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [parts, setParts] = useState<Part[]>([])
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [myDiagnoses, setMyDiagnoses] = useState<Diagnosis[]>([])
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null)
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedDealer, setSelectedDealer] = useState<string>('')
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'stock' | 'brand'>('name')
  const [suggestedParts, setSuggestedParts] = useState<Part[]>([])
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [searchExpanded, setSearchExpanded] = useState(true)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [form] = Form.useForm()

  const categories = [
    'Engine', 'Brakes', 'Transmission', 'Suspension', 'Electrical', 
    'Body', 'Interior', 'Exhaust', 'Cooling', 'Fuel System',
    'Steering', 'Tires & Wheels', 'Lighting', 'Filters', 'Belts & Hoses'
  ]

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])
  
  // Auto-apply filters when criteria change
  useEffect(() => {
    if (parts.length > 0) {
      handleSearch()
    }
  }, [parts, selectedCategory, selectedBrand, selectedDealer, stockFilter, priceRange, sortBy])
  
  // Initialize filtered parts
  useEffect(() => {
    setFilteredParts(parts)
  }, [parts])

  const loadData = async () => {
    if (!user?.id) {
      console.warn('No user ID available for loading parts data')
      return
    }

    setLoading(true)
    try {
      // Load parts data with proper error handling for each service
      const results = await Promise.allSettled([
        DatabaseService.getAllParts(),
        DatabaseService.getTransactionsByMechanic(user.id),
        DatabaseService.getRequestsByMechanic(user.id),
        DatabaseService.getDiagnosesByMechanic(user.id)
      ])
      
      // Handle parts data
      if (results[0].status === 'fulfilled') {
        const partsData = results[0].value || []
        setParts(partsData)
        console.log(`Successfully loaded ${partsData.length} parts from dealers`)
      } else {
        console.error('Failed to load parts:', results[0].reason)
        setParts([])
        // More specific error message for Firebase indexing issues
        if (results[0].reason?.message?.includes('index')) {
          message.warning('Parts catalog requires database optimization. Please contact support if this persists.')
        } else {
          message.warning('Some parts data could not be loaded. Please check your connection and try again.')
        }
      }
      
      // Handle transactions data
      if (results[1].status === 'fulfilled') {
        setMyTransactions(results[1].value || [])
      } else {
        console.error('Failed to load transactions:', results[1].reason)
        setMyTransactions([])
        // Don't show error for transactions as it's not critical for browsing parts
      }
      
      // Handle requests data
      if (results[2].status === 'fulfilled') {
        const requestsData = results[2].value || []
        setMyRequests(requestsData.filter(r => ['diagnosed', 'quoted', 'approved', 'in_progress'].includes(r.status)))
      } else {
        console.error('Failed to load requests:', results[2].reason)
        setMyRequests([])
      }
      
      // Handle diagnoses data
      if (results[3].status === 'fulfilled') {
        setMyDiagnoses(results[3].value || [])
      } else {
        console.error('Failed to load diagnoses:', results[3].reason)
        setMyDiagnoses([])
      }
      
      // Only show error if parts (most critical) failed
      if (results[0].status === 'rejected') {
        message.error('Unable to load parts catalog. Please refresh the page or contact support.')
      }
      
    } catch (error) {
      console.error('Unexpected error loading data:', error)
      message.error('An unexpected error occurred while loading parts data. Please try again.')
      // Set safe defaults
      setParts([])
      setMyTransactions([])
      setMyRequests([])
    } finally {
      setLoading(false)
    }
  }

  // Enhanced search and filter function
  const handleSearch = async () => {
    if (!searchTerm && !selectedCategory && !selectedBrand && !selectedDealer && stockFilter === 'all') {
      setFilteredParts(parts)
      return
    }

    setLoading(true)
    try {
      let searchResults: Part[] = []
      
      // If we have search terms, use database search
      if (searchTerm || selectedCategory) {
        searchResults = await DatabaseService.searchParts(searchTerm, selectedCategory) || []
      } else {
        // Otherwise use current parts
        searchResults = parts
      }
      
      // Apply local filters
      let filteredResults = searchResults
      
      // Filter by brand
      if (selectedBrand) {
        filteredResults = filteredResults.filter(part => 
          part.brand?.toLowerCase().includes(selectedBrand.toLowerCase())
        )
      }
      
      // Filter by dealer
      if (selectedDealer) {
        filteredResults = filteredResults.filter(part => 
          part.dealer?.name?.toLowerCase().includes(selectedDealer.toLowerCase()) ||
          part.dealer_id === selectedDealer
        )
      }
      
      // Filter by stock status
      if (stockFilter !== 'all') {
        filteredResults = filteredResults.filter(part => {
          switch (stockFilter) {
            case 'in_stock': return part.stock > 5
            case 'low_stock': return part.stock > 0 && part.stock <= 5
            case 'out_of_stock': return part.stock === 0
            default: return true
          }
        })
      }
      
      // Filter by price range
      filteredResults = filteredResults.filter(part => 
        part.price >= priceRange[0] && part.price <= priceRange[1]
      )
      
      // Sort results
      filteredResults.sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name)
          case 'price_asc': return a.price - b.price
          case 'price_desc': return b.price - a.price
          case 'stock': return b.stock - a.stock
          case 'brand': return (a.brand || '').localeCompare(b.brand || '')
          default: return 0
        }
      })
      
      setFilteredParts(filteredResults)
      
      if (filteredResults.length === 0) {
        message.info('No parts found matching your search criteria. Try adjusting your filters.')
      } else {
        message.success(`Found ${filteredResults.length} parts matching your criteria`)
      }
    } catch (error) {
      console.error('Error searching parts:', error)
      setFilteredParts([])
      
      if (error instanceof Error) {
        if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          message.error('You do not have permission to search parts. Please contact support.')
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          message.error('Network error while searching parts. Please check your connection and try again.')
        } else {
          message.error('Unable to search parts at this time. Please try again later.')
        }
      } else {
        message.error('Search failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Get part suggestions based on diagnosis
  const getPartSuggestionsForDiagnosis = (diagnosis: Diagnosis): Part[] => {
    if (!diagnosis || !parts.length) return []
    
    const diagnosisKeywords = [
      ...(diagnosis.title || '').toLowerCase().split(' '),
      ...(diagnosis.details || '').toLowerCase().split(' '),
      diagnosis.severity || ''
    ]
    
    // Extract parts needed from diagnosis
    const partsNeeded = diagnosis.parts_needed || []
    const partsNeededKeywords = Array.isArray(partsNeeded) 
      ? partsNeeded.flatMap(part => 
          typeof part === 'string' 
            ? part.toLowerCase().split(' ')
            : (part.name || '').toLowerCase().split(' ')
        )
      : String(partsNeeded || '').toLowerCase().split(/[,\n\s]+/)
    
    const allKeywords = [...diagnosisKeywords, ...partsNeededKeywords]
    
    return parts.filter(part => {
      // Check if part name or category matches keywords
      const partText = `${part.name} ${part.category} ${part.description || ''}`.toLowerCase()
      return allKeywords.some(keyword => 
        keyword.length > 2 && partText.includes(keyword)
      )
    }).slice(0, 10) // Limit to top 10 suggestions
  }

  const handleViewDiagnosis = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis)
    const suggestions = getPartSuggestionsForDiagnosis(diagnosis)
    setSuggestedParts(suggestions)
    setDiagnosisModalVisible(true)
  }

  const handleRequestPart = async (values: any) => {
    if (!selectedPart) return

    try {
      const transactionData = {
        request_id: values.request_id,
        diagnosis_id: selectedDiagnosis?.id,
        part_id: selectedPart.id,
        dealer_id: selectedPart.dealer_id,
        mechanic_id: user!.id,
        quantity: values.quantity,
        unit_price: selectedPart.price,
        total_amount: selectedPart.price * values.quantity,
        status: 'pending' as TransactionStatus,
        notes: values.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await DatabaseService.createTransaction(transactionData)
      message.success('Part request submitted successfully!')
      
      // Send notification to dealer
      await DatabaseService.createNotification({
        user_id: selectedPart.dealer_id,
        title: 'New Parts Request',
        message: `Mechanic ${user!.name} has requested ${values.quantity}x ${selectedPart.name} for diagnosis`,
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        data: { 
          part_id: selectedPart.id,
          mechanic_id: user!.id,
          mechanic_name: user!.name,
          quantity: values.quantity,
          total_amount: transactionData.total_amount,
          diagnosis_id: selectedDiagnosis?.id,
          request_id: values.request_id
        }
      })

      setRequestModalVisible(false)
      form.resetFields()
      loadData()
    } catch (error) {
      console.error('Error requesting part:', error)
      message.error('Failed to request part')
    }
  }

  const getTransactionStatusColor = (status: TransactionStatus) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue',
      cancelled: 'gray'
    }
    return colors[status]
  }

  const partsColumns = [
    {
      title: 'Image',
      key: 'image',
      width: 80,
      render: (record: Part) => (
        <Image
          src={record.image_url || '/placeholder-part.jpg'}
          alt={record.name}
          width={50}
          height={50}
          style={{ objectFit: 'cover' }}
          fallback="/placeholder-part.jpg"
        />
      )
    },
    {
      title: 'Part Details',
      key: 'details',
      render: (record: Part) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-gray-500">{record.brand}</div>
          <div className="text-sm text-gray-500">Part #: {record.part_number}</div>
          <Tag color="blue">{record.category}</Tag>
        </div>
      )
    },
    {
      title: 'Compatibility',
      dataIndex: 'compatibility',
      key: 'compatibility',
      render: (compatibility: string[]) => (
        <div className="space-y-1">
          {compatibility?.slice(0, 2).map((comp, index) => (
            <Tag key={index}>{comp}</Tag>
          ))}
          {compatibility?.length > 2 && (
            <Tag>+{compatibility.length - 2} more</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="font-semibold text-green-600">GHS {price.toFixed(2)}</span>
      )
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Badge 
          count={stock} 
          style={{ backgroundColor: stock > 10 ? '#52c41a' : stock > 0 ? '#faad14' : '#f5222d' }}
        />
      )
    },
    {
      title: 'Dealer Information',
      key: 'dealer',
      render: (record: Part) => (
        <div>
          <div className="flex items-center mb-1">
            <Avatar icon={<UserOutlined />} size="small" className="mr-2" />
            <span className="font-medium">{record.dealer?.name || 'Unknown Dealer'}</span>
          </div>
          {record.dealer?.phone && (
            <div className="flex items-center text-sm text-gray-500">
              <PhoneOutlined className="mr-1" />
              {record.dealer.phone}
            </div>
          )}
          {record.dealer?.address && (
            <div className="flex items-center text-sm text-gray-500">
              <EnvironmentOutlined className="mr-1" />
              {record.dealer.address}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Part) => (
        <Space>
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedPart(record)
                setViewModalVisible(true)
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title={record.stock === 0 ? "Out of stock" : "Request this part"}>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => {
                setSelectedPart(record)
                setRequestModalVisible(true)
              }}
              disabled={record.stock === 0}
              size="small"
            >
              {record.stock === 0 ? 'Out of Stock' : 'Request'}
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ]

  const transactionColumns = [
    {
      title: 'Part',
      key: 'part',
      render: (record: Transaction) => (
        <div>
          <div className="font-medium">{record.part?.name}</div>
          <div className="text-sm text-gray-500">Qty: {record.quantity}</div>
        </div>
      )
    },
    {
      title: 'Request',
      key: 'request',
      render: (record: Transaction) => (
        <div>
          <div>{record.request?.title || 'N/A'}</div>
          <div className="text-sm text-gray-500">ID: {record.request_id?.slice(-8)}</div>
        </div>
      )
    },
    {
      title: 'Dealer',
      key: 'dealer',
      render: (record: Transaction) => record.dealer?.name || 'Unknown'
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `GHS ${amount.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TransactionStatus) => (
        <Tag color={getTransactionStatusColor(status)}>{status.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ]

  // Calculate statistics for filtered parts
  const totalParts = filteredParts.length
  const availableParts = filteredParts.filter(p => p.stock > 0).length
  const lowStockParts = filteredParts.filter(p => p.stock > 0 && p.stock <= 5).length
  const outOfStockParts = filteredParts.filter(p => p.stock === 0).length
  const uniqueDealers = [...new Set(filteredParts.map(p => p.dealer_id))].length
  const averagePrice = filteredParts.length > 0 ? filteredParts.reduce((sum, p) => sum + p.price, 0) / filteredParts.length : 0
  
  // Get unique brands and dealers for filter options
  const uniqueBrands = [...new Set(parts.map(p => p.brand).filter(Boolean))].sort()
  const uniqueDealerOptions = [...new Set(parts.map(p => p.dealer).filter(Boolean))]
    .map(dealer => ({ id: dealer!.id, name: dealer!.name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Define tab items for the modern Tabs component
  const tabItems = [
    {
      key: 'browse',
      label: (
        <span>
          <SearchOutlined />
          Browse Parts
          <Badge count={totalParts} showZero style={{ marginLeft: 8 }} />
        </span>
      ),
      children: (
        <div>
          {/* Enhanced Search and Filter - Collapsible */}
          <Card className="mb-4 shadow-sm">
            {/* Header with Collapse Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Text strong className="text-lg">
                  <SearchOutlined className="mr-2" />
                  Search & Filter Parts
                </Text>
                <Text type="secondary" className="ml-2 hidden sm:inline">
                  Find the exact parts you need for your diagnosis
                </Text>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  count={filteredParts.length} 
                  style={{ backgroundColor: '#1890ff' }}
                  title="Filtered results"
                />
                <Button 
                  type="text" 
                  icon={
                    <span className="transition-transform duration-200 ease-in-out inline-block">
                      {searchExpanded ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  }
                  onClick={() => setSearchExpanded(!searchExpanded)}
                  size="small"
                  className="flex items-center hover:bg-blue-50 transition-colors duration-200"
                >
                  <span className="hidden sm:inline">
                    {searchExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Quick Search Bar - Always Visible */}
            <div className="mb-4">
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} sm={16} md={12} lg={14}>
                  <Search
                    placeholder="Quick search by name, brand, or part number..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      // Auto-search after 500ms delay
                      if (e.target.value.length > 2 || e.target.value.length === 0) {
                        setTimeout(() => handleSearch(), 500)
                      }
                    }}
                    onSearch={handleSearch}
                    enterButton={<SearchOutlined />}
                    size="large"
                    allowClear
                    className="w-full transition-all duration-200 hover:shadow-md focus-within:shadow-lg"
                  />
                </Col>
                <Col xs={12} sm={4} md={6} lg={5}>
                  <Select
                    placeholder="Category"
                    style={{ width: '100%' }}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    allowClear
                    size="large"
                    showSearch
                    optionFilterProp="children"
                    className="transition-all duration-200 hover:shadow-md"
                  >
                    {categories.map(category => (
                      <Option key={category} value={category}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
                          <Badge 
                            count={parts.filter(p => p.category === category).length} 
                            size="small"
                            style={{ backgroundColor: '#1890ff' }}
                          />
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={12} sm={4} md={6} lg={5}>
                  <Space.Compact block>
                    <Button 
                      icon={
                        <span className="transition-transform duration-200 ease-in-out inline-block">
                          <FilterOutlined />
                        </span>
                      }
                      onClick={() => setFiltersExpanded(!filtersExpanded)}
                      size="large"
                      type={filtersExpanded ? "primary" : "default"}
                      className="flex-1 transition-all duration-200 hover:shadow-md"
                    >
                      <span className="hidden sm:inline">Filters</span>
                    </Button>
                    <Button 
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                        setSelectedBrand('')
                        setSelectedDealer('')
                        setStockFilter('all')
                        setPriceRange([0, 10000])
                        setSortBy('name')
                        setFilteredParts(parts)
                      }}
                      size="large"
                      title="Clear all filters"
                      className="transition-all duration-200 hover:shadow-md hover:bg-red-50 hover:border-red-300"
                    >
                      <span className="hidden sm:inline">Clear</span>
                      <span className="sm:hidden">✕</span>
                    </Button>
                  </Space.Compact>
                </Col>
              </Row>
            </div>

            {/* Advanced Filters - Collapsible Section with Animation */}
            <div 
              className={`border-t transition-all duration-300 ease-in-out overflow-hidden ${
                (searchExpanded || filtersExpanded) 
                  ? 'max-h-[500px] opacity-100 pt-4' 
                  : 'max-h-0 opacity-0 pt-0'
              }`}
              style={{
                transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out, padding 0.3s ease-in-out'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <Text type="secondary" className="flex items-center">
                  <FilterOutlined className="mr-2" />
                  Advanced Filters
                </Text>
                <Button 
                  type="text" 
                  size="small"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="sm:hidden"
                >
                  {filtersExpanded ? 'Less' : 'More'}
                </Button>
              </div>
                
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} lg={6}>
                    <div className="space-y-2">
                      <Text strong className="text-sm">Brand:</Text>
                      <Select
                        placeholder="Any brand"
                        style={{ width: '100%' }}
                        value={selectedBrand}
                        onChange={setSelectedBrand}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
                        {uniqueBrands.map(brand => (
                          <Option key={brand} value={brand}>
                            <div className="flex items-center justify-between">
                              <span>{brand}</span>
                              <Badge 
                                count={parts.filter(p => p.brand === brand).length} 
                                size="small"
                                style={{ backgroundColor: '#722ed1' }}
                              />
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} lg={6}>
                    <div className="space-y-2">
                      <Text strong className="text-sm">Dealer:</Text>
                      <Select
                        placeholder="Any dealer"
                        style={{ width: '100%' }}
                        value={selectedDealer}
                        onChange={setSelectedDealer}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
                        {uniqueDealerOptions.map(dealer => (
                          <Option key={dealer.id} value={dealer.name}>
                            <div className="flex items-center justify-between">
                              <span>{dealer.name}</span>
                              <Badge 
                                count={parts.filter(p => p.dealer_id === dealer.id).length} 
                                size="small"
                                style={{ backgroundColor: '#52c41a' }}
                              />
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} lg={6}>
                    <div className="space-y-2">
                      <Text strong className="text-sm">Stock Status:</Text>
                      <Select
                        value={stockFilter}
                        onChange={setStockFilter}
                        style={{ width: '100%' }}
                      >
                        <Option value="all">All Levels</Option>
                        <Option value="in_stock">
                          <div className="flex items-center">
                            <CheckCircleOutlined className="text-green-500 mr-2" />
                            In Stock (>5)
                          </div>
                        </Option>
                        <Option value="low_stock">
                          <div className="flex items-center">
                            <ExclamationCircleOutlined className="text-orange-500 mr-2" />
                            Low Stock (1-5)
                          </div>
                        </Option>
                        <Option value="out_of_stock">
                          <div className="flex items-center">
                            <ClockCircleOutlined className="text-red-500 mr-2" />
                            Out of Stock
                          </div>
                        </Option>
                      </Select>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} lg={6}>
                    <div className="space-y-2">
                      <Text strong className="text-sm">Sort By:</Text>
                      <Select
                        value={sortBy}
                        onChange={setSortBy}
                        style={{ width: '100%' }}
                      >
                        <Option value="name">Name (A-Z)</Option>
                        <Option value="price_asc">Price ↑</Option>
                        <Option value="price_desc">Price ↓</Option>
                        <Option value="stock">Stock ↓</Option>
                        <Option value="brand">Brand (A-Z)</Option>
                      </Select>
                    </div>
                  </Col>
                </Row>
                
                <Row gutter={[16, 16]} align="middle" className="mt-4">
                  <Col xs={24} md={12}>
                    <div className="space-y-2">
                      <Text strong className="text-sm">Price Range (GHS):</Text>
                      <div className="flex items-center space-x-2">
                        <InputNumber
                          min={0}
                          max={priceRange[1]}
                          value={priceRange[0]}
                          onChange={(value) => setPriceRange([value || 0, priceRange[1]])}
                          placeholder="Min"
                          size="small"
                          className="flex-1"
                        />
                        <span className="text-gray-400">to</span>
                        <InputNumber
                          min={priceRange[0]}
                          max={50000}
                          value={priceRange[1]}
                          onChange={(value) => setPriceRange([priceRange[0], value || 10000])}
                          placeholder="Max"
                          size="small"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <div className="flex items-center justify-end space-x-2">
                      <Text type="secondary" className="text-sm">Showing:</Text>
                      <Badge 
                        count={filteredParts.length}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                      <Text type="secondary" className="text-sm">of {parts.length} parts</Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text strong className="text-lg">
                    <InboxOutlined className="mr-2" />
                    Available Parts from Dealers
                  </Text>
                  <Text type="secondary" className="ml-2">
                    ({filteredParts.length} of {parts.length} parts from {uniqueDealers} dealers)
                  </Text>
                </div>
                
                {/* Active Filters Summary */}
                <div className="flex items-center space-x-2">
                  {(searchTerm || selectedCategory || selectedBrand || selectedDealer || stockFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <div className="flex items-center space-x-2">
                      <Text type="secondary">Active filters:</Text>
                      {searchTerm && (
                        <Tag 
                          color="blue" 
                          closable 
                          onClose={() => setSearchTerm('')}
                          className="transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          Search: {searchTerm}
                        </Tag>
                      )}
                      {selectedCategory && (
                        <Tag 
                          color="green" 
                          closable 
                          onClose={() => setSelectedCategory('')}
                          className="transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          Category: {selectedCategory}
                        </Tag>
                      )}
                      {selectedBrand && (
                        <Tag 
                          color="purple" 
                          closable 
                          onClose={() => setSelectedBrand('')}
                          className="transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          Brand: {selectedBrand}
                        </Tag>
                      )}
                      {selectedDealer && (
                        <Tag 
                          color="orange" 
                          closable 
                          onClose={() => setSelectedDealer('')}
                          className="transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          Dealer: {selectedDealer}
                        </Tag>
                      )}
                      {stockFilter !== 'all' && (
                        <Tag 
                          color="red" 
                          closable 
                          onClose={() => setStockFilter('all')}
                          className="transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          Stock: {stockFilter.replace('_', ' ')}
                        </Tag>
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                        <Tag 
                          color="gold" 
                          closable 
                          onClose={() => setPriceRange([0, 10000])}
                          className="transition-all duration-200 hover:shadow-md cursor-pointer"
                        >
                          Price: GHS {priceRange[0]}-{priceRange[1]}
                        </Tag>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Table
              columns={partsColumns}
              dataSource={filteredParts}
              rowKey="id"
              loading={{
                spinning: loading,
                indicator: (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">Loading parts...</span>
                  </div>
                )
              }}
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: false, // Disable on mobile for better UX
                showTotal: (total, range) => (
                  <span className="text-sm">
                    <span className="hidden sm:inline">{range[0]}-{range[1]} of {total} parts</span>
                    <span className="sm:hidden">{range[0]}-{range[1]}/{total}</span>
                  </span>
                ),
                pageSizeOptions: ['5', '10', '20', '50'],
                size: 'default',
                responsive: true,
                className: 'mb-0'
              }}
              scroll={{ x: 1200 }}
              size="middle"
              className="overflow-auto transition-all duration-200"
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <span className="text-gray-500">
                        <span className="hidden sm:inline">No parts found matching your criteria</span>
                        <span className="sm:hidden">No parts found</span>
                      </span>
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button type="primary" onClick={loadData} icon={<ReloadOutlined />} size="small">
                          Refresh
                        </Button>
                        <Button 
                          onClick={() => {
                            setSearchTerm('')
                            setSelectedCategory('')
                            setSelectedBrand('')
                            setSelectedDealer('')
                            setStockFilter('all')
                            setPriceRange([0, 10000])
                            setSortBy('name')
                            setFilteredParts(parts)
                          }}
                          size="small"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </Empty>
                )
              }}
            />
          </Card>
        </div>
      )
    },
    {
      key: 'requests',
      label: (
        <span>
          <ClockCircleOutlined />
          My Requests
          <Badge count={myTransactions.length} className="ml-2" />
        </span>
      ),
      children: (
        <Card>
          <Table
            columns={transactionColumns}
            dataSource={myTransactions}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`
            }}
            scroll={{ x: 800 }}
            locale={{
              emptyText: (
                <Empty
                  description="No part requests yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <p className="text-gray-500 mt-2">Start by browsing parts and making requests</p>
                </Empty>
              )
            }}
          />
        </Card>
      )
    },
    {
      key: 'diagnoses',
      label: (
        <span>
          <MedicineBoxOutlined />
          My Diagnoses ({myDiagnoses.length})
        </span>
      ),
      children: (
        <Card>
          <Table
            columns={[
              {
                title: 'Diagnosis',
                key: 'diagnosis',
                render: (record: Diagnosis) => (
                  <div>
                    <div className="font-medium">{record.title}</div>
                    <div className="text-sm text-gray-500">{record.details?.substring(0, 100)}...</div>
                    <Tag color={record.severity === 'critical' ? 'red' : record.severity === 'high' ? 'orange' : 'blue'}>
                      {record.severity?.toUpperCase()}
                    </Tag>
                  </div>
                )
              },
              {
                title: 'Car Information',
                key: 'car',
                render: (record: Diagnosis) => {
                  const request = myRequests.find(r => r.id === record.request_id)
                  return request?.car ? (
                    <div>
                      <div className="font-medium">{request.car.make} {request.car.model}</div>
                      <div className="text-sm text-gray-500">{request.car.year} • {request.car.license_plate}</div>
                    </div>
                  ) : 'No car info'
                }
              },
              {
                title: 'Parts Needed',
                key: 'parts_needed',
                render: (record: Diagnosis) => {
                  const partsCount = Array.isArray(record.parts_needed) 
                    ? record.parts_needed.length 
                    : String(record.parts_needed || '').split(/[,\n]+/).filter(p => p.trim()).length
                  return (
                    <Badge count={partsCount} showZero style={{ backgroundColor: '#52c41a' }} />
                  )
                }
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (record: Diagnosis) => (
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={() => handleViewDiagnosis(record)}
                  >
                    View & Select Parts
                  </Button>
                )
              }
            ]}
            dataSource={myDiagnoses}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            locale={{
              emptyText: (
                <Empty
                  description="No diagnoses found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />
        </Card>
      )
    }
  ]

  return (
    <DashboardLayout activeKey="parts">
      <App>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <Title level={2} className="!mb-2 flex items-center">
                <ShopOutlined className="mr-3 text-blue-600" />
                Parts Catalog
              </Title>
              <Text type="secondary" className="text-lg">
                Browse and request parts from dealers for your diagnoses
              </Text>
            </div>
            <Space>
              <Tooltip title="Refresh parts catalog">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadData}
                  loading={loading}
                  size="large"
                >
                  Refresh
                </Button>
              </Tooltip>
            </Space>
          </div>

          {/* Statistics Cards - Mobile Responsive */}
          <Row gutter={[12, 12]} className="mb-4">
            <Col xs={12} sm={6} lg={6}>
              <Card className="text-center" size="small">
                <Statistic 
                  title={<span className="text-xs sm:text-sm">Total Parts</span>}
                  value={totalParts} 
                  prefix={<InboxOutlined className="text-blue-500" />}
                  valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                  suffix={<span className="text-xs hidden sm:inline">parts</span>}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={6}>
              <Card className="text-center" size="small">
                <Statistic 
                  title={<span className="text-xs sm:text-sm">In Stock</span>}
                  value={availableParts} 
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                  valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                  suffix={<span className="text-xs hidden sm:inline">parts</span>}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={6}>
              <Card className="text-center" size="small">
                <Statistic 
                  title={<span className="text-xs sm:text-sm">Dealers</span>}
                  value={uniqueDealers} 
                  prefix={<UserOutlined className="text-purple-500" />}
                  valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                  suffix={<span className="text-xs hidden sm:inline">active</span>}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={6}>
              <Card className="text-center" size="small">
                <Statistic 
                  title={<span className="text-xs sm:text-sm">Avg Price</span>}
                  value={averagePrice}
                  precision={2}
                  prefix={<span className="text-xs sm:text-sm">GHS </span>}
                  valueStyle={{ color: '#faad14', fontSize: '16px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Alerts */}
          {outOfStockParts > 0 && (
            <Alert
              message={`${outOfStockParts} part(s) are currently out of stock`}
              description="These parts are not available for ordering. Contact dealers directly for availability."
              type="warning"
              showIcon
              closable
            />
          )}

          {lowStockParts > 0 && (
            <Alert
              message={`${lowStockParts} part(s) have low stock (≤5 units)`}
              description="Order these parts soon as they may run out quickly."
              type="info"
              showIcon
              closable
            />
          )}

          <Tabs defaultActiveKey="browse" size="large" items={tabItems} />

        {/* Request Part Modal */}
        <Modal
          title="Request Part"
          open={requestModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setRequestModalVisible(false)
            form.resetFields()
          }}
          width={600}
        >
          {selectedPart && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <Row gutter={16} align="middle">
                  <Col>
                    <Image
                      src={selectedPart.image_url || '/placeholder-part.jpg'}
                      alt={selectedPart.name}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover' }}
                    />
                  </Col>
                  <Col flex="auto">
                    <div className="font-medium">{selectedPart.name}</div>
                    <div className="text-sm text-gray-500">{selectedPart.brand}</div>
                    <div className="text-sm text-gray-500">Stock: {selectedPart.stock}</div>
                    <div className="font-semibold text-green-600">GHS {selectedPart.price.toFixed(2)} each</div>
                  </Col>
                </Row>
              </div>

              <Form form={form} onFinish={handleRequestPart} layout="vertical">
                <Form.Item
                  name="request_id"
                  label="Associated Service Request"
                  rules={[{ required: true, message: 'Please select a service request' }]}
                >
                  <Select placeholder="Select service request">
                    {myRequests.map(request => (
                      <Option key={request.id} value={request.id}>
                        {request.title} - {request.car?.make} {request.car?.model}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[
                    { required: true, message: 'Please enter quantity' },
                    { type: 'number', min: 1, max: selectedPart.stock, message: `Max available: ${selectedPart.stock}` }
                  ]}
                >
                  <InputNumber
                    min={1}
                    max={selectedPart.stock}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      const total = (value || 0) * selectedPart.price
                      form.setFieldsValue({ total_amount: total })
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="total_amount"
                  label="Total Amount"
                >
                  <InputNumber
                    disabled
                    formatter={value => `GHS ${value}`}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="notes"
                  label="Notes (Optional)"
                >
                  <Input.TextArea rows={3} placeholder="Additional notes for the dealer..." />
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* View Part Details Modal */}
        <Modal
          title="Part Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedPart && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Image
                  src={selectedPart.image_url || '/placeholder-part.jpg'}
                  alt={selectedPart.name}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover' }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedPart.name}</h3>
                  <p><strong>Brand:</strong> {selectedPart.brand}</p>
                  <p><strong>Part Number:</strong> {selectedPart.part_number}</p>
                  <p><strong>Category:</strong> <Tag color="blue">{selectedPart.category}</Tag></p>
                  <p><strong>Price:</strong> <span className="font-semibold text-green-600">GHS {selectedPart.price.toFixed(2)}</span></p>
                  <p><strong>Stock:</strong> {selectedPart.stock} units</p>
                </div>
              </div>
              
              {selectedPart.description && (
                <div>
                  <h4 className="font-semibold">Description</h4>
                  <p>{selectedPart.description}</p>
                </div>
              )}
              
              {selectedPart.compatibility && selectedPart.compatibility.length > 0 && (
                <div>
                  <h4 className="font-semibold">Compatibility</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPart.compatibility.map((comp, index) => (
                      <Tag key={index}>{comp}</Tag>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPart.specifications && (
                <div>
                  <h4 className="font-semibold">Specifications</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedPart.specifications).map(([key, value]) => (
                      <p key={key}><strong>{key}:</strong> {String(value)}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold">Dealer Information</h4>
                <p><strong>Dealer:</strong> {selectedPart.dealer?.name}</p>
                <p><strong>Phone:</strong> {selectedPart.dealer?.phone}</p>
              </div>
            </div>
          )}
        </Modal>

        {/* Diagnosis Details and Part Selection Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <MedicineBoxOutlined className="mr-2 text-blue-600" />
              Diagnosis Details & Part Selection
            </div>
          }
          open={diagnosisModalVisible}
          onCancel={() => {
            setDiagnosisModalVisible(false)
            setSelectedDiagnosis(null)
            setSuggestedParts([])
          }}
          footer={null}
          width={1000}
        >
          {selectedDiagnosis && (
            <div className="space-y-6">
              {/* Diagnosis Information */}
              <Card title="Diagnosis Information" size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <strong>Title:</strong> {selectedDiagnosis.title}
                    </div>
                    <div className="mt-2">
                      <strong>Severity:</strong> 
                      <Tag 
                        color={selectedDiagnosis.severity === 'critical' ? 'red' : selectedDiagnosis.severity === 'high' ? 'orange' : 'blue'}
                        className="ml-2"
                      >
                        {selectedDiagnosis.severity?.toUpperCase()}
                      </Tag>
                    </div>
                    <div className="mt-2">
                      <strong>Estimated Cost:</strong> GHS {selectedDiagnosis.estimated_cost?.toFixed(2) || '0.00'}
                    </div>
                  </Col>
                  <Col span={12}>
                    {(() => {
                      const request = myRequests.find(r => r.id === selectedDiagnosis.request_id)
                      return request?.car ? (
                        <div>
                          <strong>Vehicle:</strong> {request.car.make} {request.car.model} ({request.car.year})
                          <div className="text-sm text-gray-500 mt-1">
                            License: {request.car.license_plate}
                          </div>
                          <div className="text-sm text-gray-500">
                            Owner: {request.owner?.name}
                          </div>
                        </div>
                      ) : <div>No vehicle information</div>
                    })()}
                  </Col>
                </Row>
                <div className="mt-4">
                  <strong>Details:</strong>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    {selectedDiagnosis.details}
                  </div>
                </div>
              </Card>

              {/* Parts Needed */}
              <Card title="Parts Needed from Diagnosis" size="small">
                <div className="space-y-2">
                  {(() => {
                    const partsNeeded = selectedDiagnosis.parts_needed || []
                    if (Array.isArray(partsNeeded) && partsNeeded.length > 0) {
                      return partsNeeded.map((part, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{typeof part === 'string' ? part : part.name}</span>
                          {typeof part === 'object' && part.quantity && (
                            <Badge count={part.quantity} style={{ backgroundColor: '#1890ff' }} />
                          )}
                        </div>
                      ))
                    } else {
                      const stringData = String(partsNeeded || '')
                      if (stringData.trim()) {
                        return stringData.split(/[,\n]+/).map((part, index) => (
                          <div key={index} className="p-2 border rounded">
                            {part.trim()}
                          </div>
                        ))
                      } else {
                        return <div className="text-gray-500">No specific parts listed</div>
                      }
                    }
                  })()}
                </div>
              </Card>

              {/* Suggested Parts */}
              <Card title={`Suggested Parts (${suggestedParts.length} matches found)`} size="small">
                {suggestedParts.length > 0 ? (
                  <Table
                    columns={[
                      {
                        title: 'Part',
                        key: 'part',
                        render: (record: Part) => (
                          <div className="flex items-center">
                            <Image
                              src={record.image_url || '/placeholder-part.jpg'}
                              alt={record.name}
                              width={40}
                              height={40}
                              style={{ objectFit: 'cover' }}
                              fallback="/placeholder-part.jpg"
                              className="mr-3"
                            />
                            <div>
                              <div className="font-medium">{record.name}</div>
                              <div className="text-sm text-gray-500">{record.brand}</div>
                              <Tag color="blue">{record.category}</Tag>
                            </div>
                          </div>
                        )
                      },
                      {
                        title: 'Dealer',
                        key: 'dealer',
                        render: (record: Part) => (
                          <div>
                            <div className="font-medium">{record.dealer?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{record.dealer?.phone}</div>
                          </div>
                        )
                      },
                      {
                        title: 'Price',
                        dataIndex: 'price',
                        key: 'price',
                        render: (price: number) => (
                          <span className="font-semibold text-green-600">GHS {price.toFixed(2)}</span>
                        )
                      },
                      {
                        title: 'Stock',
                        dataIndex: 'stock',
                        key: 'stock',
                        render: (stock: number) => (
                          <Badge 
                            count={stock} 
                            style={{ backgroundColor: stock > 10 ? '#52c41a' : stock > 0 ? '#faad14' : '#f5222d' }}
                          />
                        )
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        render: (record: Part) => (
                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => {
                              setSelectedPart(record)
                              setRequestModalVisible(true)
                            }}
                            disabled={record.stock === 0}
                          >
                            Request
                          </Button>
                        )
                      }
                    ]}
                    dataSource={suggestedParts}
                    rowKey="id"
                    pagination={false}
                    scroll={{ y: 300 }}
                  />
                ) : (
                  <Empty description="No matching parts found for this diagnosis" />
                )}
              </Card>
            </div>
          )}
        </Modal>
        </div>
      </App>
    </DashboardLayout>
  )
} 