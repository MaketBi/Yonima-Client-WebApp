'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  Star,
  MessageSquare,
  Edit2,
  Trash2,
  Loader2,
  MoreVertical,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ReviewForm } from './review-form';
import { deleteReview } from '@/actions/reviews';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/models';

interface MyReviewsProps {
  reviews: Review[];
  reviewableOrders: Array<{
    id: string;
    order_number: string;
    vendor_id: string;
    vendor: { id: string; name: string; logo_url: string | null };
    delivered_at: string;
  }>;
}

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

export function MyReviews({ reviews, reviewableOrders }: MyReviewsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [localReviews, setLocalReviews] = useState(reviews);
  const [localReviewableOrders, setLocalReviewableOrders] = useState(reviewableOrders);
  const [selectedOrder, setSelectedOrder] = useState<typeof reviewableOrders[0] | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReviewSuccess = () => {
    setSelectedOrder(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteReview(reviewToDelete.id);
      if (result.success) {
        setLocalReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
        toast({
          title: 'Avis supprimé',
          description: 'Votre avis a été supprimé',
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de supprimer l\'avis',
          variant: 'destructive',
        });
      }
    } finally {
      setIsDeleting(false);
      setReviewToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/profil">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">Mes avis</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-6 space-y-6 max-w-2xl">
        {/* Pending Reviews */}
        {localReviewableOrders.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Commandes à évaluer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {localReviewableOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg"
                >
                  <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {order.vendor.logo_url ? (
                      <Image
                        src={order.vendor.logo_url}
                        alt={order.vendor.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{order.vendor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Commande #{order.order_number}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setSelectedOrder(order)}>
                    Évaluer
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* My Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mes avis publiés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {localReviews.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Aucun avis publié</h3>
                <p className="text-sm text-muted-foreground">
                  Vos avis apparaîtront ici après avoir évalué vos commandes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {localReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-4"
                  >
                    {/* Vendor Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {review.vendor?.logo_url ? (
                            <Image
                              src={review.vendor.logo_url}
                              alt={review.vendor.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Store className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {review.vendor?.name || 'Établissement'}
                          </p>
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
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setReviewToDelete(review)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-4 mb-2">
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
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}

                    {/* Vendor Response */}
                    {review.vendor_response && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-3">
                        <p className="text-xs font-medium mb-1">Réponse du vendeur</p>
                        <p className="text-sm text-muted-foreground">
                          {review.vendor_response}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Form Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Donner mon avis</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <ReviewForm
              orderId={selectedOrder.id}
              vendorId={selectedOrder.vendor_id}
              vendorName={selectedOrder.vendor.name}
              onSuccess={handleReviewSuccess}
              onCancel={() => setSelectedOrder(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!reviewToDelete} onOpenChange={() => setReviewToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet avis ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Votre avis sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewToDelete(null)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
