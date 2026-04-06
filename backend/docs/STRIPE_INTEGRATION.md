# 🔧 Intégration Stripe - Guide Complet

## Installation

### 1. Installer le SDK Stripe
```bash
cd backend
npm install stripe
```

### 2. Configurer les variables d'environnement

Récupère tes clés sur [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) :

```bash
# .env
STRIPE_PUBLIC_KEY=pk_test_XXX...
STRIPE_SECRET_KEY=sk_test_XXX...
STRIPE_WEBHOOK_SECRET=whsec_XXX...
```

### 3. Créer des produits Stripe

1. Va sur https://dashboard.stripe.com/products
2. Crée un produit **"Koosy Premium"**
3. Ajoute un prix **"9.99€/mois"** → Tu obtiens un `price_xxx`
4. Mémorize ce `price_xxx` pour les appels API

**Exemple :**
- Produit: `Koosy Premium`
- Prix: `price_1QzAbc123ABC123ABC`
- Montant: `9.99 EUR`
- Récurrence: `Monthly`

---

## 🔄 Flux d'utilisation

### Flow 1: Paiement via Stripe Checkout (Web)

#### Étape 1: Frontend appelle `/subscriptions/checkout`
```bash
POST /subscriptions/checkout
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "priceId": "price_1QzAbc123ABC123ABC",
  "amount": 9.99,
  "currency": "EUR",
  "successUrl": "http://localhost:5173/dashboard?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "http://localhost:5173/subscribe",
  "trialDays": 7
}
```

**Réponse :**
```json
{
  "message": "Session checkout créée",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_xxx",
  "userId": 1
}
```

#### Étape 2: L'utilisateur paie sur Stripe Checkout
- Redirection vers `checkoutUrl`
- Remplissage des infos bancaires
- **Success** → Redirection vers `successUrl`
- **Cancel** → Redirection vers `cancelUrl`

#### Étape 3: Webhook Stripe met à jour la base

Stripe envoie `customer.subscription.created` → Backend reçoit et met à jour la BD

---

### Flow 2: Gestion de l'abonnement (Pour l'utilisateur)

#### Vérifier mon abonnement
```bash
GET /subscriptions/me
Authorization: Bearer <JWT_TOKEN>
```

**Réponse :**
```json
{
  "id": 1,
  "userId": 1,
  "stripeCustomerId": "cus_P123456789",
  "stripeSubscriptionId": "sub_P123456789",
  "status": "active",
  "currentPeriodStart": "2025-04-06T10:00:00Z",
  "currentPeriodEnd": "2025-05-06T10:00:00Z",
  "cancelAtPeriodEnd": false,
  "createdAt": "2025-04-06T10:00:00Z"
}
```

#### Annuler (fin de période)
```bash
POST /subscriptions/cancel
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "immediate": false
}
```

#### Annuler (immédiat)
```bash
POST /subscriptions/cancel
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "immediate": true
}
```

---

## 🧪 Testing en Développement

### Tester SANS webhook (Simulation)

```bash
POST /subscriptions/simulate-webhook
Content-Type: application/json

{
  "userId": 1,
  "stripeCustomerId": "cus_test123",
  "stripeSubscriptionId": "sub_test123",
  "status": "active",
  "currentPeriodStart": "2025-04-06T00:00:00Z",
  "currentPeriodEnd": "2025-05-06T00:00:00Z",
  "trialEnd": null
}
```

### Tester AVEC webhooks (Stripe CLI)

1. **Télécharge Stripe CLI** : https://stripe.com/docs/stripe-cli
2. **Connecte-toi** :
   ```bash
   stripe login
   ```

3. **Forward les webhooks** :
   ```bash
   stripe listen --forward-to localhost:3000/subscriptions/webhook
   ```

4. **Déclenche un événement de test** :
   ```bash
   stripe trigger customer.subscription.created
   ```

---

## 🚀 Déploiement Production

### 1. Passer en clés Live (production)

Sur https://dashboard.stripe.com/apikeys :
- Basculer le toggle "View test data" (OFF)
- Récupérer les clés `pk_live_XXX` et `sk_live_XXX`

```bash
# .env.production
STRIPE_PUBLIC_KEY=pk_live_XXX...
STRIPE_SECRET_KEY=sk_live_XXX...
STRIPE_WEBHOOK_SECRET=whsec_live_XXX...
```

### 2. Configurer l'endpoint webhook

1. Va sur https://dashboard.stripe.com/webhooks
2. Clique **"Add endpoint"**
3. URL: `https://ton-domaine.com/subscriptions/webhook`
4. Sélectionne les événements :
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Récupère le `whsec_live_XXX` et mets-le en `.env`

### 3. Déployer le backend

```bash
npm run build
npm run start:prod
```

---

## 📊 Événements Webhook gérés

| Événement | Action |
|-----------|--------|
| `customer.subscription.created` | Marque l'utilisateur comme `active` |
| `customer.subscription.updated` | Met à jour les dates de période |
| `customer.subscription.deleted` | Marque l'utilisateur comme `canceled` |
| `customer.subscription.trial_will_end` | Envoie une notification (optionnel) |
| `invoice.payment_succeeded` | Log du succès |
| `invoice.payment_failed` | Log de l'échec |

---

## 🛡️ Bonnes pratiques

### ✅ À faire
- Vérifier la signature webhook (`stripe-signature`)
- Utiliser `stripe-webhook-secret` protégé
- Stocker `stripeCustomerId` en base pour les futures opérations
- Implémenter les essais gratuits (trials)
- Monitorer les events Stripe

### ❌ À éviter
- Passer la clé secrète au frontend ⚠️
- Faire de la logique métier sans webhook validation
- Oublier de verser `canceledAt` lors de l'annulation
- Ignorer les événements `invoice.payment_failed`

---

## 🐛 Troubleshooting

### Webhook ne reçoit pas les événements
```bash
# Vérifier que rawBody est bien configuré en main.ts
# Vérifier le secret webhook dans .env
# Vérifier que l'URL est accessible publiquement (en prod)
```

### Paiement échoue malgré la création de session
```
→ Vérifier que price_id existe et est actif
→ Vérifier que le pays est supporté par Stripe
→ Vérifier les logs Stripe → Testing → Webhook logs
```

### Utilisateur reste en `incomplete` après paiement
```
→ Attendre que le webhook arrive
→ Vérifier que userId est bien dans les métadatas
→ Vérifier que le webhook secret est correct
```

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs/subscriptions)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/api/events/types)
