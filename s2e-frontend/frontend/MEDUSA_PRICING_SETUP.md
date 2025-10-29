# Medusa Pricing Setup Guide

## 🚨 **Current Issue: `Cannot read properties of undefined (reading 'calculated_amount')`**

This error occurs because product variants in your Medusa backend don't have proper pricing configured. Medusa requires each variant to have associated pricing data before it can be added to a cart.

## 🔧 **Root Cause**

The error happens in the Medusa backend pricing workflow when trying to access `calculated_amount` on a pricing object that doesn't exist. This occurs because:

1. **Missing MoneyAmount records** - Variants need associated pricing records
2. **No Price List configuration** - Variants need to be linked to price lists
3. **Missing region-specific pricing** - Prices need to be associated with regions

## 🛠️ **Backend Setup Required**

### 1. **Create Price Lists**

You need to create price lists in your Medusa backend. Here's how to do it via the admin panel or API:

```bash
# Create a price list via API
curl -X POST 'http://localhost:9000/admin/price-lists' \
-H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
-H 'Content-Type: application/json' \
--data '{
  "name": "Default Price List",
  "description": "Default pricing for all products",
  "type": "sale",
  "status": "active"
}'
```

### 2. **Create MoneyAmount Records**

Each variant needs MoneyAmount records for pricing:

```bash
# Create money amount for a variant
curl -X POST 'http://localhost:9000/admin/money-amounts' \
-H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
-H 'Content-Type: application/json' \
--data '{
  "currency_code": "php",
  "amount": 2000,
  "variant_id": "YOUR_VARIANT_ID",
  "region_id": "YOUR_REGION_ID"
}'
```

### 3. **Link Variants to Price Lists**

```bash
# Link variant to price list
curl -X POST 'http://localhost:9000/admin/product-variant-money-amounts' \
-H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
-H 'Content-Type: application/json' \
--data '{
  "variant_id": "YOUR_VARIANT_ID",
  "money_amount_id": "YOUR_MONEY_AMOUNT_ID"
}'
```

## 🧪 **Frontend Testing**

I've added comprehensive testing tools to help diagnose pricing issues:

### 1. **Variant Pricing Validation**

The `cartAPI.validateVariantPricing()` function checks if a variant has proper pricing before adding to cart.

### 2. **Enhanced Cart Debugger**

The CartDebugger now includes:
- **"Test Pricing"** button - Validates variant pricing configuration
- **"Test Add to Cart"** button - Tests adding items to cart
- **Region information** - Shows available regions and cart region
- **Detailed logging** - Comprehensive console logs for debugging

### 3. **Error Handling**

The frontend now provides clear error messages when pricing is missing:

```
Cannot add variant to cart: Variant has no pricing configured. 
Please ensure the product has proper pricing configured in the backend.
```

## 🔍 **How to Test**

1. **Visit the home page** (`http://localhost:5173/#/user/home`)
2. **Scroll to the debuggers section**
3. **Click "Test Pricing"** on any product to validate its pricing
4. **Check console logs** for detailed pricing information
5. **Click "Test Add to Cart"** to test cart functionality

## 📋 **Backend Checklist**

- [ ] Create regions in Medusa admin
- [ ] Create price lists
- [ ] Create MoneyAmount records for each variant
- [ ] Link variants to price lists via ProductVariantMoneyAmount
- [ ] Ensure variants have calculated_price in API responses
- [ ] Test adding items to cart via admin panel

## 🚀 **Quick Fix for Development**

If you need a quick fix for development, you can create a simple price list with all variants:

```javascript
// This would be a backend script to set up pricing
const setupPricing = async () => {
  // 1. Get all variants
  const variants = await medusa.admin.variants.list()
  
  // 2. Create price list
  const priceList = await medusa.admin.priceLists.create({
    name: "Default Prices",
    type: "sale",
    status: "active"
  })
  
  // 3. Add prices for each variant
  for (const variant of variants) {
    await medusa.admin.priceListPrices.create(priceList.id, {
      variant_id: variant.id,
      amount: 1000, // Default price in cents
      currency_code: "php"
    })
  }
}
```

## 📞 **Next Steps**

1. **Set up pricing in your Medusa backend** using the admin panel or API
2. **Test the pricing validation** using the frontend debugger
3. **Verify cart functionality** works with properly priced variants
4. **Remove debuggers** once everything is working

The frontend is now properly configured to handle pricing validation and provide clear error messages when pricing is missing!
