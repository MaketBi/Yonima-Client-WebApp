'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Star,
  ThumbsUp,
  Flag,
  MoreVertical,
  User,
  BadgeCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { markReviewHelpful, reportReview } from '@/actions/reviews';
import { cn } from '@/lib/utils';
import type { Review, ReportReason } from '@/types/models';

interface ReviewCardProps {
  review: Review;
  showVendor?: boolean;
}

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'fake', label: 'Avis faux ou trompeur' },
  { value: 'offensive', label: 'Langage offensant' },
  { value: 'other', label: 'Autre raison' },
];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-4 w-4',
            rating >= star
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review, showVendor = false }: ReviewCardProps) {
  const { toast } = useToast();
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleMarkHelpful = async () => {
    if (hasMarkedHelpful || isMarkingHelpful) return;

    setIsMarkingHelpful(true);
    try {
      const result = await markReviewHelpful(review.id);
      if (result.success) {
        setHelpfulCount((prev) => prev + 1);
        setHasMarkedHelpful(true);
      }
    } finally {
      setIsMarkingHelpful(false);
    }
  };

  const handleReport = async () => {
    setIsReporting(true);
    try {
      const result = await reportReview(review.id, reportReason, reportDescription);
      if (result.success) {
        toast({
          title: 'Signalement envoyé',
          description: 'Merci pour votre signalement. Nous allons examiner cet avis.',
        });
        setShowReportDialog(false);
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de signaler l\'avis',
          variant: 'destructive',
        });
      }
    } finally {
      setIsReporting(false);
    }
  };

  const displayName = review.is_anonymous
    ? 'Anonyme'
    : review.user?.full_name || 'Utilisateur';

  return (
    <>
      <Card>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{displayName}</span>
                  {review.is_verified_purchase && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Vendor (if shown) */}
          {showVendor && review.vendor && (
            <p className="text-sm text-muted-foreground mb-2">
              {review.vendor.name}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-4 mb-3">
            <StarDisplay rating={review.vendor_rating || 0} />
            {review.food_rating && (
              <span className="text-xs text-muted-foreground">
                Produits: {review.food_rating}/5
              </span>
            )}
            {review.delivery_rating && (
              <span className="text-xs text-muted-foreground">
                Livraison: {review.delivery_rating}/5
              </span>
            )}
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
          )}

          {/* Vendor Response */}
          {review.vendor_response && (
            <div className="bg-muted/50 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium mb-1">Réponse du vendeur</p>
              <p className="text-sm text-muted-foreground">{review.vendor_response}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'text-muted-foreground',
                hasMarkedHelpful && 'text-primary'
              )}
              onClick={handleMarkHelpful}
              disabled={hasMarkedHelpful || isMarkingHelpful}
            >
              {isMarkingHelpful ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ThumbsUp className="h-4 w-4 mr-1" />
              )}
              Utile {helpfulCount > 0 && `(${helpfulCount})`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler cet avis</DialogTitle>
            <DialogDescription>
              Pourquoi souhaitez-vous signaler cet avis ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup
              value={reportReason}
              onValueChange={(value) => setReportReason(value as ReportReason)}
            >
              {reportReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value}>{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>

            {reportReason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="description">Précisez (optionnel)</Label>
                <Textarea
                  id="description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Décrivez le problème..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
              disabled={isReporting}
            >
              Annuler
            </Button>
            <Button onClick={handleReport} disabled={isReporting}>
              {isReporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer le signalement'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
