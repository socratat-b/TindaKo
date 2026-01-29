# Inventory UX Improvements Plan
## Goal: Make it Filipino-friendly and easy to understand for non-technical users

### 1. **Tab Naming & Descriptions**
**Current Issues:**
- "Adjustments" is too technical
- Not clear what it means for sari-sari store owners

**Proposed Changes:**
- Keep English but simplify language
- Add clearer, conversational descriptions
- Use terms familiar to Filipino store owners

**New Tab Structure:**
```
Tab 1: "Manual Adjustments" or "Dagdag/Bawas"
Description: "Add stock (received from supplier), remove damaged items, or fix counts"

Tab 2: "History"
Description: "All stock changes including sales"

Tab 3: "Low Stock"
Description: "Products that need restocking"
```

---

### 2. **Adjustment Form Dialog - When Clicked from "Low Stock → Restock"**

**Current Issues:**
- Product selector shows all products (confusing - user already selected which to restock)
- Adjustment Type selector (should auto-default to "Stock In")
- Product info is too small to see
- "Notes" is not meaningful

**Proposed Changes:**

**A. Product Selection:**
- ✅ Make it **read-only** when coming from Restock button
- ✅ Show selected product with large, clear text
- ❌ Hide the dropdown selector (user already clicked which product)

**B. Adjustment Type:**
- ✅ Automatically set to "Stock In (Add)"
- ✅ Hide the type selector when restocking
- ✅ Show clear label: "Restocking - Adding items to inventory"

**C. Product Info Card - Make it PROMINENT:**
```
Current Design (too small):
Category: Pampalasa (Condiments)
Current Stock: 0
Low Stock Alert: 10

New Design (BIG & CLEAR):
┌─────────────────────────────────┐
│ 📦 PRODUCT INFORMATION          │
├─────────────────────────────────┤
│ Category:                       │
│ Pampalasa (Condiments)          │ <- Bigger font
│                                 │
│ Current Stock: 0                │ <- Bigger, bold, red if 0
│ Low Stock Alert: 10             │ <- Bigger font
└─────────────────────────────────┘
```

**D. Notes Field:**
```
Current: "Notes (Optional)"

Options:
1. "Reason (Optional)" - Simple English
2. "Dahilan (Optional)" - Tagalog
3. "Details (Optional)" - Simple
4. "Bakit? (Optional)" - Tagalog (Why?)

Recommended: "Reason (Optional)"
Placeholder: "E.g., Delivered from supplier, Damaged items, Stock count correction"
```

**E. Quantity Field:**
```
Current: "Quantity *"
When Restocking: "How many items to add? *"
Placeholder: "Enter number of items"
```

---

### 3. **Low Stock Alerts - Better Visual Hierarchy**

**Product Info Display:**
```
Current (small):
Chippy | Stock: 2 | Threshold: 10

New (bigger, clearer):
┌────────────────────────────────┐
│ Chippy                         │ <- text-base font
│ Snacks                         │ <- text-sm muted
│                                │
│ Stock: 2 / Threshold: 10      │ <- text-sm, bold numbers
│ Status: Critical ⚠️            │ <- badge bigger
└────────────────────────────────┘
```

---

### 4. **Language & Terminology**

**Use Filipino-friendly terms:**
- "Adjustment" → "Stock Change" or keep but explain better
- "Movement" → "Transaction" or "Change"
- "Threshold" → "Minimum Stock" or "Alert Level"
- "Notes" → "Reason" or "Details"

**Button Labels:**
- "New Adjustment" → "Add/Remove Stock" or "Ayusin Stock"
- "Create Adjustment" → "Save Changes" or "I-save"
- "Restock" → keep (universally understood)

---

### 5. **Dialog Modes**

**Mode 1: Restock (from Low Stock tab)**
- Product: Read-only, large display
- Type: Hidden (auto "Stock In")
- Title: "Restock - [Product Name]"
- Focus: Just enter quantity and reason

**Mode 2: Manual Adjustment (from New Adjustment button)**
- Product: Searchable dropdown
- Type: Selectable (In/Out/Adjust)
- Title: "New Stock Adjustment"
- Full form shown

---

## Implementation Steps

1. ✅ Create new type definitions for dialog modes
2. ✅ Update adjustment form dialog with conditional rendering
3. ✅ Improve product info card styling (bigger fonts, better layout)
4. ✅ Change "Notes" to "Reason" with Filipino-friendly placeholder
5. ✅ Update low stock alerts table (bigger text, clearer layout)
6. ✅ Update tab descriptions
7. ✅ Update button labels
8. ✅ Add visual indicators (icons, colors) for better comprehension
9. ✅ Test with Filipino users (if possible) or review for clarity

---

## Key Principles

1. **Less English Jargon** - Use simple, conversational language
2. **Visual Hierarchy** - Important info should be BIG and CLEAR
3. **Reduce Cognitive Load** - Pre-fill what we know, ask only what's needed
4. **Filipino Context** - Use terms familiar to sari-sari store owners
5. **Clear Actions** - Buttons should say exactly what they do
