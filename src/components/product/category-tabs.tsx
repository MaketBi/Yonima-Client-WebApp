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
  // Suspend le scroll-spy pendant un scroll programmé (clic sur un onglet),
  // sinon l'observer entre en conflit avec le scrollTo et fait « sauter » l'onglet.
  const clickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeCategory) {
      setActive(activeCategory);
    }
  }, [activeCategory]);

  // Scroll-spy : surligne l'onglet de la section la plus haute visible.
  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (clickScrollingRef.current) return;
        // Parmi les sections en intersection, prendre celle la plus proche du haut.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace('category-', '');
          setActive(id);
        }
      },
      // Zone d'activation : sous le header + les onglets collés (~120px), jusqu'à
      // ~40% du bas → la section « active » est celle qui entre en haut de l'écran.
      { rootMargin: '-120px 0px -60% 0px', threshold: 0 }
    );

    const elements = categories
      .map((c) => document.getElementById(`category-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [categories]);

  // Nettoyage du timeout au démontage.
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  // Garde l'onglet actif visible dans la barre horizontale quand il change au scroll.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;
    const btn = container.querySelector<HTMLElement>(`[data-category-id="${active}"]`);
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);

  const handleCategoryClick = (categoryId: string) => {
    setActive(categoryId);
    onCategoryChange?.(categoryId);

    // Suspend le scroll-spy le temps du scroll animé.
    clickScrollingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      clickScrollingRef.current = false;
    }, 700);

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
    <div className={cn('sticky top-[64px] z-40 bg-background border-b', className)}>
      <ScrollArea className="w-full">
        <div ref={containerRef} className="flex gap-2 px-4 py-3">
          {categories.map((category) => (
            <button
              key={category.id}
              data-category-id={category.id}
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
