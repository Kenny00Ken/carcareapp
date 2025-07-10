'use client';

import { FC, ReactNode } from 'react';
import { Button } from 'antd';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps {
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  size?: 'small' | 'middle' | 'large';
  htmlType?: 'button' | 'submit' | 'reset';
  onClick?: () => void | Promise<void>;
  className?: string;
  loadingText?: string;
  icon?: ReactNode;
  block?: boolean;
  title?: string;
}

export const LoadingButton: FC<LoadingButtonProps> = ({
  loading = false,
  disabled = false,
  children,
  type = 'primary',
  size = 'middle',
  htmlType = 'button',
  onClick,
  className,
  loadingText,
  icon,
  block = false,
  title
}) => {
  const isDisabled = loading || disabled;
  const displayText = loading && loadingText ? loadingText : children;

  return (
    <Button
      type={type}
      size={size}
      htmlType={htmlType}
      onClick={onClick}
      disabled={isDisabled}
      block={block}
      title={title}
      className={cn(
        'flex items-center justify-center gap-2',
        loading && 'cursor-not-allowed',
        className
      )}
      icon={
        loading ? (
          <LoadingSpinner 
            size="sm" 
            color={type === 'primary' ? 'white' : 'primary'} 
          />
        ) : (
          icon
        )
      }
    >
      {displayText}
    </Button>
  );
};