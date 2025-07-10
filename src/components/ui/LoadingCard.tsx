'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingCardProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  animated?: boolean;
}

export const LoadingCard: FC<LoadingCardProps> = ({
  className,
  lines = 3,
  showAvatar = false,
  animated = true
}) => {
  const pulseVariants = {
    initial: { opacity: 0.4 },
    animate: { opacity: 1 }
  };

  const Card = animated ? motion.div : 'div';
  const Line = animated ? motion.div : 'div';

  return (
    <Card
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
        className
      )}
      {...(animated && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <Line
            className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"
            {...(animated && {
              variants: pulseVariants,
              initial: 'initial',
              animate: 'animate',
              transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
            })}
          />
        )}
        
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Line
              key={index}
              className={cn(
                'h-4 bg-gray-200 rounded',
                index === 0 && 'w-3/4',
                index === 1 && 'w-full',
                index === lines - 1 && 'w-1/2'
              )}
              {...(animated && {
                variants: pulseVariants,
                initial: 'initial',
                animate: 'animate',
                transition: { 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatType: 'reverse',
                  delay: index * 0.1
                }
              })}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};