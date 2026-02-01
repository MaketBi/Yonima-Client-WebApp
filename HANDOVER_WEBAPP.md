# Yonima Client WebApp - Handover Document

## Vue d'ensemble du projet

Yonima est une plateforme de livraison à la demande pour Dakar, Sénégal. Cette webapp Next.js 15 est la version client permettant aux utilisateurs de :
- Parcourir les restaurants, commerces et l'épicerie
- Passer des commandes avec livraison
- Payer via Wave, Orange Money ou espèces
- Suivre leurs commandes en temps réel

**Stack technique :**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- Zustand (State management)
- Leaflet (Cartes)

---

## Architecture du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Pages authentification (login, register)
│   ├── (main)/            # Pages principales avec BottomNav
│   │   ├── page.tsx       # Accueil
│   │   ├── restaurants/   # Liste et détails restaurants
│   │   ├── commerces/     # Liste et détails commerces
│   │   ├── epicerie/      # Épicerie (single vendor)
│   │   ├── panier/        # Panier
│   │   ├── commandes/     # Liste et détails commandes
│   │   └── profil/        # Profil utilisateur (à compléter)
│   └── layout.tsx
├── actions/               # Server Actions (API calls)
│   ├── auth.ts           # Authentification
│   ├── catalog.ts        # Produits, vendors, catégories
│   ├── orders.ts         # Création et suivi commandes
│   ├── addresses.ts      # Adresses enregistrées
│   ├── neighborhoods.ts  # Quartiers et zones de livraison
│   └── user.ts           # Profil utilisateur (default_landmark)
├── components/
│   ├── ui/               # Composants shadcn/ui
│   ├── layout/           # Header, BottomNav, etc.
│   ├── shared/           # Composants réutilisables
│   └── checkout/         # Composants checkout (AddressPicker, etc.)
├── hooks/                # Custom hooks
│   ├── use-auth.ts       # Hook authentification
│   └── use-location.ts   # Hook géolocalisation
├── lib/
│   ├── supabase/         # Client Supabase (client + server)
│   ├── constants.ts      # Constantes (routes, statuts, etc.)
│   └── utils.ts          # Utilitaires (formatPrice, cn, etc.)
├── stores/               # Zustand stores
│   ├── cart-store.ts     # Panier
│   └── delivery-address-store.ts  # Adresse de livraison
└── types/
    └── models.ts         # Types TypeScript (User, Order, Vendor, etc.)
```

---

## Phases complétées

### Phase 1 : Setup & Authentification ✅
- Configuration Next.js 15 + TypeScript + Tailwind
- Intégration Supabase Auth (OTP SMS)
- Pages login/register avec sélection pays
- Hook `useAuth` pour gestion session
- Middleware protection routes

### Phase 2 : Catalogue ✅
- Liste restaurants avec filtres et recherche
- Liste commerces avec catégories
- Page épicerie (vendor unique avec catégories)
- Pages détails établissement avec menu/produits
- Composant SafeImage avec fallback

### Phase 3 : Navigation & Layout ✅
- Header responsive avec recherche
- BottomNav mobile (5 onglets)
- Layout principal avec scroll infini
- Gestion hydration SSR/Client

### Phase 4 : Panier & Commandes ✅
- Store Zustand persisté pour panier
- Page panier avec gestion quantités
- Frais de livraison dynamiques par établissement
- Page confirmation commande
- Intégration paiements (Wave, Orange Money, Cash)
- Page détails commande avec suivi statut
- Liste des commandes utilisateur

### Phase 5 : Adresse de livraison ✅
- Store Zustand partagé pour adresse
- AddressPickerScreen avec carte Leaflet
- Sélection ville/quartier depuis BDD (table `neighborhoods`)
- Géolocalisation automatique ("Me localiser")
- Validation zone de livraison (algorithme Haversine)
- Chargement/sauvegarde `default_landmark` (table `users`)
- Gestion adresses enregistrées (table `delivery_addresses`)
- Bouton localisation sur page d'accueil

---

## Phases restantes à implémenter

### Phase 6 : Profil utilisateur

**Objectif :** Permettre à l'utilisateur de gérer son compte et ses préférences.

**Fichiers à créer/modifier :**
- `src/app/(main)/profil/page.tsx` - Page profil principale
- `src/app/(main)/profil/edit/page.tsx` - Édition profil
- `src/app/(main)/profil/addresses/page.tsx` - Gestion adresses
- `src/actions/user.ts` - Ajouter fonctions update profil

**Fonctionnalités :**
1. **Affichage profil**
   - Avatar (upload vers Supabase Storage)
   - Nom complet
   - Numéro de téléphone (non modifiable)
   - Email (optionnel)
   - Bouton déconnexion

2. **Édition profil**
   - Modifier nom complet
   - Modifier email
   - Modifier avatar
   - Modifier `default_landmark`

3. **Gestion adresses**
   - Liste des adresses enregistrées
   - Ajouter nouvelle adresse
   - Modifier adresse existante
   - Supprimer adresse
   - Définir adresse par défaut

4. **Paramètres**
   - Notifications push (activer/désactiver)
   - Langue (si multilingue)
   - Supprimer compte

**Tables Supabase concernées :**
- `users` : id, phone, full_name, email, avatar_url, default_landmark
- `delivery_addresses` : id, user_id, label, address, latitude, longitude, additional_info, is_default

**Actions existantes à utiliser/étendre :**
```typescript
// src/actions/user.ts - Fonctions existantes
getDefaultLandmark()
updateDefaultLandmark(landmark: string)

// Fonctions à ajouter
updateUserProfile(data: { full_name?: string; email?: string; avatar_url?: string })
uploadAvatar(file: File): Promise<string> // Retourne l'URL
deleteAccount()
```

---

### Phase 7 : Programme fidélité

**Objectif :** Système de points de fidélité pour récompenser les clients réguliers.

**Fichiers à créer :**
- `src/app/(main)/fidelite/page.tsx` - Page programme fidélité
- `src/actions/loyalty.ts` - Actions fidélité
- `src/components/loyalty/` - Composants fidélité

**Fonctionnalités :**
1. **Affichage points**
   - Solde actuel de points
   - Historique des gains/utilisations
   - Niveau de fidélité (Bronze, Silver, Gold, Platinum)

2. **Gains de points**
   - Points gagnés par commande (ex: 1 point / 100 FCFA)
   - Bonus première commande
   - Bonus parrainage

3. **Utilisation points**
   - Convertir points en réduction
   - Appliquer réduction au checkout
   - Taux de conversion (ex: 100 points = 500 FCFA)

4. **Récompenses spéciales**
   - Livraison gratuite à X points
   - Réductions exclusives par niveau

**Tables Supabase concernées :**
- `loyalty_points` : id, user_id, points_balance, lifetime_points, level
- `loyalty_transactions` : id, user_id, points, type (earned/redeemed), order_id, description, created_at

**Intégration checkout :**
```typescript
// Dans src/app/(main)/commandes/nouveau/page.tsx
// Ajouter section pour utiliser les points
const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

// Calculer réduction
const loyaltyPointsAvailable = await getLoyaltyPoints();
const maxLoyaltyDiscount = Math.floor(loyaltyPointsAvailable / 100) * 500; // 100 pts = 500 FCFA
```

---

### Phase 8 : Avis clients

**Objectif :** Permettre aux clients de noter et commenter leurs commandes.

**Fichiers à créer :**
- `src/app/(main)/commandes/[id]/review/page.tsx` - Page création avis
- `src/actions/reviews.ts` - Actions avis
- `src/components/reviews/` - Composants avis (étoiles, carte avis, etc.)

**Fonctionnalités :**
1. **Création avis** (après livraison)
   - Note globale (1-5 étoiles)
   - Note qualité nourriture
   - Note rapidité livraison
   - Commentaire texte (optionnel)
   - Photos (optionnel)

2. **Affichage avis**
   - Sur page établissement
   - Note moyenne et nombre d'avis
   - Liste des derniers avis
   - Filtrer par note

3. **Gestion avis**
   - Modifier son avis (dans les 24h)
   - Signaler un avis inapproprié

**Tables Supabase concernées :**
- `reviews` : id, user_id, vendor_id, order_id, rating, food_rating, delivery_rating, comment, photos, created_at, updated_at
- `vendors` : Mettre à jour rating et review_count (trigger ou Edge Function)

**Trigger notification avis :**
```sql
-- Après livraison, envoyer notification pour demander avis
-- Délai recommandé : 30 minutes après status = 'delivered'
```

**Composant ReviewPrompt :**
```typescript
// Afficher prompt pour laisser avis sur commandes récentes non notées
// Sur la page d'accueil ou page commandes
```

---

### Phase 9 : Finitions (SEO, PWA, Analytics)

#### 9.1 SEO

**Fichiers à créer/modifier :**
- `src/app/layout.tsx` - Metadata globale
- `src/app/sitemap.ts` - Sitemap dynamique
- `src/app/robots.ts` - Robots.txt

**Tâches :**
1. **Metadata dynamique**
   ```typescript
   // Pour chaque page établissement
   export async function generateMetadata({ params }): Promise<Metadata> {
     const vendor = await getVendor(params.slug);
     return {
       title: `${vendor.name} - Livraison Dakar | Yonima`,
       description: vendor.description,
       openGraph: {
         images: [vendor.cover_image_url],
       },
     };
   }
   ```

2. **Structured Data (JSON-LD)**
   - Restaurant schema pour établissements
   - LocalBusiness schema
   - BreadcrumbList schema

3. **Sitemap dynamique**
   ```typescript
   // src/app/sitemap.ts
   export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
     const vendors = await getAllVendors();
     return [
       { url: 'https://yonima.sn', lastModified: new Date() },
       { url: 'https://yonima.sn/restaurants', lastModified: new Date() },
       ...vendors.map(v => ({
         url: `https://yonima.sn/restaurants/${v.slug}`,
         lastModified: v.updated_at,
       })),
     ];
   }
   ```

#### 9.2 PWA (Progressive Web App)

**Fichiers à créer :**
- `public/manifest.json` - Web App Manifest
- `src/app/sw.ts` ou `next.config.js` - Service Worker (next-pwa)

**Tâches :**
1. **Manifest**
   ```json
   {
     "name": "Yonima - Livraison Dakar",
     "short_name": "Yonima",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#10b981",
     "icons": [
       { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   ```

2. **Service Worker**
   - Cache assets statiques
   - Cache API responses (catalogue)
   - Offline fallback page

3. **Install prompt**
   - Détecter si installable
   - Afficher banner "Ajouter à l'écran d'accueil"

4. **Push Notifications** (Web Push)
   - Demander permission
   - Enregistrer token dans Supabase
   - Recevoir notifications statut commande

#### 9.3 Analytics

**Intégrations recommandées :**
1. **Google Analytics 4**
   ```typescript
   // src/components/analytics/google-analytics.tsx
   // Tracker événements : page_view, add_to_cart, purchase, etc.
   ```

2. **Facebook Pixel** (pour ads)
   ```typescript
   // Événements : ViewContent, AddToCart, InitiateCheckout, Purchase
   ```

3. **Événements à tracker :**
   - `page_view` - Toutes les pages
   - `view_item` - Vue produit/établissement
   - `add_to_cart` - Ajout panier
   - `remove_from_cart` - Suppression panier
   - `begin_checkout` - Début checkout
   - `add_payment_info` - Sélection paiement
   - `purchase` - Commande confirmée
   - `search` - Recherche effectuée

---

## Informations techniques importantes

### Authentification
- OTP SMS via Supabase Auth
- Session stockée côté client (cookies)
- Hook `useAuth()` pour accéder à l'utilisateur

### Paiements
- **Wave** : Redirection vers page paiement Wave
- **Orange Money** : Redirection vers page paiement OM
- **Cash** : Création commande directe
- Edge Functions : `create-order`, `mobile-payment`, `check-payment-status`

### Stores Zustand
```typescript
// Panier - src/stores/cart-store.ts
useCartStore() // items, establishment, addItem, removeItem, clear, getTotal...

// Adresse - src/stores/delivery-address-store.ts
useDeliveryAddressStore() // formattedAddress, city, neighborhood, additionalInfo, setAddress...
```

### Variables d'environnement
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Commandes utiles
```bash
npm run dev          # Développement (port 3000)
npm run build        # Build production
npm run lint         # Linting
npx tsc --noEmit     # Vérification TypeScript
```

---

## Tables Supabase principales

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs (lié à auth.users) |
| `vendors` | Établissements (restaurants, commerces, épicerie) |
| `vendor_categories` | Catégories par établissement |
| `products` | Produits/plats |
| `packs` | Menus/combos |
| `orders` | Commandes |
| `order_items` | Articles de commande |
| `delivery_addresses` | Adresses enregistrées |
| `neighborhoods` | Quartiers/zones de livraison |
| `loyalty_points` | Points fidélité (à créer) |
| `reviews` | Avis clients (à créer) |

---

## Contact & Ressources

- **Repo GitHub** : https://github.com/MaketBi/Yonima-Client-WebApp
- **Design Reference** : Voir maquettes Figma (demander accès)
- **API Documentation** : Edge Functions dans Supabase Dashboard
- **App Android** : Repo séparé (yonima-android-client)

---

## Notes importantes

1. **Zone de livraison** : Uniquement Dakar et environs. La validation se fait via la table `neighborhoods` et l'algorithme Haversine.

2. **Devise** : Tout est en FCFA (Franc CFA). Utiliser `formatPrice()` de `src/lib/utils.ts`.

3. **Langue** : Interface en français uniquement pour l'instant.

4. **Mobile-first** : Le design est optimisé mobile. Toujours tester sur mobile d'abord.

5. **Horaires établissements** : Les établissements ont des horaires d'ouverture. Un badge "Fermé" s'affiche si fermé.

---

*Document créé le 1er février 2026*
*Dernière mise à jour : Phase 5 complétée*
