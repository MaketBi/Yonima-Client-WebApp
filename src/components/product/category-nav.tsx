'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/models';

interface CategoryNavProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: CategoryNavProps) {
  const [active, setActive] = useState(activeCategory || categories[0]?.id);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCategory) {
      setActive(activeCategory);
    }
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActive(categoryId);
    onCategoryChange?.(categoryId);

    // Scroll to category section
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 140; // Header height + nav height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={cn('sticky top-16 z-40 bg-background border-b', className)}>
      <ScrollArea className="w-full">
        <div ref={containerRef} className="flex gap-2 p-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={active === category.id ? 'default' : 'outline'}
              size="sm"
              className="shrink-0"
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
