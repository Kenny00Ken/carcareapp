'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

const colorClasses = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600'
};

export const ProgressBar: FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  color = 'primary',
  showPercentage = false,
  className,
  animated = true
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const ProgressElement = animated ? motion.div : 'div';

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <ProgressElement
          className={cn(
            'transition-all duration-300 ease-out rounded-full',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{ width: `${clampedProgress}%` }}
          {...(animated && {
            initial: { width: 0 },
            animate: { width: `${clampedProgress}%` },
            transition: { duration: 0.5, ease: 'easeOut' }
          })}
        />
      </div>
      
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};