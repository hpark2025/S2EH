import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define environment variables for Vite
  define: {
    'process.env': process.env
  },
  // Add proxy for development to handle CORS
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost', // Forward cookies properly
        rewrite: (path) => path.replace(/^\/api/, '/S2EH/s2e-backend/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Request headers:', JSON.stringify(req.headers));
            
            // Forward cookies from the original request
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
            }
            
            // Forward Authorization header (case-insensitive check)
            const authHeader = req.headers.authorization || req.headers.Authorization;
            if (authHeader) {
              proxyReq.setHeader('Authorization', authHeader);
              console.log('✅ Forwarding Authorization header:', authHeader.substring(0, 30) + '...');
            } else {
              console.log('❌ NO Authorization header found in request');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  // Add compatibility options for Node.js version
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress specific warnings that might occur with Node.js 22
        if (warning.code === 'EVAL') return
        warn(warning)
      }
    }
  }
})