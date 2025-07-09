'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface HeroCarAnimationProps {
  className?: string
}

export const HeroCarAnimation: React.FC<HeroCarAnimationProps> = ({ className = "" }) => {
  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <svg
        viewBox="0 0 600 300"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="carBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#111827" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.5" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Road */}
        <motion.rect
          x="0"
          y="220"
          width="600"
          height="80"
          fill="#4B5563"
          opacity="0.3"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        
        {/* Road lines */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <rect x="50" y="258" width="40" height="4" fill="white" opacity="0.8" />
          <rect x="120" y="258" width="40" height="4" fill="white" opacity="0.8" />
          <rect x="190" y="258" width="40" height="4" fill="white" opacity="0.8" />
          <rect x="260" y="258" width="40" height="4" fill="white" opacity="0.8" />
          <rect x="330" y="258" width="40" height="4" fill="white" opacity="0.8" />
          <rect x="400" y="258" width="40" height="4" fill="white" opacity="0.8" />
          <rect x="470" y="258" width="40" height="4" fill="white" opacity="0.8" />
        </motion.g>
        
        {/* Car body */}
        <motion.g
          initial={{ x: -200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        >
          {/* Main car body */}
          <path
            d="M150 160 L450 160 L460 180 L470 200 L130 200 L140 180 Z"
            fill="url(#carBodyGradient)"
            filter="url(#glow)"
          />
          
          {/* Car roof */}
          <path
            d="M180 120 L420 120 L440 140 L450 160 L150 160 L160 140 Z"
            fill="url(#carBodyGradient)"
            opacity="0.9"
          />
          
          {/* Windows */}
          <path
            d="M190 130 L410 130 L430 150 L170 150 Z"
            fill="url(#windowGradient)"
          />
          
          {/* Car details */}
          <rect x="460" y="170" width="15" height="8" fill="white" opacity="0.9" rx="2" />
          <rect x="460" y="182" width="15" height="8" fill="#FCD34D" opacity="0.9" rx="2" />
          <rect x="125" y="170" width="15" height="8" fill="white" opacity="0.9" rx="2" />
          <rect x="125" y="182" width="15" height="8" fill="#FCD34D" opacity="0.9" rx="2" />
          
          {/* Door lines */}
          <line x1="250" y1="140" x2="250" y2="200" stroke="white" strokeWidth="2" opacity="0.3" />
          <line x1="350" y1="140" x2="350" y2="200" stroke="white" strokeWidth="2" opacity="0.3" />
        </motion.g>
        
        {/* Wheels */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <circle cx="200" cy="200" r="25" fill="url(#wheelGradient)" />
          <circle cx="200" cy="200" r="15" fill="#6B7280" />
          <circle cx="200" cy="200" r="8" fill="#9CA3AF" />
          
          <circle cx="400" cy="200" r="25" fill="url(#wheelGradient)" />
          <circle cx="400" cy="200" r="15" fill="#6B7280" />
          <circle cx="400" cy="200" r="8" fill="#9CA3AF" />
        </motion.g>
        
        {/* Wheel rotation animation */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "200px 200px" }}
        >
          <rect x="192" y="185" width="16" height="2" fill="#374151" />
          <rect x="192" y="210" width="16" height="2" fill="#374151" />
          <rect x="185" y="195" width="2" height="16" fill="#374151" />
          <rect x="210" y="195" width="2" height="16" fill="#374151" />
        </motion.g>
        
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "400px 200px" }}
        >
          <rect x="392" y="185" width="16" height="2" fill="#374151" />
          <rect x="392" y="210" width="16" height="2" fill="#374151" />
          <rect x="385" y="195" width="2" height="16" fill="#374151" />
          <rect x="410" y="195" width="2" height="16" fill="#374151" />
        </motion.g>
        
        {/* Floating service icons */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Wrench icon */}
          <motion.g
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="100" cy="80" r="20" fill="#059669" opacity="0.9" />
            <path d="M90 75 L110 75 L105 85 L95 85 Z" fill="white" />
            <path d="M95 85 L105 85 L100 95 L95 95 Z" fill="white" />
          </motion.g>
          
          {/* Parts icon */}
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <circle cx="500" cy="90" r="18" fill="#DC2626" opacity="0.9" />
            <rect x="490" y="82" width="20" height="16" fill="white" opacity="0.8" rx="2" />
            <rect x="492" y="85" width="16" height="3" fill="#DC2626" opacity="0.6" />
            <rect x="492" y="90" width="12" height="3" fill="#DC2626" opacity="0.6" />
          </motion.g>
          
          {/* Connection lines */}
          <motion.path
            d="M120 80 Q200 50 280 80"
            stroke="#059669"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
          />
          
          <motion.path
            d="M320 80 Q400 50 480 90"
            stroke="#DC2626"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1.8 }}
          />
        </motion.g>
        
        {/* Background elements */}
        <motion.circle
          cx="80"
          cy="50"
          r="3"
          fill="#3B82F6"
          opacity="0.4"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="520"
          cy="40"
          r="2"
          fill="#059669"
          opacity="0.4"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>
    </div>
  )
}

export default HeroCarAnimation