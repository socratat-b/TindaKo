# Backup Functionality Improvements

**Pattern**: Offline/Mobile First → Supabase is ONLY for backup and restore

## ✅ Completed Improvements

### 1. Database Schema Consistency (Local ↔ Cloud)

**Problem**: Supabase tables had BOTH `user_id` and `store_phone`, but local schema only had `storePhone`

**Solution**:
- Removed all `user_id` columns from Supabase tables
- Made `store_phone` the single source of truth
- Ensured consistent mapping: `storePhone` (local) ↔ `store_phone` (cloud)

**Migration**: `supabase/migrations/remove_user_id_clean_schema.sql`

**Result**:
```
✅ Local: storePhone (camelCase in TypeScript)
✅ Cloud: store_phone (snake_case in Postgres)
✅ No user_id - only phone-based identification
✅ Supabase = backup/restore only
```

---

### 2. Dynamic Offline Change Tracking

**Problem**: `hasPendingChanges` was manually set, not automatically calculated

**Solution**:
- Added `checkPendingChanges()` function in sync-store
- Automatically checks for `syncedAt === null` across all tables
- Runs on mount + every 10 seconds
- Filters by storePhone and excludes deleted items

**Files Updated**:
- `lib/stores/sync-store.ts` - Added checkPendingChanges action
- `components/settings/data-settings-section.tsx` - Auto-check on mount + interval

**Result**: "Up to date" button accurately reflects real-time offline changes

---

### 3. Removed "Reseed Catalog" Functionality

**Problem**: "Reseed Catalog" button was confusing and not user-friendly

**Solution**: Removed entire catalog reseed section from Settings

**Rationale**:
- Product catalog is a **local-only helper** for quick product addition
- It should NEVER be exposed to users as a feature
- Users only care about their own products, not the catalog

**Files Updated**:
- `components/settings/data-settings-section.tsx` - Removed catalog section

---

### 4. Product Catalog Isolation (Local-Only)

**Verified**: Product catalog is NEVER synced to Supabase ✅

**Evidence**:
- `lib/db/sync-helpers.ts` has NO push/pull functions for catalog
- `lib/db/sync.ts` excludes catalog from all sync operations
- `lib/db/index.ts` preserves catalog on logout (clearAllLocalData)
- Supabase `product_catalog` table exists but has 0 rows

**Pattern**:
```
📱 User Products → Backed up to Supabase (per store)
📚 Product Catalog → Local-only helper (shared, not backed up)
```

---

### 5. Comprehensive Test Coverage

Created **28 new tests** covering all backup scenarios:

#### Unit Tests (14 tests)
**File**: `__tests__/unit/backup-tracking.test.ts`
- hasUnsyncedChanges() detection
- syncedAt tracking (null → timestamp)
- Multi-user isolation (filter by phone)
- Deleted items exclusion
- Edge cases (empty tables, large datasets)

#### Integration Tests (8 tests)
**File**: `__tests__/integration/backup-workflow.test.ts`
- Full offline → backup → restore cycle
- Multi-device scenarios
- Complex data (sales with items, utang, inventory)
- Store isolation (multiple phones)
- Data integrity verification

#### Catalog Isolation Tests (6 tests)
**File**: `__tests__/unit/catalog-isolation.test.ts`
- Catalog NEVER synced to cloud
- User products synced, catalog not
- Catalog preserved on logout
- Offline catalog lookups

**All tests passing**: ✅ 28/28

---

## 🎯 Key Benefits

### 1. **Proper Offline-First Pattern**
- All operations work offline first
- Supabase is purely for backup/restore
- No dependency on cloud for daily operations

### 2. **Accurate Change Tracking**
- Real-time detection of unsynced changes
- Automatic "Up to date" status
- Users know exactly when backup is needed

### 3. **Data Isolation**
- Each store's data is completely isolated by phone number
- Product catalog stays local (not user data)
- No data leakage between users

### 4. **Schema Consistency**
- Clean mapping between local and cloud
- No legacy columns causing confusion
- Future-proof architecture

### 5. **Comprehensive Testing**
- Full coverage of backup workflows
- Confidence in offline change tracking
- Verified catalog never syncs

---

## 📊 Test Results

```bash
✓ __tests__/unit/backup-tracking.test.ts       (14 tests) 254ms
✓ __tests__/integration/backup-workflow.test.ts (8 tests)  310ms
✓ __tests__/unit/catalog-isolation.test.ts      (6 tests)  90ms

Total: 28 tests | 28 passed ✅
```

---

## 🔄 Backup Workflow (After Improvements)

### Creating Data Offline
1. User creates category/product/sale → `syncedAt: null`
2. Change tracking automatically detects pending changes
3. "Backup Now" button enabled (no longer shows "Up to date")

### Backing Up
1. User clicks "Backup Now"
2. `pushToCloud()` uploads all items where `syncedAt === null`
3. After successful upload, sets `syncedAt: timestamp`
4. "Up to date" button shows (no pending changes)

### Restoring (New Device)
1. User logs in with phone + PIN
2. `pullFromCloud()` downloads all data for this phone
3. Sets `syncedAt: timestamp` on restored items
4. All data available offline immediately

### What Gets Backed Up
- ✅ Categories (user-created)
- ✅ Customers
- ✅ Products (user's actual inventory)
- ✅ Sales
- ✅ Utang Transactions
- ✅ Inventory Movements
- ❌ Product Catalog (local-only helper)

---

## 📝 Migration Notes

### Database Changes
- Applied migration: `remove_user_id_clean_schema.sql`
- Removed all `user_id` columns from Supabase
- Made `store_phone` NOT NULL (where no null data exists)

### Breaking Changes
None - migration is backward compatible with existing data

### Recommendations
1. Test backup/restore on real device before production
2. Monitor Supabase storage usage (only user data, not catalog)
3. Consider adding backup reminders for users (e.g., "Last backup: 7 days ago")

---

## 🚀 Next Steps (Optional Enhancements)

### 1. **Backup Reminders**
- Show notification if last backup > 24 hours
- Badge on settings icon when changes pending

### 2. **Selective Restore**
- Let users choose which tables to restore
- Useful if they only want to restore products, not sales

### 3. **Backup History**
- Track backup timestamps in local storage
- Show backup history in settings

### 4. **Compression**
- Compress large sales/inventory data before upload
- Reduce bandwidth usage

### 5. **Conflict Resolution**
- Handle edge case: same phone used on 2 devices simultaneously
- Implement merge strategy beyond last-write-wins

---

## 📖 Code Patterns for Future Development

### Creating User Data (Always Set syncedAt: null)
```typescript
await db.products.add({
  id: crypto.randomUUID(),
  storePhone: phone,
  name: 'Coke',
  // ... other fields
  syncedAt: null, // ← IMPORTANT: Mark as unsynced
  isDeleted: false,
})
```

### Updating User Data (Reset syncedAt)
```typescript
await db.products.update(productId, {
  sellingPrice: 30,
  updatedAt: new Date().toISOString(),
  syncedAt: null, // ← IMPORTANT: Reset on changes
})
```

### Checking Pending Changes
```typescript
const hasPending = await hasUnsyncedChanges(phone)
// Returns true if ANY table has items with syncedAt === null
```

### Manual Backup
```typescript
const stats = await pushToCloud(phone)
console.log(`Backed up ${stats.pushedCount} items`)
```

### Restore on New Device
```typescript
const stats = await pullFromCloud(phone)
console.log(`Restored ${stats.pulledCount} items`)
```

---

## ✨ Summary

The backup system now follows a **true offline-first pattern**:

1. ✅ **Consistent schema** between local and cloud
2. ✅ **Dynamic change tracking** - always accurate
3. ✅ **Clean UI** - removed confusing catalog features
4. ✅ **Catalog isolation** - verified never syncs
5. ✅ **Comprehensive tests** - 28 new tests covering all scenarios

**Pattern**:
```
📱 Offline First → 💾 Local IndexedDB → ☁️ Supabase Backup → 📱 Restore on New Device
```

Users can now work completely offline and backup when convenient, with full confidence that their data is tracked and isolated properly.
