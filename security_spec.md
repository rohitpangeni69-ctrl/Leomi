# Security Specification

## Data Invariants
1. Products can be read by anyone, but created/updated/deleted only by an Admin.
2. Orders can be read/created by the authenticated owner (`userId === request.auth.uid`).
3. Orders can be read/updated by an Admin.
4. Users can read/update their own profile.
5. Users cannot elevate their own role to 'admin'.
6. Admins can read/update all users, orders, and products.

## The "Dirty Dozen" Payloads
1. Create product as non-admin.
2. Update product as non-admin.
3. Delete product as non-admin.
4. Create order for another user (spoofing userId).
5. Read another user's order.
6. Create an order with invalid payment method.
7. Update user profile to set role = 'admin'.
8. Read another user's profile.
9. Inject huge string (1MB) as product name (Denial of Wallet).
10. Create user profile with missing fields.
11. Update order status as non-admin.
12. Create order without being authenticated.
