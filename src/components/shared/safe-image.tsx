'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallback?: React.ReactNode;
  fallbackClassName?: string;
}

export function SafeImage({
  src,
  alt,
  fallback,
  fallbackClassName,
  className,
  loading,
  priority,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted',
          fallbackClassName || className
        )}
      >
        {fallback || <span className="text-4xl">🏪</span>}
      </div>
    );
  }

  // next/image forbids `priority` together with `loading`. Only set the default
  // lazy loading when the image is NOT prioritized.
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      {...(priority ? {} : { loading: loading ?? 'lazy' })}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
