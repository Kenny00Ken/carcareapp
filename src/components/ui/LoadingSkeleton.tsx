'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
}

export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({
  className,
  width = '100%',
  height = '1rem',
  rounded = true,
  animated = true
}) => {
  const pulseVariants = {
    initial: { opacity: 0.4 },
    animate: { opacity: 1 }
  };

  const SkeletonElement = animated ? motion.div : 'div';

  return (
    <SkeletonElement
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        rounded ? 'rounded' : '',
        className
      )}
      style={{ width, height }}
      {...(animated && {
        variants: pulseVariants,
        initial: 'initial',
        animate: 'animate',
        transition: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse'
        }
      })}
    />
  );
};

interface LoadingSkeletonListProps {
  count: number;
  className?: string;
  itemClassName?: string;
  spacing?: string;
}

export const LoadingSkeletonList: FC<LoadingSkeletonListProps> = ({
  count,
  className,
  itemClassName,
  spacing = 'space-y-3'
}) => {
  return (
    <div className={cn(spacing, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          className={itemClassName}
          height="3rem"
        />
      ))}
    </div>
  );
};

interface LoadingSkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export const LoadingSkeletonCard: FC<LoadingSkeletonCardProps> = ({
  className,
  showHeader = true,
  showFooter = false,
  lines = 3
}) => {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm',
      className
    )}>
      {showHeader && (
        <div className="mb-4">
          <LoadingSkeleton height="1.5rem" width="60%" className="mb-2" />
          <LoadingSkeleton height="1rem" width="40%" />
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingSkeleton
            key={index}
            height="1rem"
            width={index === lines - 1 ? '70%' : '100%'}
          />
        ))}
      </div>
      
      {showFooter && (
        <div className="mt-4 flex justify-between items-center">
          <LoadingSkeleton height="2rem" width="5rem" />
          <LoadingSkeleton height="2rem" width="3rem" />
        </div>
      )}
    </div>
  );
};