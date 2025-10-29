-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2025 at 01:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `s2eh_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `address_type` enum('shipping','billing','business') DEFAULT 'shipping',
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `barangay_code` varchar(20) DEFAULT NULL,
  `municipality` varchar(100) DEFAULT NULL,
  `municipality_code` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `province_code` varchar(20) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Philippines',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `seller_id`, `address_type`, `first_name`, `last_name`, `phone`, `address_line_1`, `address_line_2`, `barangay`, `barangay_code`, `municipality`, `municipality_code`, `city`, `province`, `province_code`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(6, NULL, 6, 'business', 'Harold Plaza', 'Harold Plaza', '+639630213879', 'Business Address', NULL, 'Niño Jesus', NULL, 'City of Iriga', NULL, 'City of Iriga', 'Camarines Sur', NULL, NULL, 'Philippines', 1, '2025-10-28 09:41:16', '2025-10-28 11:13:26'),
(7, NULL, 10, 'business', NULL, NULL, NULL, '', NULL, 'San Vicente (Pob.)', NULL, 'Lagonoy', NULL, NULL, 'Camarines Sur', NULL, NULL, 'Philippines', 0, '2025-10-28 11:14:38', '2025-10-28 11:14:38'),
(8, 9, NULL, 'shipping', 'tyt', 'ytyt', '+639095677546', '', NULL, 'Aguinaldo', '160303032', 'Esperanza', '160303000', NULL, 'Agusan Del Sur', '160300000', NULL, 'Philippines', 1, '2025-10-28 16:23:36', '2025-10-28 16:23:36'),
(9, 10, NULL, 'shipping', 'try', 'dsfsf', '+63954664566745', '', NULL, 'Apo Macote', '101312027', 'City of Malaybalay', '101312000', NULL, 'Bukidnon', '101300000', '8700', 'Philippines', 1, '2025-10-28 21:02:42', '2025-10-28 21:02:42'),
(10, NULL, 10, 'business', NULL, NULL, NULL, 'dsfsf', NULL, 'San Antonio', NULL, 'Bagac', NULL, NULL, 'Bataan', NULL, '2107', 'Philippines', 0, '2025-10-28 23:45:46', '2025-10-28 23:45:46'),
(12, NULL, 12, 'business', 'mark Plaza', 'mark Plaza', '+639630213833', 'Business Address', NULL, 'Bgy. 38 - Gogon', NULL, NULL, NULL, 'City of Legazpi', 'Albay', NULL, NULL, 'Philippines', 1, '2025-10-29 00:31:43', '2025-10-29 00:31:43');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `full_name`, `role`, `permissions`, `status`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'admin@s2eh.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin', NULL, 'active', '2025-10-28 08:38:16', '2025-10-29 00:32:25', '2025-10-29 00:32:25');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `image_url`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Fresh Produce', 'fresh-produce', 'Fresh fruits and vegetables', NULL, NULL, 1, 1, '2025-10-28 08:38:16', '2025-10-28 08:38:16'),
(2, 'Fish & Seafood', 'fish-seafood', 'Fresh catch from Sagnay', NULL, NULL, 1, 2, '2025-10-28 08:38:16', '2025-10-28 08:38:16'),
(3, 'Livestock & Poultry', 'livestock-poultry', 'Meat and poultry products', NULL, NULL, 1, 3, '2025-10-28 08:38:16', '2025-10-28 08:38:16'),
(4, 'Fish Farming', 'fish-farming', 'Aquaculture products', NULL, NULL, 1, 4, '2025-10-28 08:38:16', '2025-10-28 08:38:16');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_type` enum('user','seller','admin') NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `receiver_type` enum('user','seller','admin') NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `parent_message_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` enum('cod','gcash','bank_transfer','card') DEFAULT 'cod',
  `subtotal` decimal(10,2) NOT NULL,
  `shipping_fee` decimal(10,2) DEFAULT 0.00,
  `tax` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `shipping_address_id` int(11) DEFAULT NULL,
  `billing_address_id` int(11) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_title` varchar(255) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `unit` enum('kg','g','lbs','pcs','dozen','bundle','sack') DEFAULT 'kg',
  `stock_quantity` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 10,
  `status` enum('draft','proposed','published','rejected','archived') DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT 0,
  `thumbnail` varchar(255) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `seller_id`, `category_id`, `title`, `slug`, `description`, `price`, `compare_at_price`, `cost_price`, `sku`, `barcode`, `weight`, `unit`, `stock_quantity`, `low_stock_threshold`, `status`, `is_featured`, `thumbnail`, `images`, `tags`, `created_at`, `updated_at`) VALUES
(2, 10, NULL, 'Tinapay', 'tinapay-6900c04db3d25', 'sdsd', 5.00, NULL, NULL, 'SKU-1761656909662', NULL, NULL, 'kg', 100, 10, 'published', 0, NULL, '[]', '[]', '2025-10-28 13:08:29', '2025-10-28 13:12:06'),
(3, 10, NULL, 'Milk tea', 'milk-tea-6900cf6e232f7', 'mdsfdsfdsf', 45.00, NULL, NULL, 'SKU-1761660782061', NULL, NULL, 'kg', 50, 10, 'published', 0, NULL, '[]', '[]', '2025-10-28 14:13:02', '2025-10-28 20:48:56'),
(6, 10, NULL, 'tinapa', 'tinapa-69012afe2ff0d', 'tinapa', 6.00, NULL, NULL, 'SKU-1761684222079', NULL, NULL, 'kg', 100, 10, 'published', 0, '/uploads/products/product_69012afe323a9.jpg', '[]', '[]', '2025-10-28 20:43:42', '2025-10-28 20:48:52');

-- --------------------------------------------------------

--
-- Table structure for table `sellers`
--

CREATE TABLE `sellers` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `owner_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `business_type` enum('individual','cooperative','enterprise','agriculture','fishery','food','handicrafts','livestock','retail','services','other') DEFAULT 'individual',
  `business_description` text DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `is_lgu_verified` tinyint(1) DEFAULT 0,
  `tax_id` varchar(100) DEFAULT NULL,
  `business_permit` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sellers`
--

INSERT INTO `sellers` (`id`, `email`, `password`, `business_name`, `owner_name`, `phone`, `business_type`, `business_description`, `verification_status`, `status`, `is_lgu_verified`, `tax_id`, `business_permit`, `created_at`, `updated_at`, `last_login`) VALUES
(6, 'hplaza292@gmail.com', '$2y$10$7Z8JwlqLxlxSj4H6AB20pOywesm3F3ZGO5cwyHUfGTNyF1fRuqxRO', 'Harold Kinalas', 'Harold Plaza', '+639630213879', 'food', 'sadsad', 'pending', 'active', 0, NULL, '3344454', '2025-10-28 09:41:16', '2025-10-28 09:41:16', NULL),
(10, 'h@gmail.com', '$2y$10$Zk8cSuYt9uHYxvpVha0jp.g4C.Egr.sitCkg51sDtOyNHfa3ajn52', 'random', 'sdasd dsasa sadds', '+639630213864', 'fishery', 'sadsa', 'verified', 'active', 0, NULL, '45354', '2025-10-28 11:14:38', '2025-10-28 21:19:27', '2025-10-28 21:19:27'),
(11, 'testtest@gmail.com', '$2y$10$ZkTEIERYEx3rEErWsKoI5e.aIjSEVMxBueJXH8uGPAU2pZdAbQs3S', 'dfgdfg', 'Kel dfsdf', '+639444438749', 'fishery', 'fdgfdgfd', 'pending', 'active', 0, NULL, '333', '2025-10-29 00:05:31', '2025-10-29 00:05:31', NULL),
(12, 'ey@gmail.com', '$2y$10$c48t0AxsfdpdRleyFprpHOu1BHmjW49o.r3Vf7lK1YFE5dAUtlGQe', 'Melissa Paresan', 'mark Plaza', '+639630213833', 'livestock', 'dsfdsfds', 'verified', 'active', 0, NULL, '35454455', '2025-10-29 00:31:43', '2025-10-29 00:33:04', '2025-10-29 00:33:04');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `user_type` enum('user','seller','admin') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `seller_id`, `admin_id`, `token`, `user_type`, `ip_address`, `user_agent`, `expires_at`, `created_at`) VALUES
(1, NULL, NULL, 1, '6b13da71e673d138f796edc05fa3c8ad60e4984681519f794572240939d56a49', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 01:57:55', '2025-10-28 08:57:55'),
(2, NULL, NULL, 1, 'c85981c887e4a2c06fdb2601e62319b44e0d428e7c4cc490a23aaf735a576433', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 01:58:29', '2025-10-28 08:58:29'),
(3, NULL, NULL, 1, 'd3b9284a32959fba20d226b2a1809ea82e138358334618490a4538be28d7666a', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 02:00:15', '2025-10-28 09:00:15'),
(4, NULL, NULL, 1, '1fc540847c3b39afd8df7bea4886d16a2c716ceec1d203d18e9d9ecdfad4c096', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 02:01:27', '2025-10-28 09:01:27'),
(5, NULL, NULL, 1, '79f32c59bcd2b4e3ce1be78fbe358d284463e651e48df4d9d12768454a82100f', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 02:03:36', '2025-10-28 09:03:36'),
(6, NULL, NULL, 1, '06419362b025b532a2fadec4bcddc078764462d137d11400f5f113330e681efe', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 02:14:44', '2025-10-28 09:14:44'),
(16, NULL, NULL, 1, '116d57ddc4a41644ede4605383875ac5c868e81787733bee084bc0cb42381f8f', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 02:41:43', '2025-10-28 09:41:43'),
(17, NULL, NULL, 1, 'c8070d41619b4e35dde3f89ec81f9a4f7ed28d80dd9af871f34a0739efeab4c3', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 03:06:43', '2025-10-28 10:06:43'),
(18, NULL, NULL, 1, '698ed451a3f200f03d9ecc7ae1f5bb7caa7dd0ca5fdef184519e0b3d4b7d8352', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 03:44:34', '2025-10-28 10:44:34'),
(21, NULL, NULL, 1, 'c4daeeef12d909648da66b0fca76669453ac8f862552dadfd2d62a9dfa53987b', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 04:25:26', '2025-10-28 11:25:26'),
(22, 2, NULL, NULL, 'da54a6da7f3af834393bc15f1cf04e499a6da8098849d32f28369c8d03343adb', 'user', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 04:35:24', '2025-10-28 11:35:24'),
(23, NULL, NULL, 1, 'fbc5528902e7760adf3eb8db061d284c3cc60b0ed07984fff31aece52d1978bb', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 04:36:18', '2025-10-28 11:36:18'),
(24, NULL, NULL, 1, 'e01dddb77df97e73f1769f40e6fddb83547fa829d4da91eda78680008c19a1f8', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 04:40:48', '2025-10-28 11:40:48'),
(25, 2, NULL, NULL, '05c2ff324030a64787d35274b539ef47160db3657e3f4c7397d769a7ed01f3d9', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 04:58:42', '2025-10-28 11:58:42'),
(26, 2, NULL, NULL, 'f1911ebbda0624b2057627beecb372a3e66769716f1d86602009d857422f770f', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 04:59:03', '2025-10-28 11:59:03'),
(27, 2, NULL, NULL, '1e61ecb57c1d561c5b614fcf5cddb64393c226dbc6f1c525011f62e3b57e5309', 'user', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 05:01:20', '2025-10-28 12:01:20'),
(28, NULL, 10, NULL, '529ae7724455ffa7781cf8b7690990ad0de9597ace825312c3e80aa7f1ccfc12', 'seller', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 05:03:21', '2025-10-28 12:03:21'),
(29, NULL, NULL, 1, '92c2addbe82e9af5e23148f0d5228e6866fbd9da6aa7d71c11497bbd54768b8a', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 05:07:18', '2025-10-28 12:07:18'),
(30, NULL, 10, NULL, '7f65143026b39011d40990361be0aed2d3e5d57da9c870140190371c7fb9221d', 'seller', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 05:20:45', '2025-10-28 12:20:45'),
(31, NULL, NULL, 1, '046205990e491de4418e01c70a94cdd80f6d057c2deb96a2cc5c53b2111b952e', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 06:09:01', '2025-10-28 13:09:01'),
(32, 2, NULL, NULL, '3a5466756d3f6b05a6973454061f41f16368a27cac9f562152187dbb3ea87cb2', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 06:13:34', '2025-10-28 13:13:34'),
(33, NULL, NULL, 1, 'fbc1292d023375e389d376a74f6d29d912cda11cd6b5b061d4f2f9757f96871e', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 06:15:18', '2025-10-28 13:15:18'),
(34, 2, NULL, NULL, 'b89cf56012f9914cad88656b2bb487322c6b08cd931cca40c7108edfdb10e29a', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 06:28:57', '2025-10-28 13:28:57'),
(35, NULL, NULL, 1, '97636e97810af4176f3289a3ee72ebfba50ed371424db2b9ec97079473bdb545', 'admin', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 06:31:09', '2025-10-28 13:31:09'),
(36, NULL, 10, NULL, '0b310b7848070302ef3ceb18b3d271488d14b74332dcca112a825d0f791e8fb2', 'seller', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 07:09:59', '2025-10-28 14:09:59'),
(37, NULL, NULL, 1, 'b4230a70f550609ca5db19f8b51b882cc91643916e4cc4f14dc9d0de4979e43d', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 07:13:36', '2025-10-28 14:13:36'),
(44, 9, NULL, NULL, '226b29d6625dd32c7e06c8f9bdfc8e2875dbcc3880e3618bc641956ed368f6fa', 'user', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 09:23:36', '2025-10-28 16:23:36'),
(45, 2, NULL, NULL, '130183bb0b84337ca40132c0f0645fd4e4a3dee5176e8f0cf81d792e903cc525', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 09:33:30', '2025-10-28 16:33:30'),
(46, 2, NULL, NULL, '5fa87913b7e5a39538e2319293b04e4ecd373455a325f63cdd0fd4b0215db4c1', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 11:06:05', '2025-10-28 18:06:05'),
(47, NULL, 10, NULL, '391ce53865fed8afb8e170b6a7368b7c5bf6668d1c4cbe24b97f407375ab7f0b', 'seller', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-29 13:09:34', '2025-10-28 20:09:34'),
(48, NULL, NULL, 1, '32b8eba96d3017f1ec6ac3a2e03c7bad67d3c70b6ec37e9f86dd92822e2ea183', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:10:37', '2025-10-28 20:10:37'),
(49, 9, NULL, NULL, 'c35f9f545e974ef0d383dbad9a973e69b8317c47cf875e87e0bc5445b48272d0', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:11:51', '2025-10-28 20:11:51'),
(50, NULL, 10, NULL, 'fa6d993e40009c658f71d2e30c66dcd3b601d594a39253d610efa87bd5450b81', 'seller', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:28:38', '2025-10-28 20:28:38'),
(51, NULL, NULL, 1, 'c579e36db936d77dd518170a05c7d64611ebe929642a29a73b08d148a5d7a706', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:46:29', '2025-10-28 20:46:29'),
(52, 9, NULL, NULL, '30a337a9afb5ef9c1f83ea692b5addaaa9f313626129a7f8f18ede861974ec34', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 13:49:56', '2025-10-28 20:49:56'),
(53, 10, NULL, NULL, '6ee0445e78900b9cfeb7362c224ad356c169a718f82882d166e96b9394fc3777', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 14:02:42', '2025-10-28 21:02:42'),
(54, NULL, NULL, 1, '5e57328541fded493940d64f0464c8a637caaae1eba91c5d556acd9c3f9ab78e', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 14:03:30', '2025-10-28 21:03:30'),
(55, 10, NULL, NULL, 'ca0e4f68d416a6f0b8eae29e2dfcd39fc6ea812b0926ff9586bd122c3f11d73e', 'user', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 14:06:50', '2025-10-28 21:06:50'),
(56, NULL, 10, NULL, '9b0752380c82abd5cc5dca99fc1e098591b5dbd306b73f8123536ae04513309b', 'seller', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 14:19:27', '2025-10-28 21:19:27'),
(57, NULL, NULL, 1, '269b470076ca8381e78cee5705c7d72e5c20d0a83c8b611b1f245592669775a7', 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 17:32:25', '2025-10-29 00:32:25'),
(58, NULL, 12, NULL, 'b4dceb1a5f507a77efe45ed013ba5f65a5a92b96f025cf940618ba066d978777', 'seller', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-29 17:33:04', '2025-10-29 00:33:04');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `status` enum('pending','active','inactive','suspended') DEFAULT 'pending',
  `email_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `phone`, `role`, `status`, `email_verified`, `created_at`, `updated_at`, `last_login`) VALUES
(2, 'john@gmail.com', '$2y$10$QUYAKbvSi/RnNpH4tK3AEOXxbbO3OjcFKCYjsd/QXxPGlcs2JxK0.', 'romeo', 'Doe', '+6397485643834', 'customer', 'active', 0, '2025-10-28 11:35:24', '2025-10-28 18:06:05', '2025-10-28 18:06:05'),
(9, 'test@gmail.com', '$2y$10$OxgerGAaP4IWhujzaGuvOuEaaw9uD4uahFM6uSnz1g6458OsOfi86', 'tyt', 'ytyt', '+639095677546', 'customer', 'active', 0, '2025-10-28 16:23:36', '2025-10-28 20:49:56', '2025-10-28 20:49:56'),
(10, 'serious@gmail.com', '$2y$10$GsmDQE8596Eq0mm51scZjuaUy9vE39MSXwG7yqGW1CS5YQQGt6Yfy', 'try', 'dsfsf', '+63954664566745', 'customer', 'active', 0, '2025-10-28 21:02:42', '2025-10-28 21:06:50', '2025-10-28 21:06:50');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_seller_id` (`seller_id`),
  ADD KEY `idx_province_code` (`province_code`),
  ADD KEY `idx_municipality_code` (`municipality_code`),
  ADD KEY `idx_barangay_code` (`barangay_code`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_session_id` (`session_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cart_id` (`cart_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_parent_id` (`parent_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_message_id` (`parent_message_id`),
  ADD KEY `idx_sender` (`sender_id`,`sender_type`),
  ADD KEY `idx_receiver` (`receiver_id`,`receiver_type`),
  ADD KEY `idx_is_read` (`is_read`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `shipping_address_id` (`shipping_address_id`),
  ADD KEY `billing_address_id` (`billing_address_id`),
  ADD KEY `idx_order_number` (`order_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_seller_id` (`seller_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_seller_id` (`seller_id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_sku` (`sku`);

--
-- Indexes for table `sellers`
--
ALTER TABLE `sellers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_verification_status` (`verification_status`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_seller_id` (`seller_id`),
  ADD KEY `idx_admin_id` (`admin_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `sellers`
--
ALTER TABLE `sellers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `addresses_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`parent_message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
