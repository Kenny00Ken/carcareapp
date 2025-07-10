# Unified Loading System Documentation

## Overview

The CarCare app now features a unified, professional loading system that provides consistent loading experiences across the entire application. This system replaces all previous loading implementations with a cohesive set of components and utilities.

## Key Features

- **Consistent Design**: All loading components follow the same visual design language
- **Smooth Animations**: Professional animations using Framer Motion
- **Flexible Configuration**: Highly customizable components for different use cases
- **Type Safety**: Full TypeScript support with proper type definitions
- **Performance Optimized**: Efficient rendering with minimal re-renders
- **Responsive**: Works seamlessly across all device sizes

## Components

### 1. LoadingSpinner

A modern, animated spinner component.

```tsx
import { LoadingSpinner } from '@/components/ui';

// Basic usage
<LoadingSpinner />

// With custom size and color
<LoadingSpinner size="lg" color="primary" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `color`: 'primary' | 'secondary' | 'white' | 'gray' (default: 'primary')
- `className`: string (optional)

### 2. LoadingDots

An animated dots loader for subtle loading states.

```tsx
import { LoadingDots } from '@/components/ui';

<LoadingDots size="md" color="primary" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'primary' | 'secondary' | 'white' | 'gray' (default: 'primary')
- `className`: string (optional)

### 3. LoadingButton

A button component with integrated loading states.

```tsx
import { LoadingButton } from '@/components/ui';

<LoadingButton 
  loading={isLoading}
  loadingText="Saving..."
  onClick={handleSave}
>
  Save Changes
</LoadingButton>
```

**Props:**
- `loading`: boolean (default: false)
- `loadingText`: string (optional)
- `disabled`: boolean (default: false)
- `type`: 'primary' | 'default' | 'dashed' | 'text' | 'link' (default: 'primary')
- `size`: 'small' | 'middle' | 'large' (default: 'middle')
- `block`: boolean (default: false)
- `onClick`: function (optional)
- `className`: string (optional)

### 4. LoadingOverlay

A full overlay component for loading states.

```tsx
import { LoadingOverlay } from '@/components/ui';

<LoadingOverlay loading={isLoading} text="Processing...">
  <YourContent />
</LoadingOverlay>
```

**Props:**
- `loading`: boolean (required)
- `text`: string (optional)
- `spinnerSize`: 'sm' | 'md' | 'lg' | 'xl' (default: 'lg')
- `backdrop`: 'light' | 'dark' | 'blur' (default: 'light')
- `className`: string (optional)

### 5. LoadingCard

A skeleton loading card for content placeholders.

```tsx
import { LoadingCard } from '@/components/ui';

<LoadingCard lines={3} showAvatar animated />
```

**Props:**
- `lines`: number (default: 3)
- `showAvatar`: boolean (default: false)
- `animated`: boolean (default: true)
- `className`: string (optional)

### 6. ProgressBar

A progress bar component with smooth animations.

```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar 
  progress={75}
  showPercentage
  color="success"
  animated
/>
```

**Props:**
- `progress`: number (0-100, required)
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' (default: 'primary')
- `showPercentage`: boolean (default: false)
- `animated`: boolean (default: true)
- `className`: string (optional)

### 7. GlobalLoader

A full-screen loading component for app-wide loading states.

```tsx
import { GlobalLoader } from '@/components/ui';

<GlobalLoader message="Loading application..." showLogo />
```

**Props:**
- `message`: string (default: 'Loading...')
- `showLogo`: boolean (default: true)

### 8. LoadingSkeleton

Flexible skeleton components for content placeholders.

```tsx
import { LoadingSkeleton, LoadingSkeletonList, LoadingSkeletonCard } from '@/components/ui';

// Basic skeleton
<LoadingSkeleton width="100%" height="2rem" />

// List of skeletons
<LoadingSkeletonList count={5} />

// Card skeleton
<LoadingSkeletonCard showHeader showFooter lines={4} />
```

## Hooks

### useLoading

A custom hook for managing loading states.

```tsx
import { useLoading } from '@/hooks/useLoading';

const { loading, setLoading, startLoading, stopLoading, withLoading } = useLoading();

// Wrap async operations
const handleSubmit = async () => {
  await withLoading(async () => {
    // Your async operation
    await saveData();
  });
};
```

**Returns:**
- `loading`: boolean
- `setLoading`: (loading: boolean) => void
- `startLoading`: () => void
- `stopLoading`: () => void
- `withLoading`: (fn: () => Promise<T>) => Promise<T>

### useAsyncOperation

A hook for handling async operations with loading, error, and success states.

```tsx
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

const { data, loading, error, execute, reset } = useAsyncOperation();

const handleFetch = () => {
  execute(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
};
```

**Returns:**
- `data`: T | null
- `loading`: boolean
- `error`: Error | null
- `execute`: (operation: () => Promise<T>) => Promise<T | null>
- `reset`: () => void

## Usage Examples

### 1. Form Submission

```tsx
import { LoadingButton } from '@/components/ui';
import { useLoading } from '@/hooks/useLoading';

const MyForm = () => {
  const { loading, withLoading } = useLoading();

  const handleSubmit = async (values) => {
    await withLoading(async () => {
      await submitForm(values);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <LoadingButton 
        loading={loading}
        loadingText="Submitting..."
        htmlType="submit"
      >
        Submit
      </LoadingButton>
    </form>
  );
};
```

### 2. Data Fetching

```tsx
import { LoadingOverlay, LoadingCard } from '@/components/ui';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

const DataList = () => {
  const { data, loading, execute } = useAsyncOperation();

  useEffect(() => {
    execute(async () => {
      const response = await fetch('/api/data');
      return response.json();
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingCard key={i} lines={2} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### 3. File Upload

```tsx
import { ProgressBar, LoadingButton } from '@/components/ui';
import { useState } from 'react';

const FileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    setProgress(0);

    // Simulate upload with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-4">
      <LoadingButton
        loading={uploading}
        loadingText={`Uploading... ${progress}%`}
        onClick={() => handleUpload(file)}
      >
        Upload File
      </LoadingButton>
      
      {uploading && (
        <ProgressBar 
          progress={progress}
          showPercentage
          color="primary"
        />
      )}
    </div>
  );
};
```

## Best Practices

1. **Consistent Usage**: Always use the unified loading components instead of custom implementations
2. **Appropriate Feedback**: Choose the right loading component for the context (spinner for small actions, overlay for full content)
3. **Meaningful Messages**: Provide clear, descriptive loading messages
4. **Timeout Handling**: Always handle timeouts and error states
5. **Accessibility**: Loading states are automatically accessible with proper ARIA attributes

## Migration Guide

To migrate from old loading implementations:

1. Replace `useState` loading states with `useLoading` hook
2. Replace `Button` with `loading` prop with `LoadingButton`
3. Replace `Spin` components with `LoadingSpinner`
4. Replace custom progress bars with `ProgressBar`
5. Use `LoadingOverlay` for full content loading states

## Performance Considerations

- All animations are GPU-accelerated using Framer Motion
- Components use React.memo for optimal re-rendering
- Lazy loading is implemented where appropriate
- Minimal bundle impact with tree-shaking support

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Components not animating**: Ensure Framer Motion is properly installed
2. **TypeScript errors**: Check that all required props are provided
3. **Styling issues**: Verify Tailwind CSS classes are being processed correctly

### Debug Mode

Set `NODE_ENV=development` to enable debug logging for loading states.

---

For more examples and advanced usage, check the test file at `/src/test/loading-test.tsx`.