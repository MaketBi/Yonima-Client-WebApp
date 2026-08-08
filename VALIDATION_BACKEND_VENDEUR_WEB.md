# Validation backend — routes vendeur sur la webapp web (poulzz.store)

**Pour :** dev backend Supabase
**De :** équipe webapp client (`yonima-client-webapp`)
**Date :** 2026-08-05
**Objet :** valider le contrat backend avant d'écrire le back-office vendeur web

---

## Contexte en 5 lignes

On ajoute des **routes vendeur** (`/vendeur/*`) à la webapp client existante : un back-office web
où un vendeur fait ce qu'il fait déjà dans l'app iOS **Yonima Business**. Même backend, même
Supabase, aucune nouvelle table prévue côté web.

J'ai audité `saas-platform/supabase` (138 migrations + 74 edge functions) et le code iOS
`saas-platform/ios-dkr/YonimaBusiness/`. Ce document liste **ce que j'ai conclu** et **ce que
j'ai besoin que tu confirmes ou corriges** avant qu'on code.

**Périmètre v1 décidé :** `vendor_admin` **uniquement**, tout via RLS + anon key, **aucune
service_role**. Modules : connexion vendeur, shell de navigation, commandes (liste, détail,
assignation livreur, annulation). Les assistants et les autres modules viendront après.

**Comment répondre :** réponds directement dans ce fichier sous chaque question (`> Réponse : …`),
ou renvoie-moi les numéros avec tes réponses. Les blocs SQL de la partie 5 sont ce qui lève
le plus d'incertitude — si tu ne fais qu'une chose, fais celle-là.

---

## 1. Ce que j'ai conclu (à confirmer)

Ces points structurent tout le code web. Si l'un est faux, dis-le tôt.

### 1.1 Les 8 permissions assistant ne sont pas appliquées par la DB

Je n'ai trouvé **aucune policy RLS** qui lise `assistant_users.permissions`. Les policies filtrent
sur `vendor_id` / `owner_id`, jamais sur une permission. Conclusion : un assistant avec
`can_manage_products: false` peut quand même écrire dans `products` via PostgREST.

**→ Je traite les 8 permissions comme du gating d'interface uniquement, jamais comme une frontière
de sécurité.**

> **Q1.** C'est bien le comportement voulu, ou est-ce un trou à combler ?
>
> Réponse :

### 1.2 `get_user_vendor_id()` résout via `vendors.owner_id`, pas `users.vendor_id`

`schema_20251207_213534.sql:495-526` :

```sql
IF v_user_role = 'vendor_admin' THEN
  SELECT id INTO v_vendor_id FROM vendors WHERE owner_id = auth.uid();
ELSIF v_user_role = 'vendor_assistant' THEN
  SELECT vendor_id INTO v_vendor_id FROM assistant_users WHERE user_id = auth.uid();
END IF;
```

Donc pour un `vendor_admin` dont `users.vendor_id` est correct mais `vendors.owner_id` est NULL,
**toutes les policies renvoient NULL → le back-office est entièrement vide, sans erreur**.

**→ Je prévois un écran explicite « compte non rattaché » plutôt qu'une page blanche.**

> **Q2.** Combien de `vendor_admin` en prod ont `users.vendor_id` renseigné mais ne sont
> `owner_id` d'aucun vendor ? (requête en 5.4) Faut-il un backfill de `owner_id` ?
>
> Réponse :

### 1.3 `get_user_vendor_id()` ignore `assistant_users.is_active`

La fonction ne filtre pas sur `is_active`. Un assistant désactivé garde donc **tous ses droits RLS**
tant que son JWT est valide (~1 h, renouvelable par refresh token). Seul `simple-otp` bloque une
*nouvelle* connexion.

**→ Côté web je vérifierai `is_active` explicitement à chaque chargement (comme le fait l'app iOS).**

> **Q3.** Confirmes-tu ? Envisages-tu d'ajouter le filtre dans la fonction ?
>
> Réponse :

### 1.4 Contrat produit : `vendor_net_price` uniquement

Le trigger `trg_products_derive_price_from_net` dérive `products.price` dès que `vendor_net_price`
est non-NULL (`migrations/20260709_vendor_net_price_compute_and_trigger.sql`). L'app iOS n'envoie
jamais `price`.

**→ Le web enverra exactement :** `vendor_id, name, description, vendor_net_price, unit, image_url,
stock_quantity, is_available, is_active, is_published, vendor_menu_category_id`.

> **Q4.** Cette liste est-elle complète et exacte ? Un champ manquant ou en trop ?
>
> Réponse :

### 1.5 `assigned_driver_id`, pas `driver_id`

`orders` porte les deux colonnes. Seule `assigned_driver_id` a une FK et est écrite par
`assign-driver`. L'app iOS lit exclusivement `assigned_driver_id`.

> **Q5.** `orders.driver_id` est-elle morte ? Peut-on l'ignorer totalement côté web, ou reste-t-elle
> écrite par un chemin que je n'ai pas vu (dispatch, app livreur) ?
>
> Réponse :

### 1.6 Colonnes legacy à ne plus écrire sur `vendors`

Le code iOS (`DeliverySettingsView.swift:486`) dit explicitement que depuis « PR8 backend »,
`delivery_fee` et `estimated_time` ne sont plus envoyés — seuls `min_order` et `prep_time_minutes`
(CHECK 0–240).

> **Q6.** Confirmé ? Y a-t-il d'autres colonnes de `vendors` devenues legacy qu'il ne faut pas
> écrire depuis un back-office (`rating`, `review_count`, `accepts_cash`… ) ?
>
> Réponse :

---

## 2. Anomalies que j'ai trouvées (à confirmer + corriger)

Ordre de gravité décroissante. Les 3 premières bloquent les assistants — c'est la raison pour
laquelle la v1 web est admin-only.

### 🔴 A1 — `create-driver` et `unassign-driver` lisent des colonnes qui n'existent pas

`functions/unassign-driver/index.ts:177` :
```ts
.from("assistant_users").select("id, can_assign_drivers")
```
`functions/create-driver/index.ts:194` :
```ts
.from("assistant_users").select("id, can_manage_orders")
```

`can_assign_drivers` et `can_manage_orders` sont des **clés du JSONB `permissions`**, pas des
colonnes. PostgREST renvoie `42703 column does not exist` → la variable `assistant` vaut `null` →
**403 systématique pour tout assistant**.

`functions/assign-driver/index.ts:150-155` le fait correctement :
```ts
.select("id, permissions")   // puis assistant?.permissions?.can_assign_drivers === true
```

**Conséquence produit :** un assistant peut assigner un livreur mais **jamais le désassigner**.
**Ça affecte aussi l'app iOS en production**, pas seulement le web.

> **A1.** Confirmes-tu le bug ? Peux-tu aligner les deux fonctions sur le pattern d'`assign-driver` ?
>
> Réponse :

### 🔴 A2 — Les livreurs pool sont invisibles pour un vendor

Toutes les policies `drivers` exigent `vendor_id = get_user_vendor_id()`. Or un livreur plateforme
a `vendor_id IS NULL` → `NULL = <uuid>` est NULL → jamais vrai.

La policy qui exposait le livreur pool assigné à une commande du vendor
(`drivers_select_by_assigned_vendor`) a été **droppée le 2026-04-20**
(`migrations/20260420_drop_drivers_select_by_assigned_vendor.sql`) avec ce motif :

> « l'app vendor affiche déjà les infos du livreur via un autre chemin »

**Je n'ai pas trouvé cet « autre chemin » dans le repo.** Côté iOS, `OrdersViewModel.swift:233`
appelle `rpc('get_drivers_by_ids', { driver_ids })` pour enrichir les commandes dont le driver
est masqué par RLS — c'est probablement lui, mais je veux confirmation.

> **A2.** Le chemin officiel pour qu'un vendor voie le nom/téléphone d'un livreur pool assigné à
> sa commande, c'est bien `get_drivers_by_ids` ? Est-elle SECURITY DEFINER et accordée à
> `authenticated` ? Sinon, quel est le chemin ?
>
> Réponse :

### 🔴 A3 — Aucune policy `reviews` pour `vendor_assistant`

`migrations/20260108_005_reviews_rls_policies.sql` : les deux policies vendeur (lecture + réponse)
filtrent sur `vendors.owner_id = auth.uid()`. Rien pour les assistants.

**Conséquence :** un assistant ne voit **aucun** avis, quelle que soit sa permission applicative.

> **A3.** Volontaire ou oubli ? (Ça conditionne si je masque l'onglet Avis aux assistants en v2.)
>
> Réponse :

### 🟠 A4 — `cancel-order-by-restaurant` est owner-only

`functions/cancel-order-by-restaurant/index.ts:93` : `vendor.owner_id !== user.id → 403`. Aucun
support des assistants, même avec `can_manage_orders`. À comparer avec `assign-driver`, qui gère
correctement les deux cas.

> **A4.** Volontaire ? Si non, peux-tu l'aligner sur `assign-driver` ?
>
> Réponse :

### 🟠 A5 — Aucun chemin pour qu'un assistant modifie `vendors`

Policy `vendors_update_owner` = `owner_id = auth.uid()` uniquement, et **il n'existe aucune edge
function `update-vendor`** (vérifié : `ls functions | grep -i vendor` ne renvoie rien de tel).
Pourtant `migrations/20260425_vendor_closing_buffer_pr1.sql:19` référence « côté update-vendor (PR 2) ».

**Conséquence :** un assistant ne peut ni toggler `is_open`, ni changer horaires / prep time /
min order.

> **A5.** La PR 2 / `update-vendor` est-elle prévue ? Ou un assistant n'est-il simplement pas censé
> toucher aux réglages de la boutique (auquel cas c'est cohérent et je masque ces écrans) ?
>
> Réponse :

### 🟠 A6 — CORS : `poulzz.store` n'est pas autorisé

`functions/_shared/cors.ts:9-12` :
```js
const ALLOWED_ORIGINS_PROD = ["https://samamarket.sn", "https://vendor.samamarket.sn", "https://admin.samamarket.sn"];
```
(avec un `TODO: Mettre à jour avec les vrais domaines avant mise en prod`)

Les fonctions qui utilisent `getCorsHeaders(origin)` — `assign-driver`, `unassign-driver`,
`cancel-order` — seront **bloquées par le navigateur** depuis `poulzz.store`. Les autres
(`simple-otp`, `simple-verify`, `create-assistant`, `cancel-order-by-restaurant`) ont un
`corsHeaders` local en `"*"` et passeront.

**Ce que je fais en attendant :** j'appelle ces fonctions depuis une **route serveur Next.js**
(`/api/vendeur/*`) qui relaie le JWT de l'utilisateur — pas de CORS navigateur, pas de service_role,
donc pas bloquant pour nous.

> **A6.** Peux-tu quand même ajouter `https://poulzz.store` (et `https://www.poulzz.store` si
> pertinent) à `ALLOWED_ORIGINS_PROD` ? Et confirmer les domaines réels à y mettre, vu que la liste
> pointe encore sur `samamarket.sn`.
>
> Réponse :

### 🟡 A7 — `simple-verify` promeut automatiquement en `vendor_admin`

`functions/simple-verify/index.ts:353-386` : si un `vendors` existe avec ce téléphone et
`owner_id IS NULL`, la fonction pose `vendors.owner_id = userId`, `users.role = 'vendor_admin'`,
`users.vendor_id`.

**Conséquence pour le web :** un **client** existant dont le numéro correspond à une boutique
orpheline sera converti en vendeur à sa prochaine connexion — y compris s'il se connecte sur la
partie boutique, pas sur `/vendeur`. Sur mobile ce risque est faible (apps séparées) ; sur le web
les deux parcours partagent le même domaine et la même session.

> **A7.** Ce comportement est-il encore nécessaire (onboarding vendeur) ? Peut-on le restreindre
> aux requêtes qui viennent d'`app_type: "vendor"` ? `simple-verify` ne reçoit pas `app_type`
> aujourd'hui — faut-il l'ajouter ?
>
> Réponse :

### 🟡 A8 — `notifications.app_type` : CHECK vs code

`schema.sql:294` : `CHECK (app_type IN ('client','delivery','vendor','superadmin'))`
`functions/cancel-order-by-restaurant/index.ts:216` insère `app_type: "driver"`.

`'driver'` viole le CHECK → l'insert échoue (l'erreur est loguée sans planter la fonction).

> **A8.** Le CHECK a-t-il été élargi en prod, ou est-ce un bug silencieux ? (Impact : le livreur
> n'est pas notifié de l'annulation.)
>
> Réponse :

### 🟡 A9 — `orders` : policy `FOR ALL` sans state machine

`orders_all_vendor` est `FOR ALL` avec le même prédicat en USING et WITH CHECK. Aucun trigger de
machine à états sur `orders.status` dans le repo. Un vendeur (ou son assistant) peut donc passer
une commande directement de `pending` à `delivered`, ou modifier `total`, `delivery_fee`,
`delivery_code`.

**Côté web je n'exposerai que les transitions légitimes** (`pending → preparing → ready`), mais
c'est une contrainte d'interface, pas de sécurité.

> **A9.** Une protection backend est-elle prévue ? (Pas bloquant pour nous, mais c'est un risque
> à connaître.)
>
> Réponse :

---

## 3. Ce que le web va faire — à valider

Récapitulatif des appels que le back-office web fera en v1. **Confirme que chacun est le chemin
officiel**, ou indique le bon.

| # | Action | Chemin prévu | Payload |
|---|---|---|---|
| 1 | Demander OTP | edge `simple-otp` | `{ phone, app_type: "vendor" }` |
| 2 | Renvoyer par SMS | edge `simple-otp` | `{ phone, action: "resend_sms", app_type: "vendor" }` |
| 3 | Vérifier OTP | edge `simple-verify` | `{ phone, code }` |
| 4 | Charger le profil | `SELECT id, role, vendor_id, full_name, is_active FROM users WHERE id = <uid>` | policy `users_select_own` |
| 5 | Charger la boutique | `SELECT * FROM vendors WHERE owner_id = <uid>` | policy `vendors_select_owner` |
| 6 | Lister les commandes | `SELECT *, order_items:order_items_detailed(*), user:users!user_id(...), driver:drivers!assigned_driver_id(...) FROM orders WHERE vendor_id = ? ORDER BY created_at DESC LIMIT 100` | policy `orders_all_vendor` |
| 7 | Changer un statut | `UPDATE orders SET status, prepared_at/ready_at` | idem |
| 8 | Lister les livreurs | `rpc('get_vendor_drivers', { p_vendor_id })` | SECURITY DEFINER |
| 9 | Assigner un livreur | edge `assign-driver` **via proxy Next.js** | `{ orderId, driverId }` (camelCase) |
| 10 | Annuler une commande | edge `cancel-order-by-restaurant` **via proxy Next.js** | `{ order_id, reason, details? }` (snake_case) |
| 11 | Temps réel | canal `vendor-orders-<vendorId>`, table `orders`, filtre `vendor_id` | INSERT/UPDATE/DELETE |

> **Q7.** Un chemin à corriger dans ce tableau ?
>
> Réponse :

> **Q8.** `get_vendor_drivers` et `get_platform_drivers` sont SECURITY DEFINER **sans contrôle
> d'accès interne** : n'importe quel utilisateur `authenticated` peut passer un `p_vendor_id`
> arbitraire et lire les livreurs d'un autre vendor (téléphone, `push_token`, position GPS).
> Je n'ai trouvé **aucun GRANT explicite** dans les migrations. Confirmé ? Faut-il ajouter un
> contrôle `p_vendor_id = get_user_vendor_id()` ?
>
> Réponse :

> **Q9.** Le temps réel Supabase est-il activé sur `orders` en prod (publication `supabase_realtime`),
> et le filtre par `vendor_id` respecte-t-il bien la RLS ? L'app iOS s'y abonne, donc a priori oui —
> mais je préfère confirmer avant de bâtir la liste dessus.
>
> Réponse :

---

## 4. Divergences spec / code — arbitrage

Trois écarts trouvés entre `spec-app-vendeur-pour-web.md` et le code réel. J'ai suivi le code ;
confirme-moi que c'est le bon choix.

**D1 — Vert primaire.** La spec dit `#2E7D32`. Le design web livré et le design system disent
`#2E6A3B`. → Je prends **`#2E6A3B`** (déjà en place dans la webapp client).

**D2 — Le statut `confirmed` disparaît.** Côté iOS (`OrdersViewModel.swift:43,55`), les actives sont
`pending, preparing, ready` et l'historique `delivered, cancelled, delivery_failed` + les statuts
livreur. **`confirmed` n'est dans aucun des deux** — une commande confirmée est invisible dans l'app.
→ Côté web je la range dans **« À traiter »**.

> **D2.** `confirmed` est-il encore utilisé en prod sur `orders` ? Si oui, mon choix te convient ?
>
> Réponse :

**D3 — Gating visuel.** La spec dit qu'une route non autorisée « n'est pas affichée du tout ». Le
design web affiche les entrées de sidebar secondaires **grisées et non cliquables** (`#C4C9C6`).
→ Je suis le design pour la sidebar, et je masque les 4 onglets principaux (comportement iOS).
Pas de question backend ici, juste pour information.

---

## 5. Requêtes à lancer sur la prod (le plus utile)

Le repo ne suffit pas à établir le contrat : le seul dump contenant les policies date du
**2025-12-07** (8 mois), et `migrations/20260710_backfill_prod_only_objects.sql` reconnaît lui-même
que des objets ont été créés à la main directement en prod.

**Ces requêtes sont en lecture seule.** Colle les résultats en réponse (ou en pièce jointe).

### 5.1 Toutes les policies RLS

```sql
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 5.2 Colonnes des tables sans DDL versionné

Ces tables n'ont **aucun `CREATE TABLE` dans le repo** — elles sont entièrement prod-only :

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'vendors','products','orders','drivers','assistant_users',
    'vendor_wallets','wallet_transactions','payouts','platform_settings',
    'driver_cash_collections','driver_cash_deposits'
  )
ORDER BY table_name, ordinal_position;
```

Ce que je cherche en priorité : **`vendors.delivery_mode`** (type, default, CHECK — la colonne
n'est versionnée nulle part) et le DDL des tables financières / caisse livreurs, pour les modules
suivants.

### 5.3 Les enums

```sql
SELECT t.typname, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS values
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;
```

Points précis : la liste réelle de `order_status` (le repo en donne 12, mais
`migrations/20260419_dispatch_metrics_surge.sql:16` référence un `'offered'` que je ne trouve
ajouté nulle part), la liste de `vendor_type` (je n'ai jamais trouvé le `CREATE TYPE`), et
`payment_status` / `payment_method` (existe-t-il `'card'` ?).

### 5.4 Cohérence des comptes vendeurs (cf. Q2)

```sql
-- vendor_admin sans vendor dont ils sont owner → back-office web vide et silencieux
SELECT u.id, u.phone, u.full_name, u.vendor_id
FROM users u
WHERE u.role = 'vendor_admin'
  AND NOT EXISTS (SELECT 1 FROM vendors v WHERE v.owner_id = u.id);

-- l'inverse : vendors sans owner (déclencheraient l'auto-promotion de A7)
SELECT id, name, phone FROM vendors WHERE owner_id IS NULL;
```

### 5.5 GRANTs sur les RPC utilisées

```sql
SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args,
       p.prosecdef AS security_definer, array_to_string(p.proacl, E'\n') AS grants
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN (
    'get_vendor_drivers','get_platform_drivers','get_drivers_by_ids',
    'get_vendor_menu_categories','rpc_vendor_sale_price_preview',
    'get_user_role','get_user_vendor_id'
  );
```

Je veux vérifier que `authenticated` a bien le droit d'exécuter chacune (plusieurs migrations
n'ont pas de GRANT explicite).

---

## 6. Ce que je te demande, en résumé

**Bloquant pour démarrer la v1 (admin-only) :**
1. Résultats de **5.1** et **5.3** — les policies et enums réels en prod.
2. Réponse à **Q2 / 5.4** — y a-t-il des `vendor_admin` sans `owner_id` ?
3. Réponse à **A2** — comment un vendor voit un livreur pool assigné.
4. Réponse à **Q7** — le tableau des appels de la partie 3 est-il correct ?

**Bloquant pour la v2 (assistants) :**
5. **A1** — corriger `create-driver` et `unassign-driver`.
6. **A3, A4, A5** — décider si les assistants doivent pouvoir voir les avis, annuler, modifier la boutique.

**Souhaitable, non bloquant :**
7. **A6** — ajouter `poulzz.store` au CORS (j'ai un contournement).
8. **A7** — restreindre l'auto-promotion `vendor_admin` de `simple-verify`.
9. **A8** — `notifications.app_type: 'driver'` vs CHECK.
10. **5.2** — DDL des tables financières et caisse livreurs (nécessaire pour les modules suivants,
    pas pour la v1).

Merci — dis-moi si un point mérite qu'on en parle de vive voix plutôt qu'à l'écrit.
