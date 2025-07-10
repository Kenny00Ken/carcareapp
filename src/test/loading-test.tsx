import React from 'react';
import { 
  LoadingSpinner, 
  LoadingDots, 
  LoadingButton, 
  LoadingOverlay, 
  LoadingCard, 
  ProgressBar, 
  GlobalLoader,
  LoadingSkeleton
} from '@/components/ui';

export const LoadingTest = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Loading Components Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LoadingSpinner</h2>
        <div className="flex gap-4">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
          <LoadingSpinner size="xl" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LoadingDots</h2>
        <div className="flex gap-4">
          <LoadingDots size="sm" />
          <LoadingDots size="md" />
          <LoadingDots size="lg" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LoadingButton</h2>
        <div className="flex gap-4">
          <LoadingButton loading={false}>Click me</LoadingButton>
          <LoadingButton loading={true} loadingText="Loading...">Click me</LoadingButton>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">ProgressBar</h2>
        <div className="space-y-2">
          <ProgressBar progress={25} showPercentage />
          <ProgressBar progress={50} color="success" showPercentage />
          <ProgressBar progress={75} color="warning" showPercentage />
          <ProgressBar progress={100} color="success" showPercentage />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LoadingCard</h2>
        <div className="grid grid-cols-2 gap-4">
          <LoadingCard lines={2} />
          <LoadingCard lines={3} showAvatar />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LoadingSkeleton</h2>
        <div className="space-y-2">
          <LoadingSkeleton height="1rem" width="100%" />
          <LoadingSkeleton height="2rem" width="75%" />
          <LoadingSkeleton height="3rem" width="50%" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">LoadingOverlay</h2>
        <LoadingOverlay loading={true} text="Loading content...">
          <div className="bg-gray-100 p-8 rounded">
            <p>This content is overlaid with loading</p>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
};