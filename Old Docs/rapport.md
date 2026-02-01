Résumé pour la Version Web (Next.js + Tailwind)

  Stack Recommandé

  - Framework : Next.js 14 (App Router)
  - Styling : Tailwind CSS
  - State : Zustand ou React Context
  - Backend : Supabase (même instance que iOS)
  - Auth : Supabase Auth (OTP SMS)
  - Images : Next/Image avec Supabase Storage

  ---
  Pages à Créer

  | Page Web          | Équivalent iOS          | Route Next.js          |
  |-------------------|-------------------------|------------------------|
  | Accueil           | HomeView                | /                      |
  | Épicerie          | EpicerieView            | /epicerie              |
  | Catégorie         | CategoryDetailView      | /epicerie/[categoryId] |
  | Restaurants       | EstablishmentListView   | /restaurants           |
  | Détail Restaurant | RestaurantDetailView    | /restaurants/[slug]    |
  | Commerces         | EstablishmentListView   | /commerces             |
  | Détail Commerce   | EstablishmentDetailView | /commerces/[slug]      |
  | Produit           | ProductDetailView       | /produit/[id]          |
  | Pack              | PackDetailView          | /pack/[id]             |
  | Panier            | CartView                | /panier                |
  | Mes Commandes     | OrdersListView          | /commandes             |
  | Détail Commande   | OrderDetailView         | /commandes/[id]        |
  | Profil            | ProfileView             | /profil                |
  | Fidélité          | LoyaltyView             | /fidelite              |
  | Login             | LoginView               | /login                 |

  ---
  Fonctionnalités Clés à Implémenter

  1. Authentification OTP (simple-otp, verify-otp)
  2. Catalogue produits/packs par vendeur
  3. Panier avec persistance localStorage
  4. Codes promo (validate-promo)
  5. Programme fidélité (points, tiers, récompenses)
  6. Commandes (create-order)
  7. Paiements (Wave, OM, Cash)
  8. Avis clients (reviews)
  9. Géolocalisation (adresse livraison)
  10. Deep links vers app mobile (Smart App Banner)

  ---
  Tables Supabase Utilisées

  users, vendors, products, vendor_categories, packs, pack_items
  orders, order_items, reviews, review_helpful
  promos, user_loyalty, loyalty_tiers, loyalty_rewards
  loyalty_transactions, loyalty_redemptions
  notifications, countries, neighborhoods, app_features

  ---
  Edge Functions

  | Fonction             | Usage              |
  |----------------------|--------------------|
  | simple-otp           | Envoyer OTP        |
  | verify-otp           | Vérifier OTP       |
  | validate-promo       | Valider code promo |
  | create-order         | Créer commande     |
  | initiate-payment     | Paiement mobile    |
  | check-payment-status | Vérifier paiement  |

