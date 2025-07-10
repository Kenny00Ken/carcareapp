'use client';

import { FC, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  loading: boolean;
  children: ReactNode;
  text?: string;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  backdrop?: 'light' | 'dark' | 'blur';
}

const backdropClasses = {
  light: 'bg-white/70',
  dark: 'bg-black/50',
  blur: 'bg-white/70 backdrop-blur-sm'
};

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  loading,
  children,
  text,
  className,
  spinnerSize = 'lg',
  backdrop = 'light'
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute inset-0 z-50 flex flex-col items-center justify-center',
              backdropClasses[backdrop]
            )}
          >
            <LoadingSpinner size={spinnerSize} />
            {text && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-3 text-sm text-gray-600 font-medium"
              >
                {text}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};