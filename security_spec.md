# Firestore Security Specification

## Data Invariants
1. **UserProfile**: 
   - A profile must belong to the authenticated user (`uid` matches `request.auth.uid`).
   - `isAdmin` cannot be set to `true` by the user themselves unless they are a whitelisted admin.
   - `purchasedProductIds` can only be updated by the user if they are adding a new product (in theory, this should be system-verified, but we'll stick to owner-only for now).
2. **PricingOverride**:
   - Only admins can write.
   - Everyone can read.
3. **Order**:
   - Only admins or the assigned user can read.
   - Creation requires the document ID to match the order ID from Cashfree.
   - `status` should be terminal.

## The Dirty Dozen Payloads (Rejection Targets)

1. **Spoofing Identity**: `{"uid": "someone_else_id"}` on `/users/my_id` CREATE
2. **Self-Promotion**: `{"isAdmin": true}` on `/users/my_id` CREATE by non-admin
3. **Privilege Escalation**: `{"isAdmin": true}` on `/users/my_id` UPDATE by owner
4. **Price Manipulation**: `{"price": 0.01}` on `/pricing_overrides/bundle_1` by non-admin
5. **ID Poisoning**: Payload with 1.5KB document ID string.
6. **Order Hijacking**: Reading `/orders/order_123` when it belongs to another user.
7. **Phantom Orders**: Creating `/orders/new_order` with `status: 'completed'` for products not purchased.
8. **Shadow Fields**: `{"id": "bundle_1", "price": 99, "ghost": "hidden_data"}` on pricing.
9. **Timestamp Spoofing**: `{"updatedAt": "2000-01-01T00:00:00Z"}` on pricing write.
10. **Type Poisoning**: `{"amount": "one million dollars"}` in Order payload.
11. **Size Poisoning**: `{"purchasedProductIds": ["a", "b", ..., 1000 items]}`.
12. **Malicious ID Char**: Document ID containing script tags.

## Test Runner (Verifies PERMISSION_DENIED)
We will implement these checks in our `firestore.rules`.
