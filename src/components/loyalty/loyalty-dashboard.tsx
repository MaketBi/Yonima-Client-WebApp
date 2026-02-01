'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  Star,
  Gift,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Loader2,
  Check,
  Truck,
  Percent,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { redeemReward } from '@/actions/loyalty';
import { formatPrice } from '@/lib/utils';
import type {
  UserLoyalty,
  LoyaltyTier,
  LoyaltyTransaction,
  LoyaltyReward,
  LoyaltyRedemption,
  LoyaltyConfig,
} from '@/types/models';

interface LoyaltyDashboardProps {
  userLoyalty: UserLoyalty | null;
  tiers: LoyaltyTier[];
  transactions: LoyaltyTransaction[];
  rewards: LoyaltyReward[];
  pendingRedemptions: LoyaltyRedemption[];
  config: LoyaltyConfig | null;
}

const transactionIcons = {
  earned: TrendingUp,
  spent: TrendingDown,
  bonus: Sparkles,
  adjustment: Clock,
  expired: Clock,
};

const transactionColors = {
  earned: 'text-green-600',
  spent: 'text-red-600',
  bonus: 'text-purple-600',
  adjustment: 'text-orange-600',
  expired: 'text-gray-500',
};

const rewardTypeIcons = {
  discount_fixed: Percent,
  discount_percent: Percent,
  free_delivery: Truck,
  free_product: Package,
};

export function LoyaltyDashboard({
  userLoyalty,
  tiers,
  transactions,
  rewards,
  pendingRedemptions,
  config,
}: LoyaltyDashboardProps) {
  const { toast } = useToast();
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [localPoints, setLocalPoints] = useState(userLoyalty?.total_points || 0);
  const [localRedemptions, setLocalRedemptions] = useState(pendingRedemptions);

  const currentTier = userLoyalty?.tier;
  const nextTier = tiers.find((t) => t.min_points > (userLoyalty?.lifetime_points || 0));

  const progressToNextTier = nextTier
    ? Math.min(
        100,
        ((userLoyalty?.lifetime_points || 0) / nextTier.min_points) * 100
      )
    : 100;

  const pointsToNextTier = nextTier
    ? nextTier.min_points - (userLoyalty?.lifetime_points || 0)
    : 0;

  const handleRedeemReward = async () => {
    if (!selectedReward) return;

    setIsRedeeming(true);
    try {
      const result = await redeemReward(selectedReward.id);

      if (result.success && result.redemption) {
        setLocalPoints((prev) => prev - selectedReward.points_required);
        setLocalRedemptions((prev) => [result.redemption!, ...prev]);
        toast({
          title: 'Récompense échangée',
          description: `Vous avez obtenu: ${selectedReward.name}`,
        });
        setSelectedReward(null);
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible d\'échanger la récompense',
          variant: 'destructive',
        });
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  const getRewardDescription = (reward: LoyaltyReward) => {
    switch (reward.reward_type) {
      case 'discount_fixed':
        return `${formatPrice(reward.reward_value || 0)} de réduction`;
      case 'discount_percent':
        return `${reward.reward_value}% de réduction`;
      case 'free_delivery':
        return 'Livraison gratuite';
      case 'free_product':
        return 'Produit offert';
      default:
        return reward.description;
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
          <h1 className="font-semibold text-lg">Ma fidélité</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-6 space-y-6 max-w-2xl">
        {/* Points Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-90">Vos points</p>
                <p className="text-4xl font-bold">{localPoints.toLocaleString()}</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="h-8 w-8" />
              </div>
            </div>

            {/* Current Tier */}
            {currentTier && (
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30"
                  style={{ borderColor: currentTier.color }}
                >
                  <Award className="h-3 w-3 mr-1" />
                  {currentTier.name}
                </Badge>
                <span className="text-sm opacity-90">
                  x{currentTier.points_multiplier} points
                </span>
              </div>
            )}

            {/* Progress to next tier */}
            {nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-90">Prochain niveau: {nextTier.name}</span>
                  <span>{pointsToNextTier.toLocaleString()} pts restants</span>
                </div>
                <Progress value={progressToNextTier} className="h-2 bg-white/20" />
              </div>
            )}

            {!nextTier && currentTier && (
              <p className="text-sm opacity-90">
                Vous avez atteint le niveau maximum
              </p>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        {config && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Comment ça marche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Gagnez <strong className="text-foreground">1 point</strong> pour
                chaque <strong className="text-foreground">{formatPrice(config.points_per_amount)}</strong> dépensé
              </p>
              {config.welcome_bonus > 0 && (
                <p>
                  Bonus de bienvenue: <strong className="text-foreground">{config.welcome_bonus} points</strong>
                </p>
              )}
              {config.referral_bonus > 0 && (
                <p>
                  Parrainez un ami: <strong className="text-foreground">{config.referral_bonus} points</strong>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="rewards" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rewards">Récompenses</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="tiers">Niveaux</TabsTrigger>
          </TabsList>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4">
            {/* Pending Redemptions */}
            {localRedemptions.length > 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary">
                    Récompenses à utiliser
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {localRedemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Gift className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {redemption.reward?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            À utiliser lors de votre prochaine commande
                          </p>
                        </div>
                      </div>
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Available Rewards */}
            {rewards.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Aucune récompense disponible</h3>
                  <p className="text-sm text-muted-foreground">
                    De nouvelles récompenses seront bientôt disponibles
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => {
                  const canRedeem = localPoints >= reward.points_required;
                  const Icon = rewardTypeIcons[reward.reward_type] || Gift;

                  return (
                    <Card
                      key={reward.id}
                      className={`cursor-pointer transition-colors ${
                        canRedeem ? 'hover:border-primary' : 'opacity-60'
                      }`}
                      onClick={() => canRedeem && setSelectedReward(reward)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              canRedeem ? 'bg-primary/10' : 'bg-muted'
                            }`}
                          >
                            <Icon
                              className={`h-6 w-6 ${
                                canRedeem ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{reward.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {getRewardDescription(reward)}
                            </p>
                            {reward.min_order_amount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Min. {formatPrice(reward.min_order_amount)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${
                                canRedeem ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              {reward.points_required.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3">
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Aucune transaction</h3>
                  <p className="text-sm text-muted-foreground">
                    Vos transactions de points apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            ) : (
              transactions.map((transaction) => {
                const Icon = transactionIcons[transaction.type] || Clock;
                const colorClass = transactionColors[transaction.type] || 'text-gray-600';
                const isPositive = transaction.points > 0;

                return (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isPositive ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${colorClass}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {transaction.description || transaction.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </p>
                        </div>
                        <p
                          className={`font-bold ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {transaction.points.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers" className="space-y-3">
            {tiers.map((tier, index) => {
              const isCurrentTier = currentTier?.id === tier.id;
              const isAchieved =
                (userLoyalty?.lifetime_points || 0) >= tier.min_points;

              return (
                <Card
                  key={tier.id}
                  className={isCurrentTier ? 'border-primary bg-primary/5' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${tier.color}20` }}
                      >
                        <Award className="h-6 w-6" style={{ color: tier.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{tier.name}</p>
                          {isCurrentTier && (
                            <Badge variant="secondary" className="text-xs">
                              Actuel
                            </Badge>
                          )}
                          {isAchieved && !isCurrentTier && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          À partir de {tier.min_points.toLocaleString()} points cumulés
                        </p>
                        <p className="text-sm text-primary mt-1">
                          x{tier.points_multiplier} multiplicateur de points
                        </p>
                        {tier.benefits && tier.benefits.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {tier.benefits.map((benefit, i) => (
                              <li
                                key={i}
                                className="text-xs text-muted-foreground flex items-center gap-1"
                              >
                                <Check className="h-3 w-3 text-green-600" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Échanger cette récompense ?</DialogTitle>
            <DialogDescription>
              Vous allez échanger{' '}
              <strong>{selectedReward?.points_required.toLocaleString()} points</strong>{' '}
              contre:
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold">{selectedReward.name}</p>
              <p className="text-sm text-muted-foreground">
                {getRewardDescription(selectedReward)}
              </p>
              {selectedReward.valid_days > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Valable {selectedReward.valid_days} jours après l'échange
                </p>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedReward(null)}
              disabled={isRedeeming}
            >
              Annuler
            </Button>
            <Button onClick={handleRedeemReward} disabled={isRedeeming}>
              {isRedeeming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Échange en cours...
                </>
              ) : (
                'Confirmer l\'échange'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
