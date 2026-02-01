'use client';

import { useRef, useState, useEffect } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { VendorCategory } from '@/types/models';

interface CategoryTabsProps {
  categories: VendorCategory[];
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
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
      const headerOffset = 120; // Header height + tabs height
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
    <div className={cn('sticky top-[60px] z-40 bg-background border-b', className)}>
      <ScrollArea className="w-full">
        <div ref={containerRef} className="flex gap-2 px-4 py-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                active === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
