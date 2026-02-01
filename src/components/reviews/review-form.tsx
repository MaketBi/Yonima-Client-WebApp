'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createReview } from '@/actions/reviews';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  orderId: string;
  vendorId: string;
  vendorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-0.5 focus:outline-none"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors',
                (hoverValue || value) >= star
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({
  orderId,
  vendorId,
  vendorName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { toast } = useToast();

  const [vendorRating, setVendorRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (vendorRating === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez donner une note globale',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReview({
        orderId,
        vendorId,
        vendorRating,
        foodRating: foodRating || undefined,
        deliveryRating: deliveryRating || undefined,
        comment: comment.trim() || undefined,
        isAnonymous,
      });

      if (result.success) {
        toast({
          title: 'Merci pour votre avis',
          description: 'Votre avis a été publié avec succès',
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de publier l\'avis',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg">Évaluez {vendorName}</h3>
        <p className="text-sm text-muted-foreground">
          Partagez votre expérience avec les autres clients
        </p>
      </div>

      {/* Main Rating */}
      <div className="flex justify-center">
        <StarRating
          value={vendorRating}
          onChange={setVendorRating}
          label="Note globale *"
        />
      </div>

      {/* Additional Ratings */}
      <div className="grid grid-cols-2 gap-4">
        <StarRating
          value={foodRating}
          onChange={setFoodRating}
          label="Qualité des produits"
        />
        <StarRating
          value={deliveryRating}
          onChange={setDeliveryRating}
          label="Livraison"
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Votre commentaire (optionnel)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Décrivez votre expérience..."
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {comment.length}/500
        </p>
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(checked === true)}
        />
        <Label htmlFor="anonymous" className="text-sm cursor-pointer">
          Publier anonymement
        </Label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isSubmitting || vendorRating === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publication...
            </>
          ) : (
            'Publier mon avis'
          )}
        </Button>
      </div>
    </form>
  );
}
