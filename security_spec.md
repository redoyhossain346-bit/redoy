# Security Specification

## Data Invariants
- Every record (Transaction, InventoryItem, WorkHour, etc.) must belong to a valid user (`userId`).
- Transactions must have a valid type and category.
- Users can only read and write their own data.
- Timestamps (`createdAt`, `updatedAt`) must be server-validated.

## The "Dirty Dozen" Payloads
1. **Identity Theft**: Attempt to create a transaction with another user's `userId`.
2. **Access Violation**: Attempt to read another user's inventory.
3. **Ghost Field**: Attempt to add `isAdmin: true` to a transaction document.
4. **Invalid Type**: Attempt to set `amount` as a string instead of a number.
5. **Timestamp Spoofing**: Attempt to set `createdAt` to a date in the past from the client.
6. **Schema Bypass**: Attempt to create a transaction without the required `amount` field.
7. **Role Escalation**: Attempt to modify a setting that doesn't belong to the user.
8. **Malicious ID**: Attempt to use an extremely long string (1MB) as a document ID.
9. **Negative Stock**: Attempt to set inventory `quantity` to -100.
10. **Orphaned Record**: Attempt to create a `PartUsage` record for a non-existent `partId`.
11. **Bulk Scrape**: Attempt to list all transactions without a `userId` filter.
12. **Immutable Update**: Attempt to change the `createdAt` field on an existing transaction.

## The Test Runner
`firestore.rules.test.ts` will be created to verify these scenarios.
