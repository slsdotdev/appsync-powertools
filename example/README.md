# Farmers Market Platform — GraphQL Schema

## Architecture Overview

A multi-vendor marketplace platform modeled across three access scopes:

| Scope    | Audience      | Purpose                                           |
| -------- | ------------- | ------------------------------------------------- |
| `ADMIN`  | Platform ops  | Vendor onboarding, order routing, payouts, config |
| `VENDOR` | Seller staff  | Inventory, fulfillment, earnings, team mgmt       |
| `SHOP`   | End customers | Browse, cart, checkout, orders, reviews           |

---

## File Map

```
schema/
├── base.graphql           Scalars, directives, interfaces, shared enums/types
├── users.graphql          Users, addresses, preferences, auth tokens
├── vendors.graphql        Vendors, applications, members, markets, schedules
├── catalog.graphql        Categories, products, variants, inventory, pricing
├── orders.graphql         Cart, orders, vendor-orders, line items, fulfillment
├── payments.graphql       Payment methods, transactions, payouts, refunds, coupons
├── reviews.graphql        Reviews, responses, votes, reports, moderation
├── notifications.graphql  Multi-channel notifications with union payloads
├── search-audit.graphql   Search unions, wishlists, saved search, audit log, config
└── subscriptions.graphql  Real-time subscription events with interface + union
```

---

## Domain Relationships (simplified)

```
User ──┬── Address[]
       ├── UserPreferences
       ├── VendorMember ──── Vendor
       ├── Cart ──── CartItem[] ──── ProductVariant
       ├── Order[]
       ├── Review[]
       ├── Wishlist[] ──── WishlistItem[]
       ├── PaymentMethod[]
       └── Notification[]

Vendor ──┬── VendorApplication
         ├── VendorMember[] ──── User
         ├── Product[] ──┬── ProductVariant[] ──── InventoryRecord
         │               ├── PriceHistoryEntry[]
         │               └── Review[]
         ├── OperatingSchedule[]
         ├── MarketVendorAssignment[] ──── MarketLocation
         ├── VendorOrder[] ──┬── LineItem[]
         │                   └── Fulfillment
         └── VendorPayout[]

Order ──┬── VendorOrder[] (one per vendor in the order)
        ├── PaymentTransaction[]
        ├── OrderTimelineEvent[]
        └── CouponRedemption[]
```

---

## Key Design Decisions

### Multi-Vendor Order Splitting

A single customer `Order` is split into `VendorOrder` groups (one per
vendor). Each `VendorOrder` has its own fulfillment lifecycle, allowing
independent processing. The customer sees a unified order; vendors only
see their slice.

### Monetary Values

All money fields use the `Money` type (`amount: Decimal, currency: Currency`)
— never bare floats. `Decimal` is a string-encoded fixed-precision scalar
to avoid IEEE 754 drift.

### Snapshot Denormalization

`OrderAddress`, `LineItem.productName`, `WishlistItem.productName` etc.
are frozen at write time. Edits to source entities don't retroactively
mutate historical records.

### Soft Deletes & Versioning

Entities implement `SoftDeletable` for logical deletion and `Versioned`
for optimistic concurrency control via integer version vectors.

### Scope-Based Visibility

The `@scope(allow: [...])` directive at type and field level drives
schema pruning at generation time — a vendor never sees admin-only
fields, and the shop schema omits internal operational types entirely.

---

## GraphQL Features Used

| Feature           | Usage                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Custom Scalars    | `DateTime`, `Date`, `Decimal`, `URL`, `EmailAddress`, etc.                                                                            |
| Interfaces        | `Node`, `Timestamped`, `Auditable`, `SoftDeletable`, `Versioned`, `SubscriptionEvent`                                                 |
| Unions            | `NotificationPayload`, `SearchResult`, `AuditPayload`, `LiveEvent`                                                                    |
| Custom Directives | `@scope`, `@auth`, `@constraint`, `@sunset`, `@cacheControl`                                                                          |
| Transformer Dir.  | `@model`, `@hasOne`, `@hasMany`, `@serverOnly`, `@clientOnly`, `@readOnly`, `@writeOnly`, `@filterOnly`, `@createOnly`, `@updateOnly` |
| Subscriptions     | Order updates, inventory alerts, platform event firehose                                                                              |
| Enums             | 40+ enums covering statuses, types, roles, permissions                                                                                |
| Input Types       | Dedicated inputs for embedded value objects                                                                                           |
| Documentation     | Description strings on all types, fields, and enum values                                                                             |

---

## Entity Count

- **@model types**: 45
- **Enums**: 57
- **Interfaces**: 6
- **Unions**: 4
- **Custom Scalars**: 8
- **Custom Directives**: 5
