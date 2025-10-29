# MedusaJS Frontend Integration Setup

## 🔑 Publishable Key Configuration

### Step 1: Create Publishable API Key in MedusaJS Admin

1. **Access your MedusaJS Admin Dashboard** (usually at `http://localhost:9000/app`)
2. **Navigate to Settings → API Key Management**
3. **Create a new Publishable API Key**:
   - Title: "Frontend Store Key"
   - Type: "Publishable"
4. **Copy the generated key** (starts with `pk_`)

### Step 2: Configure Frontend

#### Option 1: Environment Variables (Recommended)

1. Create a `.env` file in your frontend root directory:
```bash
# .env
VITE_MEDUSA_PUBLISHABLE_KEY=pk_01H...your_actual_publishable_key_here
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
```

2. Restart your development server:
```bash
npm run dev
```

#### Option 2: Direct Configuration

1. Open `src/config/medusa.js`
2. Replace the placeholder with your actual publishable key:
```javascript
export const MEDUSA_CONFIG = {
  PUBLISHABLE_KEY: 'pk_01H...your_actual_publishable_key_here',
  // ... rest of config
};
```

### Step 3: Associate Sales Channels (Important!)

**⚠️ Critical**: Your publishable key must be associated with sales channels to access products.

1. **In MedusaJS Admin Dashboard**:
   - Go to Settings → API Key Management
   - Click on your publishable key
   - Add sales channels to the key's scope
   - Save the configuration

2. **Or via API**:
```bash
curl -X POST 'http://localhost:9000/admin/api-keys/{your_key_id}/sales-channels' \
-H 'Authorization: Bearer {admin_token}' \
-H 'Content-Type: application/json' \
--data-raw '{
  "add": ["sc_123"]  # Add your sales channel IDs
}'
```

## 🚀 Testing the Integration

### 1. Verify Publishable Key is Working

Add this to any component to test:
```javascript
import { MEDUSA_CONFIG } from '../config/medusa';

console.log('Publishable Key:', MEDUSA_CONFIG.PUBLISHABLE_KEY);
console.log('Backend URL:', MEDUSA_CONFIG.BACKEND_URL);
```

### 2. Test API Requests

The publishable key is automatically included in all API requests via the `x-publishable-api-key` header.

### 3. Check Network Requests

Open browser DevTools → Network tab and verify that:
- All requests include the `x-publishable-api-key` header
- Requests are going to the correct backend URL
- No CORS errors are occurring

## 🔧 Troubleshooting

### Common Issues:

1. **"Publishable API key required" error**
   ```json
   {
     "type": "not_allowed",
     "message": "Publishable API key required in the request header: x-publishable-api-key"
   }
   ```
   - **Solution**: Ensure your publishable key is properly set in environment variables
   - **Check**: Verify the key starts with `pk_` and is correctly configured

2. **"Publishable key needs to have a sales channel configured" error**
   ```json
   {
     "type": "invalid_data",
     "message": "Publishable key needs to have a sales channel configured."
   }
   ```
   - **Solution**: Associate sales channels with your publishable key in the admin dashboard
   - **Steps**: Settings → API Key Management → Select your key → Add sales channels

3. **CORS errors**
   - **Solution**: Configure CORS in your MedusaJS backend
   - **Check**: Ensure your frontend URL is allowed in the backend CORS settings

4. **"Store not found" error**
   - **Solution**: Verify the publishable key is correct and active
   - **Check**: Ensure the backend is running and the store is properly configured

5. **Products not loading**
   - **Solution**: Ensure your publishable key has access to sales channels
   - **Check**: Products are only accessible through sales channels

## 📋 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MEDUSA_PUBLISHABLE_KEY` | Your MedusaJS publishable key | `pk_01H...` |
| `VITE_MEDUSA_BACKEND_URL` | MedusaJS backend URL | `http://localhost:9000` |

## 🎯 Next Steps

1. Configure your publishable key
2. Test the seller login functionality
3. Verify that API requests include the publishable key
4. Test the complete authentication flow
