# Product Management Setup Guide

## Summary
This document explains the product submission and approval workflow.

## Database Changes

### 1. Run Migration SQL
Execute this in phpMyAdmin to update your `products` table:

```sql
ALTER TABLE products 
MODIFY COLUMN status ENUM('draft', 'proposed', 'approved', 'rejected', 'active', 'archived') DEFAULT 'draft';
```

File location: `s2e-backend/database/migration_update_product_status.sql`

## Workflow

### For Sellers (Producers):
1. Login as verified seller
2. Go to Products page (`/seller/products`)
3. **Check "Simple Form" checkbox** ✅
4. Click "Add Product" button
5. Fill in the form:
   - Product Title
   - Price
   - Description
   - Stock Quantity
   - **Status**: Choose either:
     - `Draft` → NOT visible to admin (private to seller)
     - `Proposed` → Visible to admin for approval ✅
6. Click "Create Product"

### For Admins:
1. Login as admin
2. Go to Products page (`http://localhost:5173/#/admin/products`)
3. See all products with status = `proposed` (default filter)
4. Filter options:
   - **Proposed** (default) → Products awaiting approval
   - **Approved** → Products approved by admin
   - **Rejected** → Products rejected by admin
   - **All** → All proposed, approved, and rejected
5. Actions:
   - **Approve** → Changes status to `approved`
   - **Reject** → Changes status to `rejected` (can add reason)

## Status Flow

```
Draft → (Seller keeps private)

Proposed → (Seller submits) → Admin Reviews
         ↓
         Approved (Admin approves)
         OR
         Rejected (Admin rejects)
```

## API Endpoints

### Seller Endpoints:
- `POST /api/products/create` - Create product

### Admin Endpoints:
- `GET /api/products/admin` - Get products for review (proposed, approved, rejected)
- `POST /api/products/approve` - Approve product
- `POST /api/products/reject` - Reject product

## Frontend Files Changed:
1. `SimpleProductForm.jsx` - Updated status dropdown (Draft, Proposed)
2. `AdminProductsPage.jsx` - Fetch and display proposed products
3. `adminAPI.js` - Added products methods (getAll, approve, reject)
4. `sellerAPI.js` - Updated createProduct to use PHP backend

## Backend Files Created:
1. `api/products/admin.php` - Admin products listing
2. `api/products/approve.php` - Approve product
3. `api/products/reject.php` - Reject product
4. `database/migration_update_product_status.sql` - DB migration

## Testing

### Test as Seller:
```
1. Login: http://localhost:5173/#/seller/login
2. Email: hplaza292@gmail.com (verify status first!)
3. Go to Products page
4. Check "Simple Form"
5. Create product with status = "Proposed"
```

### Test as Admin:
```
1. Login: http://localhost:5173/#/admin/login
2. Email: admin@s2eh.local
3. Go to: http://localhost:5173/#/admin/products
4. Should see proposed products
5. Click Approve or Reject
```

## Notes:
- ✅ Draft products = NOT visible to admin (seller's private drafts)
- ✅ Proposed products = Visible to admin for review
- ✅ Approved products = Approved by admin (can be made "active" for public later)
- ✅ Rejected products = Rejected by admin


