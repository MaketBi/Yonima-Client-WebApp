'use client';

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/models';

interface ReviewsSectionProps {
  vendorId: string;
  vendorName: string;
  reviews: Review[];
  rating: number | null;
  reviewCount: number;
  canReview?: boolean;
  pendingOrderId?: string;
}

function RatingBreakdown({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: Review[];
  rating: number | null;
  reviewCount: number;
}) {
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.vendor_rating === stars).length,
  }));

  return (
    <div className="flex gap-6 items-center">
      {/* Average Rating */}
      <div className="text-center">
        <p className="text-4xl font-bold">{rating?.toFixed(1) || '-'}</p>
        <div className="flex justify-center my-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-4 w-4',
                (rating || 0) >= star
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{reviewCount} avis</p>
      </div>

      {/* Rating Bars */}
      <div className="flex-1 space-y-1">
        {ratingCounts.map(({ stars, count }) => {
          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2 text-sm">
              <span className="w-3">{stars}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground text-xs">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewsSection({
  vendorId,
  vendorName,
  reviews,
  rating,
  reviewCount,
  canReview = false,
  pendingOrderId,
}: ReviewsSectionProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    // Refresh would be better but for now just close
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Avis clients
            </CardTitle>
            {canReview && pendingOrderId && (
              <Button size="sm" onClick={() => setShowReviewForm(true)}>
                Donner mon avis
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating Breakdown */}
          {reviewCount > 0 && (
            <RatingBreakdown
              reviews={localReviews}
              rating={rating}
              reviewCount={reviewCount}
            />
          )}

          {/* Reviews List */}
          {localReviews.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Aucun avis pour l'instant</h3>
              <p className="text-sm text-muted-foreground">
                Soyez le premier à donner votre avis
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-4">
              {localReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Donner mon avis</DialogTitle>
          </DialogHeader>
          {pendingOrderId && (
            <ReviewForm
              orderId={pendingOrderId}
              vendorId={vendorId}
              vendorName={vendorName}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
