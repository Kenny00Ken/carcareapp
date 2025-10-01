'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Badge, Drawer, Typography, Space, Tag, Empty, Tooltip, Card } from 'antd'
import {
  QuestionCircleOutlined,
  SendOutlined,
  CloseOutlined,
  SearchOutlined,
  RobotOutlined,
  UserOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { faqs, faqCategories, FAQ } from '@/data/faqs'

const { Text, Paragraph } = Typography
const { Search } = Input

interface Message {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  faqs?: FAQ[]
}

export const HelpAssistant: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hasUnread, setHasUnread] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Show welcome message on first visit
    const hasVisited = localStorage.getItem('autocare-help-visited')
    if (!hasVisited) {
      setTimeout(() => {
        setHasUnread(true)
      }, 3000)
      localStorage.setItem('autocare-help-visited', 'true')
    }
  }, [])

  const addMessage = (content: string, type: 'bot' | 'user', faqs?: FAQ[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      faqs
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleOpen = () => {
    setOpen(true)
    setHasUnread(false)

    if (messages.length === 0) {
      addMessage(
        "👋 Hello! I'm your AutoCare assistant. How can I help you today?\n\nYou can ask me questions about:\n• Getting started with AutoCare\n• Creating repair requests\n• Finding mechanics or parts\n• Payments and fees\n• Technical support\n\nOr browse FAQs by category below!",
        'bot'
      )
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const searchFAQs = (query: string): FAQ[] => {
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) return []

    return faqs.filter(faq => {
      const questionMatch = faq.question.toLowerCase().includes(searchTerm)
      const answerMatch = faq.answer.toLowerCase().includes(searchTerm)
      const keywordMatch = faq.keywords.some(keyword =>
        keyword.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(keyword.toLowerCase())
      )
      const categoryMatch = selectedCategory ? faq.category === selectedCategory : true

      return (questionMatch || answerMatch || keywordMatch) && categoryMatch
    }).slice(0, 5) // Limit to top 5 results
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    addMessage(inputValue, 'user')

    // Search for relevant FAQs
    const relevantFAQs = searchFAQs(inputValue)

    setTimeout(() => {
      if (relevantFAQs.length > 0) {
        addMessage(
          `I found ${relevantFAQs.length} answer${relevantFAQs.length > 1 ? 's' : ''} that might help:`,
          'bot',
          relevantFAQs
        )
      } else {
        addMessage(
          "I couldn't find a specific answer to your question. Here are some options:\n\n" +
          "• Try rephrasing your question\n" +
          "• Browse FAQs by category below\n" +
          "• Contact our support team at support@autocare.com or +233 555-0123\n\n" +
          "Our team is available Monday-Friday, 8:00 AM - 6:00 PM GMT.",
          'bot'
        )
      }
    }, 500)

    setInputValue('')
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category)

    const categoryFAQs = faqs.filter(faq => faq.category === category)
    const categoryLabel = faqCategories.find(c => c.value === category)?.label || category

    addMessage(`Show me FAQs about ${categoryLabel}`, 'user')

    setTimeout(() => {
      addMessage(
        `Here are the frequently asked questions about ${categoryLabel}:`,
        'bot',
        categoryFAQs
      )
    }, 300)
  }

  const handleFAQClick = (faq: FAQ) => {
    addMessage(faq.question, 'user')

    setTimeout(() => {
      addMessage(faq.answer, 'bot')
    }, 300)
  }

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
        }}
      >
        <Badge dot={hasUnread} offset={[-5, 5]}>
          <Tooltip title="Need help? Chat with us!" placement="left">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<QuestionCircleOutlined />}
              onClick={handleOpen}
              className="!w-16 !h-16 !text-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
              }}
            />
          </Tooltip>
        </Badge>
      </motion.div>

      {/* Help Assistant Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <RobotOutlined className="text-xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-base">AutoCare Assistant</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                Here to help 24/7
              </div>
            </div>
          </div>
        }
        placement="right"
        onClose={handleClose}
        open={open}
        width={420}
        closeIcon={<CloseOutlined />}
        footer={
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            {/* Category Tags */}
            <div className="mb-3">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">
                Browse by category:
              </Text>
              <div className="flex flex-wrap gap-2">
                {faqCategories.map(category => (
                  <Tag
                    key={category.value}
                    color={selectedCategory === category.value ? 'blue' : 'default'}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleCategoryClick(category.value)}
                  >
                    {category.icon} {category.label}
                  </Tag>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <Search
              placeholder="Ask a question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSearch={handleSendMessage}
              onPressEnter={handleSendMessage}
              enterButton={<SendOutlined />}
              size="large"
              className="w-full"
            />
          </div>
        }
        className="help-assistant-drawer"
      >
        <div className="flex flex-col h-full pb-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'bot'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {message.type === 'bot' ? (
                        <RobotOutlined className="text-blue-600 dark:text-blue-400" />
                      ) : (
                        <UserOutlined className="text-gray-600 dark:text-gray-300" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                        message.type === 'bot'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <Paragraph className={`!mb-0 text-sm whitespace-pre-line ${
                          message.type === 'user' ? '!text-white' : '!text-inherit'
                        }`}>
                          {message.content}
                        </Paragraph>
                      </div>

                      {/* FAQ Results */}
                      {message.faqs && message.faqs.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.faqs.map(faq => (
                            <Card
                              key={faq.id}
                              size="small"
                              hoverable
                              onClick={() => handleFAQClick(faq)}
                              className="cursor-pointer border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <QuestionCircleOutlined className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <Text className="font-medium text-sm block dark:text-gray-200">
                                    {faq.question}
                                  </Text>
                                  <Text className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                    {faq.answer}
                                  </Text>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {messages.length === 0 && (
              <Empty
                description="Start a conversation to get help"
                className="mt-20"
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </Drawer>

      <style jsx global>{`
        .help-assistant-drawer .ant-drawer-body {
          padding: 16px;
        }

        .help-assistant-drawer .ant-drawer-footer {
          padding: 16px;
          background: var(--background);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  )
}
