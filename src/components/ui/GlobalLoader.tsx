'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface GlobalLoaderProps {
  message?: string;
  showLogo?: boolean;
}

export const GlobalLoader: FC<GlobalLoaderProps> = ({
  message = 'Loading...',
  showLogo = true
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-4"
      >
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-blue-600"
          >
            CarCare
          </motion.div>
        )}
        
        <LoadingSpinner size="xl" />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-sm font-medium"
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};