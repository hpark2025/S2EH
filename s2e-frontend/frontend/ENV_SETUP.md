# Environment Variables Setup

## Quick Setup

1. **Create a `.env` file** in your frontend root directory:

```bash
# .env
VITE_MEDUSA_PUBLISHABLE_KEY=pk_01H...your_actual_publishable_key_here
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
```

2. **Replace the placeholder** with your actual MedusaJS publishable key

3. **Restart your development server**:
```bash
npm run dev
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MEDUSA_PUBLISHABLE_KEY` | Your MedusaJS publishable key (starts with `pk_`) | `pk_01H...` |
| `VITE_MEDUSA_BACKEND_URL` | MedusaJS backend URL | `http://localhost:9000` |

## Important Notes

- **Vite Environment Variables**: Must be prefixed with `VITE_` to be accessible in the browser
- **Publishable Key**: Must start with `pk_` and be obtained from your MedusaJS admin dashboard
- **Sales Channels**: Your publishable key must be associated with sales channels to access products

## Troubleshooting

If you get `process is not defined` error:
- Make sure you're using `VITE_` prefix for environment variables
- Restart your development server after changing `.env` file
- Check that your `.env` file is in the frontend root directory

