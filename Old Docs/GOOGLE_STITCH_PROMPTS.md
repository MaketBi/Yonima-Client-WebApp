# Prompts Google Stitch - Yonima Web App

> Prompts pour generer les designs UI de l'application web Yonima alignes avec l'application mobile iOS.

---

## Charte Graphique Yonima

### Couleurs Principales
| Nom | Hex | Usage |
|-----|-----|-------|
| **Primary (Vert)** | `#2E6A3B` | Boutons, liens, accents |
| **Primary Light** | `#5A9A6B` | Hover states, bordures |
| **Primary Lighter** | `#E8F5E9` | Backgrounds legers |
| **Background** | `#FFFFFF` | Fond principal |
| **Background Page** | `#F8FAFC` | Fond de page |
| **Background Secondary** | `#F5F5F5` | Cards, sections |
| **Text Primary** | `#1A1A1A` | Titres, texte principal |
| **Text Secondary** | `#7A7A7A` | Sous-titres, descriptions |
| **Error** | `#EF4444` | Erreurs, alertes |
| **Warning (Orange)** | `#FFA500` | Avertissements, badges |
| **Success** | `#10B981` | Succes, validations |
| **Border** | `#E5E5E5` | Bordures, separateurs |

### Couleurs Statuts Commande
| Statut | Background | Text |
|--------|------------|------|
| En attente | `#FFF3CD` | `#856404` |
| Livree | `#D4EDDA` | `#155724` |
| Annulee | `#F8D7DA` | `#721C24` |
| En livraison | `#CCE5FF` | `#004085` |

### Style General
- **Police** : System font (San Francisco sur iOS, Geist/Inter sur web)
- **Border radius** : 12-16px pour cards, 8px pour boutons, 20-28px pour pills/badges
- **Shadows** : Subtiles, `shadow-sm` ou `shadow-md` Tailwind
- **Espacement** : Genereux, minimum 16px entre sections

---

## Prompts par Ecran

### 1. Page d'Accueil

```
Design a modern food delivery app home page for "Yonima" with:

HEADER:
- Clean white header with delivery address on the left showing a green location pin icon
- Bell notification icon on the right with a red badge showing unread count
- Subtle shadow under header

HERO SECTION:
- Search bar with rounded corners (border-radius 12px), placeholder "Rechercher un restaurant, produit..."
- Light gray background (#F8FAFC)

SECTIONS (vertical scroll):
1. "Epicerie Yonima" - Featured horizontal card with grocery image, green overlay, "Commander maintenant" button
2. "Restaurants" section with horizontal scrolling cards showing:
   - Restaurant image (square, rounded corners)
   - Restaurant name (bold)
   - Rating with orange star
   - Delivery time and fee
   - "Ouvert" green badge or "Ferme" gray badge
3. "Commerces" section with same card style

BOTTOM NAVIGATION:
- Floating tab bar with rounded corners (28px)
- 4 tabs: Home (house icon), Categories (grid icon), Cart (cart icon with badge), Profile (person icon)
- Active tab in green (#2E6A3B), inactive in gray (#94A3B8)
- White background with subtle shadow

Color scheme: Primary green #2E6A3B, white backgrounds, gray text #7A7A7A
Style: Clean, minimal, iOS-like with generous spacing
```

---

### 2. Liste des Restaurants

```
Design a restaurant listing page for a food delivery app:

HEADER:
- Back arrow on left
- "Restaurants" title centered
- Filter icon on right

FILTER TABS (horizontal scroll):
- Pill-shaped chips: "Tous", "Populaires", "Fast Food", "Livraison gratuite"
- Selected chip has green (#2E6A3B) background with white text
- Unselected chips have light gray background

RESTAURANT CARDS (vertical list):
Each card contains:
- Large cover image (16:9 ratio, rounded top corners)
- Restaurant logo (small circle, overlapping bottom of image)
- Restaurant name (bold, dark text)
- Cuisine type tags (small gray pills)
- Row with: Rating (star + number), delivery time, delivery fee
- "Ouvert" badge (green) or "Ferme" badge (gray) top right of image
- "Nouveau" orange badge if new restaurant
- Subtle card shadow

EMPTY STATE:
- Illustration of empty plate
- "Aucun restaurant trouve" text
- "Modifier les filtres" button

Background: #F8FAFC
Cards: White with shadow-sm
Primary color: #2E6A3B
```

---

### 3. Detail Restaurant (Style Uber Eats)

```
Design a restaurant detail page similar to Uber Eats:

HERO IMAGE:
- Full width cover image (40% of screen height)
- Gradient overlay at bottom (transparent to black)
- Back button (white circle with arrow) top left
- Share and favorite icons top right
- Restaurant name in white at bottom of image

INFO CARD (overlapping hero):
- White card with rounded top corners
- Restaurant name (large, bold)
- Rating stars + review count
- Cuisine type
- Row: Delivery fee | Delivery time | Min order
- "Ouvert jusqu'a 22h00" or "Ferme - Ouvre a 11h00" status

STICKY CATEGORY TABS:
- Horizontal scroll of category names
- Underline indicator for selected category
- Becomes sticky on scroll

MENU SECTIONS:
For each category:
- Category name (bold, large)
- Product rows with:
  - Product image (square, 80px, right side)
  - Product name (bold)
  - Description (2 lines, gray, truncated)
  - Price in green (#2E6A3B)
  - "+" button to add to cart

FLOATING CART BUTTON (if items in cart):
- Fixed at bottom
- Green background
- "Voir le panier (3)" with total price
- Rounded corners

Colors: Green #2E6A3B, white cards, #F8FAFC background
```

---

### 4. Page Produit

```
Design a product detail modal/page for food delivery:

IMAGE:
- Large product image (square or 4:3)
- Swipeable gallery dots if multiple images
- Close/back button top left

CONTENT:
- Product name (large, bold)
- Price in green (#2E6A3B), large font
- Description text (gray, multiple lines)
- "Ecouter la description" button with speaker icon (for audio description)

OPTIONS (if applicable):
- Radio buttons for size/variant selection
- Checkboxes for extras/add-ons
- Each option shows name and +price

QUANTITY SELECTOR:
- Row with "-" button, quantity number, "+" button
- Circular buttons with green border
- Min quantity 1

ADD TO CART BUTTON:
- Full width
- Green background (#2E6A3B)
- White text "Ajouter au panier - 2,500 F"
- Disabled state if product unavailable

Style: Bottom sheet modal or full page
Background: White
Rounded corners: 16px for modal
```

---

### 5. Panier (Cart)

```
Design a shopping cart page for food delivery:

HEADER:
- "Mon panier" title
- "Vider" text button on right (red)

RESTAURANT INFO:
- Small card showing restaurant name and logo
- Delivery estimate

CART ITEMS:
For each item:
- Product image (small, square)
- Product name
- Unit price
- Quantity selector (- qty +)
- Line total
- Swipe to delete or X button

DELIVERY ADDRESS:
- Card with location pin icon
- Current address or "Ajouter une adresse"
- Edit button
- Text input for delivery notes

PROMO CODE:
- Input field with "Code promo" placeholder
- "Appliquer" button
- If applied: Show discount in green with X to remove

LOYALTY REWARD (if available):
- Card showing available rewards
- Radio selection
- "Livraison gratuite" or "-500F" badge

PRICE SUMMARY:
- Sous-total: 5,000 F
- Frais de livraison: 500 F
- Reduction promo: -500 F (green)
- Reduction fidelite: -500 F (green)
- TOTAL: 4,500 F (large, bold)

PAYMENT METHOD:
- Radio cards for: Cash, Wave, Orange Money
- Each with icon and name

ORDER BUTTON:
- Fixed at bottom
- Full width green button
- "Commander - 4,500 F"
- Disabled if cart empty or no address

Background: #F8FAFC
Cards: White
```

---

### 6. Mes Commandes

```
Design an orders list page with status filter tabs:

HEADER:
- "Mes commandes" title

FILTER TABS (horizontal scroll):
- Pill chips: "Tous", "En attente", "En preparation", "En livraison", "Livrees", "Annulees"
- Selected: Green background, white text
- Unselected: Light gray background

ORDER CARDS:
Each card shows:
- Left: Product image (first item) with badge showing item count
- Center column:
  - Restaurant name (bold)
  - "3 articles" count
  - Date "12 Jan 2024"
  - Total "4,500 F" in green
- Right:
  - Status badge (colored by status)
  - Chevron icon

STATUS BADGE COLORS:
- En attente: Yellow bg #FFF3CD, brown text #856404
- En preparation: Yellow bg
- En livraison: Blue bg #CCE5FF, blue text #004085
- Livree: Green bg #D4EDDA, green text #155724
- Annulee: Red bg #F8D7DA, red text #721C24

EMPTY STATE:
- Bag icon
- "Aucune commande"
- "Vos commandes apparaitront ici"

Pull to refresh enabled
Background: #F8FAFC
```

---

### 7. Detail Commande

```
Design an order detail page:

STATUS HEADER:
- Large status icon (checkmark for delivered, clock for pending, bike for delivering)
- Status text (bold)
- Order date

RESTAURANT CARD:
- Restaurant logo and name
- Tap to view restaurant

ORDER INFO:
- Card with:
  - Delivery address with pin icon
  - Payment method with icon

ITEMS LIST:
- Card showing ordered items
- Each item: image, name, quantity, price

PRICE SUMMARY:
- Sous-total
- Frais de livraison
- Reductions (if any)
- Total (bold)

REVIEW SECTION (if delivered and not reviewed):
- Orange card background
- Star icon
- "Donnez votre avis"
- "Partagez votre experience"
- "Noter ma commande" button

EXISTING REVIEW (if already reviewed):
- Green card background
- Checkmark icon
- "Votre avis"
- Star ratings display
- Comment text
- "En attente de validation" badge if pending

TIMELINE (optional):
- Vertical timeline showing order steps
- Completed steps with green checkmarks
- Current step highlighted
```

---

### 8. Page Profil

```
Design a user profile page:

PROFILE HEADER:
- Large circular avatar (with camera icon overlay for edit)
- User name (bold, large)
- Phone number

MENU ITEMS (list of cards):
Each item is a row with:
- Icon on left (in green)
- Label text
- Chevron on right

Menu items:
1. Gift icon - "Ma fidelite" with points badge "362 pts"
2. Edit icon - "Modifier mon profil"
3. Bell icon - "Notifications" with unread badge
4. Info icon - "A propos"
5. Logout icon - "Deconnexion" (red text)

LOGOUT CONFIRMATION:
- Alert modal
- "Voulez-vous vous deconnecter?"
- "Annuler" and "Deconnexion" buttons

Background: #F8FAFC
Cards: White with subtle shadow
Icon color: #2E6A3B (except logout which is red)
```

---

### 9. Page Fidelite

```
Design a loyalty program page:

HEADER:
- Back button
- "Ma fidelite" title

POINTS CARD (hero):
- Gradient or solid green background (#2E6A3B)
- Large points number "362"
- "points disponibles" label
- Current tier badge "Silver" with icon
- Progress bar to next tier
- "125 points pour Gold" text

TIER BENEFITS:
- Card showing current tier benefits
- List with checkmark icons
- "x1.25 points sur chaque commande"
- "Acces prioritaire aux promos"

AVAILABLE REWARDS:
- Section title "Recompenses disponibles"
- Horizontal scroll of reward cards
- Each card:
  - Icon (gift, motorcycle, percent)
  - Reward name
  - Points required
  - "Echanger" button
  - Grayed out if not enough points

ACTIVE REDEMPTIONS:
- Section title "Mes recompenses actives"
- Cards showing pending rewards to use
- Status badge "A utiliser"

TRANSACTION HISTORY:
- Section title "Historique"
- List of transactions
- Each row: date, description, points (+50 green or -200 red)

Celebration animation when redeeming reward (confetti)
```

---

### 10. Formulaire Avis

```
Design a review submission form:

HEADER:
- Close button (X)
- "Donner mon avis" title

INTRO:
- Star icon (orange)
- "Comment etait votre commande?"
- Restaurant name

RATING SECTIONS:
3 rating rows:
1. "Restaurant *" (required) - 5 tappable stars
   "Service et experience globale"
2. "Qualite" (optional) - 5 stars
   "Produits et presentation"
3. "Livraison" (optional) - 5 stars
   "Rapidite et professionnalisme"

Stars: Empty outline when not selected, filled orange when selected
Show rating label when selected: "Tres satisfait", "Satisfait", "Correct", etc.

COMMENT:
- Text area
- "Votre commentaire (optionnel)" label
- Character count "0/500"

ANONYMOUS TOGGLE:
- Switch with icon
- "Rester anonyme"
- "Votre nom ne sera pas affiche"

ERROR MESSAGE (if any):
- Red background
- Error icon
- Error text

SUBMIT BUTTON:
- Full width
- Orange/green background
- "Envoyer mon avis"
- Disabled if no restaurant rating

INFO TEXT:
- Small text at bottom
- "Votre avis sera visible apres validation par notre equipe"

SUCCESS:
- Alert with "Merci!"
- Confetti animation
```

---

### 11. Page Login

```
Design a login page for food delivery app:

LOGO:
- Yonima logo centered at top
- Tagline "Du resto a l'epicerie, on gere."

PHONE INPUT:
- Country selector (flag + dial code dropdown)
- Phone number input field
- Format hint placeholder

CONTINUE BUTTON:
- Full width
- Green background (#2E6A3B)
- "Continuer" text
- Disabled until valid phone number

TERMS:
- Small text
- "En continuant, vous acceptez nos Conditions d'utilisation"
- Links underlined

OTP MODAL:
- Overlay modal
- "Verification" title
- "Code envoye au +221 77 123 45 67"
- 4-6 digit code input (separate boxes)
- "Renvoyer le code" link with countdown
- Auto-submit when complete

Style: Clean, minimal
Centered content
White background
```

---

### 12. Epicerie (Grocery)

```
Design a grocery store page:

HEADER:
- "Epicerie Yonima" title
- Search icon

CATEGORIES GRID:
- 2 columns of category cards
- Each card:
  - Category image (square)
  - Category name below
  - Item count badge
- Categories: Fruits, Legumes, Viandes, Poissons, Boissons, etc.

FEATURED PRODUCTS:
- Horizontal scroll section
- "Produits populaires"
- Product cards with image, name, price, add button

CATEGORY DETAIL:
- When tapping category:
- Header with category name and back button
- Filter/sort options
- Product grid (2 columns)
- Each product: image, name, price, unit (kg, piece), add to cart button

Style: Fresh, clean
Green accents
White product cards
```

---

### 13. Recherche

```
Design a search page:

SEARCH BAR:
- Auto-focused input
- Clear button (X)
- Cancel button

RECENT SEARCHES:
- Section title "Recherches recentes"
- List of previous searches with clock icon
- X to remove each

SEARCH RESULTS:
Two tabs: "Etablissements" | "Produits"

Establishment results:
- List of restaurant/store cards (compact)

Product results:
- Grid of product cards
- Shows which restaurant sells it

EMPTY STATE:
- Search icon
- "Aucun resultat pour 'xyz'"
- "Essayez avec d'autres mots-cles"

Loading state: Skeleton cards
```

---

### 14. Notifications

```
Design a notifications page:

HEADER:
- "Notifications" title
- "Tout marquer comme lu" text button

NOTIFICATION LIST:
Each notification card:
- Icon based on type (order, promo, loyalty)
- Title (bold)
- Message body
- Time ago "Il y a 2h"
- Unread indicator (green dot)
- Tap to navigate to related content

NOTIFICATION TYPES:
- Order status: Truck icon, blue
- Promo: Tag icon, orange
- Loyalty: Gift icon, green
- System: Bell icon, gray

EMPTY STATE:
- Bell icon
- "Aucune notification"

Pull to refresh
Background: #F8FAFC
Cards: White, unread has light green left border
```

---

### 15. Carte de Suivi Livraison

```
Design an order tracking map view:

MAP:
- Full screen map (Leaflet/Google Maps style)
- Restaurant marker (store icon)
- Delivery address marker (pin icon)
- Driver marker (motorcycle icon, animated)
- Route line between points

BOTTOM SHEET:
- Draggable sheet from bottom
- Driver info: photo, name, phone button
- Order status timeline (mini)
- ETA "Arrivee dans ~15 min"
- "Contacter le livreur" button

TOP OVERLAY:
- Back button
- Order number badge

Status bar at top showing current status
Animation for driver moving on map
```

---

### 16. Selection Adresse

```
Design an address selection page:

SEARCH:
- Search input with location icon
- "Rechercher une adresse"
- Auto-complete suggestions dropdown

MAP:
- Interactive map
- Draggable pin in center
- "Utiliser cette position" button overlay

CURRENT LOCATION:
- "Utiliser ma position actuelle" row
- GPS icon
- Loading spinner when detecting

SAVED ADDRESSES:
- Section with saved addresses
- Each: icon, label (Maison, Bureau), address
- Edit/delete options

CONFIRM:
- Selected address display
- "Repere de livraison" input (floor, gate code, etc.)
- "Confirmer l'adresse" button

Map style: Clean, minimal markers
```

---

### 17. Bottom Sheet Etablissement Ferme

```
Design a "restaurant closed" bottom sheet:

SHEET:
- White background
- Rounded top corners
- Drag handle

CONTENT:
- Closed icon (moon or clock)
- "Ce restaurant est ferme"
- "Ouvre demain a 11h00" or next opening time

OPTIONS:
- "Me notifier a l'ouverture" toggle
- "Voir le menu quand meme" button (secondary)
- "Retour" button (primary)

Style: Centered content
Subtle animation on appear
```

---

### 18. Confirmation de Commande

```
Design an order confirmation page:

SUCCESS ANIMATION:
- Green checkmark with circle
- Confetti animation

CONTENT:
- "Commande confirmee!"
- Order number "#YON-12345"
- "Votre commande a ete envoyee au restaurant"

ORDER SUMMARY:
- Restaurant name
- Number of items
- Total amount
- Estimated delivery time

ACTIONS:
- "Suivre ma commande" primary button
- "Retour a l'accueil" secondary link

Background: Light green tint or white
Celebratory feel
```

---

## Notes pour le Designer

### Responsive Design
- Mobile-first (375px)
- Tablet (768px)
- Desktop (1024px+)
- Max content width: 1200px on desktop

### Interactions
- Hover states on buttons (darken 10%)
- Press states (scale 0.98)
- Smooth transitions (200ms ease)
- Loading skeletons for async content

### Accessibility
- Minimum touch target: 44x44px
- Contrast ratio: 4.5:1 minimum
- Focus states visible
- Alt text for images

### Animations
- Page transitions: Fade or slide
- Modal: Slide up from bottom
- Toast: Slide in from top
- Confetti for celebrations

---

## Ressources

- **Couleur primaire**: #2E6A3B (vert Yonima)
- **Font**: Inter ou Geist Sans
- **Icons**: Lucide Icons
- **Inspiration**: Uber Eats, Deliveroo, Glovo

---

> Document cree le 10 Janvier 2026
> Pour utilisation avec Google Stitch ou tout autre outil de design AI
