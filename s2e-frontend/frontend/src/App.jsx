import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import RoleSelectionPage from './pages/RoleSelectionPage.jsx'
import AdminLayout from './layout/AdminLayout.jsx'
import UserLayout from './layout/UserLayout.jsx'
import UserAuthLayout from './layout/UserAuthLayout.jsx'
import SellerLayout from './layout/SellerLayout.jsx'
import SellerLoginPage from './pages/Seller/SellerLoginPage.jsx'
import SellerRegisterPage from './pages/Seller/SellerRegisterPage.jsx'
import SellerForgotPasswordPage from './pages/Seller/SellerForgotPasswordPage.jsx'
import SellerDashboardPage from './pages/Seller/SellerDashboardPage.jsx'
import SellerProductsPage from './pages/Seller/SellerProductsPage.jsx'
import SellerOrdersPage from './pages/Seller/SellerOrdersPage.jsx'
import SellerInventoryPage from './pages/Seller/SellerInventoryPage.jsx'
import SellerCustomersPage from './pages/Seller/SellerCustomersPage.jsx'
import SellerMessagesPage from './pages/Seller/SellerMessagesPage.jsx'
import SellerAnalyticsPage from './pages/Seller/SellerAnalyticsPage.jsx'
import SellerProfilePage from './pages/Seller/SellerProfilePage.jsx'
import AdminDashboardPage from './pages/Admin/AdminDashboardPage.jsx'
import UserHomePage from './pages/User/UserHomePage.jsx'
import UserProductsPage from './pages/User/UserProductsPage.jsx'
import UserCartPage from './pages/User/UserCartPage.jsx'
import UserProductDetailsPage from './pages/User/UserProductDetailsPage.jsx'
import UserLoginPage from './pages/User/UserLoginPage.jsx'
import UserRegisterPage from './pages/User/UserRegisterPage.jsx'
import UserResetPage from './pages/User/UserResetPage.jsx'
import UserAccountLayout from './layout/UserAccountLayout.jsx'
import UserAccountProfilePage from './pages/User/UserAccountProfilePage.jsx'
import UserAccountOrdersPage from './pages/User/UserAccountOrdersPage.jsx'
import UserAccountSettingsPage from './pages/User/UserAccountSettingsPage.jsx'
import UserAccountSecurityPage from './pages/User/UserAccountSecurityPage.jsx'
import AdminProductsPage from './pages/Admin/AdminProductsPage.jsx'
import AdminOrdersPage from './pages/Admin/AdminOrdersPage.jsx'
import AdminUsersPage from './pages/Admin/AdminUsersPage.jsx'
import AdminProducersPage from './pages/Admin/AdminProducersPage.jsx'
import UserSellerProfilePage from './pages/User/UserSellerProfilePage.jsx'
import UserChatPage from './pages/User/UserChatPage.jsx'
import UserCheckoutPage from './pages/User/UserCheckoutPage.jsx'
import AdminMessagesPage from './pages/Admin/AdminMessagesPage.jsx'
import AdminLoginPage from './pages/Admin/AdminLoginPage.jsx'

function App() {
  return (
    <AppProvider>
      <CartProvider>
        <div style={{ margin: 0, padding: 0, width: '100%', height: '100%' }}>
          <HashRouter>
        <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<RoleSelectionPage />} />
        
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="/user/home" replace />} />
          <Route path="home" element={<UserHomePage />} />
          <Route path="products" element={<UserProductsPage />} />
          <Route path="products/:id" element={<UserProductDetailsPage />} />
          <Route path="seller/:id" element={<UserSellerProfilePage />} />
          <Route path="cart" element={<UserCartPage />} />
          <Route path="checkout" element={<UserCheckoutPage />} />
        </Route>  
        
        {/* Backward compatibility - redirect old routes to new structure */}
        <Route path="/home" element={<Navigate to="/user/home" replace />} />
        <Route path="/products" element={<Navigate to="/user/products" replace />} />
        
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/register" element={<UserRegisterPage />} />
        <Route path="/reset" element={<UserResetPage />} />
        
        {/* Seller Authentication Routes */}
        <Route path="/seller/login" element={<SellerLoginPage />} />
        <Route path="/seller/register" element={<SellerRegisterPage />} />
        <Route path="/seller/forgot-password" element={<SellerForgotPasswordPage />} />
        
        {/* Admin Authentication Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        <Route path="/auth" element={<UserAuthLayout />}>
          <Route index element={<Navigate to="/auth/home" replace />} />
          <Route path="home" element={<UserHomePage />} />
          <Route path="products" element={<UserProductsPage />} />
          <Route path="products/:id" element={<UserProductDetailsPage />} />
          <Route path="seller/:id" element={<UserSellerProfilePage />} />
          <Route path="chat" element={<UserChatPage />} />
          <Route path="cart" element={<UserCartPage />} />
          <Route path="checkout" element={<UserCheckoutPage />} />
          <Route path="account" element={<UserAccountLayout />}>
            <Route path="profile" element={<UserAccountProfilePage />} />
            <Route path="orders" element={<UserAccountOrdersPage />} />
            <Route path="settings" element={<UserAccountSettingsPage />} />
            <Route path="security" element={<UserAccountSecurityPage />} />
          </Route>
        </Route>
        
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboardPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="inventory" element={<SellerInventoryPage />} />
          <Route path="customers" element={<SellerCustomersPage />} />
          <Route path="messages" element={<SellerMessagesPage />} />
          <Route path="analytics" element={<SellerAnalyticsPage />} />
          <Route path="profile" element={<SellerProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="producers" element={<AdminProducersPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
        </div>
      </CartProvider>
    </AppProvider>
  )
}

export default App
  