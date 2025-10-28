# S2EH Complete Setup Guide
**Sagnay to Export Hub - XAMPP MySQL + React Setup**

---

## 🎯 System Overview

```
┌─────────────────────────────────────────────────┐
│   Frontend (React + Vite)                       │
│   http://localhost:5173                         │
└─────────────────┬───────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────────┐
│   Backend (PHP REST API)                        │
│   http://localhost:8080/S2EH/s2e-backend        │
└─────────────────┬───────────────────────────────┘
                  │
                  │ Database Queries
                  ▼
┌─────────────────────────────────────────────────┐
│   MySQL Database (XAMPP)                        │
│   Database: s2eh_db                             │
│   Port: 3306                                    │
└─────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

### Required Software:
- ✅ **XAMPP** (with Apache & MySQL)
- ✅ **Node.js** (v20 or v22)
- ✅ **npm** (comes with Node.js)

---

## 🚀 Installation Steps

### STEP 1: XAMPP Setup

#### 1.1 Configure Apache Port (Already Done ✅)
Your Apache is running on **port 8080**

To verify:
1. Open XAMPP Control Panel
2. Click **Config** next to Apache
3. Check that `Listen 8080` is set

#### 1.2 Start Services
In XAMPP Control Panel, start:
- ✅ **Apache** (port 8080)
- ✅ **MySQL** (port 3306)

---

### STEP 2: Database Setup

#### 2.1 Access phpMyAdmin
Open in browser:
```
http://localhost/phpmyadmin
```

#### 2.2 Import Database Schema

**Option A: Using SQL Tab**
1. Click **SQL** tab in phpMyAdmin
2. Open file: `C:\xampp\htdocs\S2EH\s2e-backend\database\schema.sql`
3. Copy all contents
4. Paste into SQL tab
5. Click **Go**

**Option B: Using Import**
1. Click **Import** tab
2. Choose file: `s2e-backend/database/schema.sql`
3. Click **Go**

#### 2.3 Verify Database
You should see a new database `s2eh_db` with tables:
- users
- sellers
- admins
- products
- categories
- orders
- order_items
- cart
- addresses
- sessions
- messages

---

### STEP 3: Backend API Setup

#### 3.1 Test Backend API
Open in browser:
```
http://localhost:8080/S2EH/s2e-backend/
```

You should see:
```json
{
  "success": true,
  "message": "S2EH API is running",
  "data": {
    "name": "S2EH Backend API",
    "version": "1.0.0",
    "database": {
      "status": "connected",
      "info": {
        "success": true,
        "message": "Database connection successful!",
        "database": "s2eh_db"
      }
    }
  }
}
```

#### 3.2 If Database Connection Fails
Edit `s2e-backend/config/database.php`:
```php
private $host = 'localhost';
private $port = '3306';
private $db_name = 's2eh_db';
private $username = 'root';
private $password = ''; // Add your MySQL password here if set
```

---

### STEP 4: Frontend Setup

#### 4.1 Install Dependencies
Open **Command Prompt** or **PowerShell**:
```bash
cd C:\xampp\htdocs\S2EH\s2e-frontend\frontend
npm install
```

#### 4.2 Start Development Server
```bash
npm run dev
```

You should see:
```
VITE v4.4.5  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 4.3 Access Frontend
Open in browser:
```
http://localhost:5173
```

---

## 🧪 Testing the Setup

### Test 1: Backend API Status
```bash
# Open in browser:
http://localhost:8080/S2EH/s2e-backend/
```
✅ Should show API info with database connected

### Test 2: Get Categories
```bash
# Open in browser:
http://localhost:8080/S2EH/s2e-backend/api/categories
```
✅ Should return list of 4 default categories

### Test 3: Frontend Connection
1. Open: `http://localhost:5173`
2. Open browser console (F12)
3. Check for any connection errors
✅ Should load without CORS errors

---

## 🔐 Default Credentials

### Admin Account
```
Email: admin@s2eh.local
Password: admin123
```

### Test Customer
Create via Registration page or API:
```
Email: customer@test.com
Password: password123
```

---

## 📡 API Endpoints Reference

### Base URL
```
http://localhost:8080/S2EH/s2e-backend/
```

### Authentication
```
POST /api/auth/login       - Login
POST /api/auth/register    - Register
GET  /api/auth/me          - Get current user
POST /api/auth/logout      - Logout
```

### Products
```
GET  /api/products         - List products
POST /api/products/create  - Create product (seller)
```

### Categories
```
GET  /api/categories       - List categories
```

### Orders
```
GET  /api/orders           - Get user orders
POST /api/orders/create    - Create order
```

---

## 🛠️ Troubleshooting

### Problem: "Can't connect to MySQL"
**Solution:**
1. Check MySQL is running in XAMPP
2. Verify database `s2eh_db` exists in phpMyAdmin
3. Check credentials in `s2e-backend/config/database.php`

### Problem: "404 Not Found" for API endpoints
**Solution:**
1. Verify Apache is running on port 8080
2. Check `.htaccess` file exists in `s2e-backend/`
3. Enable `mod_rewrite` in Apache config

### Problem: CORS errors in browser
**Solution:**
1. Check `s2e-backend/config/cors.php` has correct origin
2. Restart Apache after changes
3. Clear browser cache

### Problem: Frontend can't connect to backend
**Solution:**
1. Check both servers are running:
   - Backend: `http://localhost:8080/S2EH/s2e-backend/`
   - Frontend: `http://localhost:5173`
2. Check `vite.config.js` proxy settings
3. Clear browser cache and restart dev server

---

## 📂 Project Structure

```
C:\xampp\htdocs\S2EH\
├── s2e-backend/              ← PHP Backend
│   ├── api/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── categories/
│   │   └── orders/
│   ├── config/
│   │   ├── database.php      ← Database config
│   │   └── cors.php
│   ├── helpers/
│   ├── database/
│   │   └── schema.sql        ← Database schema
│   ├── .htaccess
│   ├── index.php
│   └── README.md
│
├── s2e-frontend/             ← React Frontend
│   └── frontend/
│       ├── src/
│       ├── public/
│       ├── vite.config.js    ← Updated for port 8080
│       ├── package.json
│       └── .env.example
│
└── SETUP_GUIDE.md           ← This file
```

---

## 🎬 Quick Start Commands

```bash
# Terminal 1: Frontend
cd C:\xampp\htdocs\S2EH\s2e-frontend\frontend
npm run dev

# XAMPP: Start Apache & MySQL
# Then test backend at: http://localhost:8080/S2EH/s2e-backend/
```

---

## ✅ Success Checklist

- [ ] XAMPP Apache running on port 8080
- [ ] XAMPP MySQL running on port 3306
- [ ] Database `s2eh_db` created with tables
- [ ] Backend API returns success at: `http://localhost:8080/S2EH/s2e-backend/`
- [ ] Frontend running at: `http://localhost:5173`
- [ ] No CORS errors in browser console
- [ ] Can view categories at: `http://localhost:8080/S2EH/s2e-backend/api/categories`

---

## 🌐 URLs Summary

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8080/S2EH/s2e-backend/ |
| **phpMyAdmin** | http://localhost/phpmyadmin |
| **API Docs** | http://localhost:8080/S2EH/s2e-backend/ |

---

**Happy Coding! 🚀**

Built with ❤️ for Sagnay, Camarines Sur

