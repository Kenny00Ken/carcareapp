'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface WorkflowIllustrationProps {
  className?: string
}

export const WorkflowIllustration: React.FC<WorkflowIllustrationProps> = ({ className = "" }) => {
  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      <svg
        viewBox="0 0 800 400"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1" />
          </linearGradient>
          
          <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="mechanicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="dealerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#B91C1C" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect width="800" height="400" fill="url(#bgGradient)" rx="20" />
        
        {/* Car Owner Section */}
        <motion.g
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <circle cx="150" cy="200" r="60" fill="url(#carGradient)" />
          <path d="M130 180 L170 180 L175 190 L125 190 Z" fill="white" opacity="0.8" />
          <circle cx="135" cy="205" r="12" fill="white" opacity="0.6" />
          <circle cx="165" cy="205" r="12" fill="white" opacity="0.6" />
          <text x="150" y="280" textAnchor="middle" className="text-sm font-medium fill-blue-600">
            Car Owner
          </text>
        </motion.g>
        
        {/* Mechanic Section */}
        <motion.g
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <circle cx="400" cy="150" r="60" fill="url(#mechanicGradient)" />
          <path d="M380 140 L420 140 L415 150 L385 150 Z" fill="white" opacity="0.8" />
          <path d="M385 155 L415 155 L410 165 L390 165 Z" fill="white" opacity="0.6" />
          <circle cx="400" cy="175" r="8" fill="white" opacity="0.8" />
          <text x="400" y="230" textAnchor="middle" className="text-sm font-medium fill-green-600">
            Mechanic
          </text>
        </motion.g>
        
        {/* Parts Dealer Section */}
        <motion.g
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <circle cx="650" cy="200" r="60" fill="url(#dealerGradient)" />
          <rect x="630" y="180" width="40" height="30" fill="white" opacity="0.8" rx="4" />
          <rect x="635" y="185" width="30" height="5" fill="currentColor" opacity="0.6" />
          <rect x="635" y="195" width="20" height="5" fill="currentColor" opacity="0.6" />
          <rect x="635" y="200" width="25" height="5" fill="currentColor" opacity="0.6" />
          <text x="650" y="280" textAnchor="middle" className="text-sm font-medium fill-red-600">
            Parts Dealer
          </text>
        </motion.g>
        
        {/* Connection Lines */}
        <motion.g
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
        >
          <path
            d="M210 200 Q300 180 340 150"
            stroke="#3B82F6"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
            opacity="0.7"
          />
          <path
            d="M460 150 Q550 180 590 200"
            stroke="#059669"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
            opacity="0.7"
          />
          <path
            d="M210 220 Q400 300 590 220"
            stroke="#DC2626"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
            opacity="0.7"
          />
        </motion.g>
        
        {/* Process Steps */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <rect x="300" y="320" width="200" height="60" fill="white" opacity="0.9" rx="8" />
          <text x="400" y="340" textAnchor="middle" className="text-xs font-medium fill-gray-600">
            Connect → Diagnose → Repair
          </text>
          <text x="400" y="360" textAnchor="middle" className="text-xs fill-gray-500">
            Seamless automotive care ecosystem
          </text>
        </motion.g>
        
        {/* Floating elements */}
        <motion.circle
          cx="100"
          cy="100"
          r="4"
          fill="#3B82F6"
          opacity="0.4"
          animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
        />
        <motion.circle
          cx="700"
          cy="100"
          r="3"
          fill="#059669"
          opacity="0.4"
          animate={{ y: [0, -8, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: [0.42, 0, 0.58, 1], delay: 0.5 }}
        />
        <motion.circle
          cx="500"
          cy="80"
          r="2"
          fill="#DC2626"
          opacity="0.4"
          animate={{ y: [0, -6, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: [0.42, 0, 0.58, 1], delay: 1 }}
        />
      </svg>
    </div>
  )
}

export default WorkflowIllustration