'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

const sizeClasses = {
  sm: 'w-1 h-1',
  md: 'w-2 h-2',
  lg: 'w-3 h-3'
};

const colorClasses = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
  white: 'bg-white',
  gray: 'bg-gray-400'
};

export const LoadingDots: FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 }
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.1
          }}
          className={cn(
            'rounded-full',
            sizeClasses[size],
            colorClasses[color]
          )}
        />
      ))}
    </div>
  );
};