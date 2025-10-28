# S2EH Backend API
**Sagnay to Export Hub - PHP MySQL Backend**

## 📋 Overview
Complete REST API backend built with PHP and MySQL for the S2EH e-commerce platform.

---

## 🚀 Quick Start

### Prerequisites
- ✅ XAMPP installed and running
- ✅ Apache on port **8080**
- ✅ MySQL on port **3306**

### Installation

#### 1. Database Setup

Open phpMyAdmin: `http://localhost/phpmyadmin`

Run the SQL schema:
```bash
# Import the schema file
# Or run it directly in phpMyAdmin SQL tab
```

Copy and paste the contents of `database/schema.sql` into phpMyAdmin SQL tab and execute.

#### 2. Configure Database (if needed)

Edit `config/database.php` if your MySQL credentials are different:
```php
private $host = 'localhost';
private $port = '3306';
private $db_name = 's2eh_db';
private $username = 'root';
private $password = ''; // Change if you have a password
```

#### 3. Test the API

Open in browser:
```
http://localhost:8080/S2EH/s2e-backend/
```

You should see the API info and database connection status.

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8080/S2EH/s2e-backend/
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "user_type": "user"  // or "seller" or "admin"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "abc123...",
    "expires_at": "2024-01-01 12:00:00",
    "user_type": "user"
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

// For customers:
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "phone": "09123456789",
  "user_type": "user"
}

// For sellers:
{
  "email": "seller@example.com",
  "password": "password123",
  "business_name": "My Farm",
  "owner_name": "Juan Dela Cruz",
  "phone": "09123456789",
  "business_type": "individual",
  "user_type": "seller"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

### Products

#### Get All Products (Public)
```http
GET /api/products?page=1&limit=20&category=fresh-produce&search=tomato
```

#### Create Product (Seller only)
```http
POST /api/products/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Fresh Tomatoes",
  "description": "Organic tomatoes from Sagnay",
  "price": 50.00,
  "category_id": 1,
  "stock_quantity": 100,
  "unit": "kg",
  "status": "active"
}
```

---

### Categories

#### Get All Categories
```http
GET /api/categories
```

---

### Orders

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer {token}
```

#### Create Order (Customer only)
```http
POST /api/orders/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 5
    }
  ],
  "payment_method": "cod",
  "shipping_fee": 50,
  "notes": "Please deliver in the morning"
}
```

---

## 🗄️ Database Schema

### Main Tables:
- **users** - Customer accounts
- **sellers** - Seller/producer accounts
- **admins** - Admin accounts
- **products** - Product listings
- **categories** - Product categories
- **orders** - Customer orders
- **order_items** - Order line items
- **cart** - Shopping cart
- **cart_items** - Cart items
- **addresses** - User/seller addresses
- **sessions** - Authentication sessions
- **messages** - User messages

---

## 🔐 Authentication

This API uses **Bearer Token** authentication:

1. Login via `/api/auth/login` to get a token
2. Include token in subsequent requests:
   ```
   Authorization: Bearer {your-token-here}
   ```
3. Tokens expire after 24 hours
4. Use `/api/auth/logout` to invalidate token

---

## 🧪 Testing

### Default Admin Account
```
Email: admin@s2eh.local
Password: admin123
```

### Test the Connection
```bash
# Open in browser:
http://localhost:8080/S2EH/s2e-backend/

# Should return API info and database status
```

---

## 📝 Sample Categories

The schema includes default categories:
1. Fresh Produce
2. Fish & Seafood
3. Livestock & Poultry
4. Fish Farming

---

## 🛠️ Troubleshooting

### Database Connection Error
- Make sure MySQL is running in XAMPP
- Check database credentials in `config/database.php`
- Verify database `s2eh_db` exists

### 404 Errors
- Check Apache is running on port 8080
- Verify `.htaccess` file exists and mod_rewrite is enabled
- Check file paths are correct

### CORS Errors
- CORS is configured in `config/cors.php`
- Frontend (localhost:5173) is whitelisted
- Check browser console for specific errors

---

## 📂 Project Structure
```
s2e-backend/
├── api/
│   ├── auth/
│   │   ├── login.php
│   │   ├── register.php
│   │   ├── me.php
│   │   └── logout.php
│   ├── products/
│   │   ├── index.php
│   │   └── create.php
│   ├── categories/
│   │   └── index.php
│   └── orders/
│       ├── index.php
│       └── create.php
├── config/
│   ├── database.php
│   └── cors.php
├── helpers/
│   ├── Response.php
│   └── Auth.php
├── database/
│   └── schema.sql
├── .htaccess
├── index.php
└── README.md
```

---

## 📞 Support

For issues or questions, check:
- Database connection status at main endpoint
- Apache/MySQL logs in XAMPP
- Browser console for frontend errors

---

**Built with ❤️ for Sagnay, Camarines Sur**

