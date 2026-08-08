'use client';

import { useMemo, useState } from 'react';
import { BadgeCheck, MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReviewResponseDialog } from './review-response-dialog';
import { formatOrderListDate, initialsOf } from '@/lib/vendor/format';
import {
  REVIEW_FILTERS,
  reviewDisplayName,
  reviewDisplayRating,
  reviewNeedsResponse,
  reviewRatingColor,
  type ReviewFilter,
  type VendorReview,
} from '@/types/vendor';

interface ReviewsViewProps {
  reviews: VendorReview[];
  canRespond: boolean;
}

const EMPTY_STATES: Record<ReviewFilter, { title: string; body: string }> = {
  all: {
    title: 'Aucun avis',
    body: "Vous n'avez pas encore reçu d'avis clients.",
  },
  needsResponse: {
    title: 'Tout est répondu !',
    body: 'Vous avez répondu à tous les avis. Excellent travail !',
  },
  responded: {
    title: 'Aucune réponse',
    body: "Vous n'avez pas encore répondu à un avis.",
  },
  negative: {
    title: 'Aucun avis négatif',
    body: "Félicitations ! Aucun client n'a laissé d'avis négatif.",
  },
};

function Stars({ rating }: { rating: number }) {
  const color = reviewRatingColor(rating);

  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className="h-3.5 w-3.5"
          style={{
            color: index <= rating ? color : '#E4E9E6',
            fill: index <= rating ? color : '#E4E9E6',
          }}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ReviewsView({ reviews, canRespond }: ReviewsViewProps) {
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [responding, setResponding] = useState<VendorReview | null>(null);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'needsResponse':
        return reviews.filter(reviewNeedsResponse);
      case 'responded':
        return reviews.filter((review) => !reviewNeedsResponse(review));
      case 'negative':
        return reviews.filter((review) => reviewDisplayRating(review) <= 2);
      default:
        return reviews;
    }
  }, [reviews, filter]);

  const needsResponseCount = reviews.filter(reviewNeedsResponse).length;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + reviewDisplayRating(review), 0) /
        reviews.length
      : 0;

  const empty = EMPTY_STATES[filter];

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center gap-6 rounded-2xl bg-white p-5 shadow-card">
        <div>
          <p className="flex items-baseline gap-1.5">
            <Star
              className="h-5 w-5 text-warning"
              style={{ fill: 'currentColor' }}
              aria-hidden="true"
            />
            <span className="text-[24px] font-bold">
              {averageRating.toFixed(1)}
            </span>
          </p>
          <p className="text-[12.5px] text-ink-muted">
            {reviews.length} avis
          </p>
        </div>

        <div className="border-l border-neutral-300 pl-6">
          <p
            className={cn(
              'text-[24px] font-bold',
              needsResponseCount > 0 ? 'text-warning-ink' : 'text-ink'
            )}
          >
            {needsResponseCount}
          </p>
          <p className="text-[12.5px] text-ink-muted">À répondre</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {REVIEW_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            className={cn(
              'inline-flex items-center gap-2 rounded-pill px-4 py-2 text-[13px] font-semibold transition-colors',
              filter === item.value
                ? 'bg-green-forest text-white'
                : 'bg-white text-ink-muted hover:text-ink'
            )}
          >
            {item.label}
            {item.value === 'needsResponse' && needsResponseCount > 0 && (
              <span
                className={cn(
                  'rounded-pill px-1.5 py-0.5 text-[11px] font-bold',
                  filter === item.value
                    ? 'bg-white/25 text-white'
                    : 'bg-warning-bg text-warning-ink'
                )}
              >
                {needsResponseCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[18px] bg-white px-6 py-16 text-center shadow-card">
          {filter === 'negative' ? (
            <ThumbsUp className="h-10 w-10 text-green-electric" aria-hidden="true" />
          ) : (
            <MessageSquare className="h-10 w-10 text-neutral-500" aria-hidden="true" />
          )}
          <h2 className="mt-4 text-[17px] font-bold">{empty.title}</h2>
          <p className="mt-1 text-[14px] text-ink-muted">{empty.body}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((review) => {
            const rating = reviewDisplayRating(review);
            const name = reviewDisplayName(review);

            return (
              <li key={review.id} className="rounded-2xl bg-white p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[13px] font-bold">
                    {review.is_anonymous ? '?' : initialsOf(name)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[14.5px] font-semibold">
                        {name}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-green-deep">
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Stars rating={rating} />
                      <span className="text-[12px] text-ink-muted">
                        {formatOrderListDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-3 text-[14px] leading-relaxed">{review.comment}</p>
                )}

                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-ink-muted">
                  {review.vendor_rating != null && (
                    <div className="flex gap-1.5">
                      <dt>Service</dt>
                      <dd className="font-semibold text-ink">{review.vendor_rating}/5</dd>
                    </div>
                  )}
                  {review.food_rating != null && (
                    <div className="flex gap-1.5">
                      <dt>Cuisine</dt>
                      <dd className="font-semibold text-ink">{review.food_rating}/5</dd>
                    </div>
                  )}
                  {review.delivery_rating != null && (
                    <div className="flex gap-1.5">
                      <dt>Livraison</dt>
                      <dd className="font-semibold text-ink">
                        {review.delivery_rating}/5
                      </dd>
                    </div>
                  )}
                </dl>

                {review.vendor_response && (
                  <div className="mt-3 rounded-xl bg-green-50 p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-green-deep">
                      Votre réponse
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed">
                      {review.vendor_response}
                    </p>
                  </div>
                )}

                {canRespond && (
                  <Button
                    variant={reviewNeedsResponse(review) ? 'default' : 'outline'}
                    onClick={() => setResponding(review)}
                    className="mt-3 h-10 rounded-xl"
                  >
                    {reviewNeedsResponse(review) ? 'Répondre' : 'Modifier la réponse'}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ReviewResponseDialog
        review={responding}
        onOpenChange={(open) => !open && setResponding(null)}
      />
    </div>
  );
}
