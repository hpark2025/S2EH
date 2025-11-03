import { NavLink } from 'react-router-dom'
import { useUnreadMessages } from '../../hooks/useUnreadMessages.js'

export default function SellerSidebar({ collapsed = false }) {
  const { unreadCount } = useUnreadMessages()
  return (
    <nav className={`seller-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <i className="bi bi-shop"></i>
          <span>S2EH</span>
        </div>
        <div className="sidebar-title">SELLER PORTAL</div>
      </div>
      
      <div className="sidebar-nav">
        <div className="nav-item">
          <NavLink 
            to="/seller/dashboard" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/seller/products" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-box"></i>
            <span>Products</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/seller/orders" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-cart3"></i>
            <span>Orders</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/seller/inventory" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-boxes"></i>
            <span>Inventory</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/seller/customers" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-people"></i>
            <span>Customers</span>
          </NavLink>
        </div>
        
        <div className="nav-item" style={{ position: 'relative' }}>
          <NavLink 
            to="/seller/messages" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-chat-dots"></i>
            <span>Messages</span>
            {unreadCount > 0 && (
              <span 
                className="badge bg-danger position-absolute"
                style={{
                  top: '8px',
                  right: collapsed ? '8px' : '20px',
                  borderRadius: '50%',
                  minWidth: '20px',
                  height: '20px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                  zIndex: 10
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/seller/analytics" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-graph-up"></i>
            <span>Analytics</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/seller/profile" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-person-circle"></i>
            <span>Profile</span>
          </NavLink>
        </div>
      </div>
      
      <style>{`
        .seller-sidebar {
          width: 280px;
          background: linear-gradient(135deg, #2e7d32 0%, #388e3c 100%);
          color: white;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          z-index: 1000;
          transition: all 0.3s ease;
          overflow-y: auto;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }
        
        .seller-sidebar.collapsed {
          width: 70px;
        }
        
        .sidebar-header {
          padding: 30px 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.1);
        }
        
        .sidebar-logo {
          font-size: 28px;
          font-weight: bold;
          color: white;
          margin-bottom: 8px;
          letter-spacing: 2px;
        }
        
        .sidebar-title {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          letter-spacing: 1.5px;
        }
        
        .collapsed .sidebar-title {
          display: none;
        }
        
        .sidebar-nav {
          padding: 20px 0;
        }
        
        .nav-item {
          margin-bottom: 2px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 15px 25px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-left-color: rgba(255, 255, 255, 0.5);
          padding-left: 30px;
        }
        
        .nav-link.active {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-left-color: white;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        .nav-link i {
          font-size: 18px;
          margin-right: 15px;
          width: 20px;
          text-align: center;
          opacity: 0.9;
        }
        
        .nav-link span {
          flex: 1;
          white-space: nowrap;
          transition: opacity 0.3s ease;
        }
        
        .collapsed .nav-link span {
          opacity: 0;
          pointer-events: none;
        }
        
        .collapsed .nav-link {
          padding: 15px 20px;
          justify-content: center;
        }
        
        .collapsed .nav-link i {
          margin-right: 0;
          font-size: 20px;
        }
        
        /* Custom scrollbar */
        .seller-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        
        .seller-sidebar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .seller-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .seller-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </nav>
  )
}