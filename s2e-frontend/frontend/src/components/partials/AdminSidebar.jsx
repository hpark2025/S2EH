import { NavLink } from 'react-router-dom'

export default function AdminSidebar({ collapsed = false }) {
  return (
    <nav className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">S2EH</div>
        <div className="title">ADMIN PANEL</div>
      </div>
      
      <div className="sidebar-nav">
        <div className="nav-item">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-box"></i>
            <span>Products</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-cart3"></i>
            <span>Orders</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-people"></i>
            <span>Users</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/admin/producers" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-person-badge"></i>
            <span>Producers</span>
          </NavLink>
        </div>
        
        <div className="nav-item">
          <NavLink 
            to="/admin/messages" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <i className="bi bi-chat-dots"></i>
            <span>Messages</span>
          </NavLink>
        </div>
      </div>
      
      <style>{`
        /* Admin Sidebar Styles - Based on existing admin-styles.css */
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 250px;
          background-color: #1a1d29;
          z-index: 1000;
          transition: all 0.3s ease;
          box-shadow: 0 0 35px 0 rgba(154, 161, 171, 0.15);
          overflow-y: auto;
        }
        
        .admin-sidebar.collapsed {
          width: 70px;
        }
        
        .sidebar-header {
          padding: 20px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        
        .sidebar-header .logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          background: linear-gradient(135deg, #2c853f, #4caf50);
        }
        
        .sidebar-header .title {
          color: white;
          font-weight: 600;
          font-size: 12px;
          white-space: nowrap;
          transition: opacity 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .admin-sidebar.collapsed .sidebar-header .title {
          opacity: 0;
        }
        
        .sidebar-nav {
          padding: 20px 0;
        }
        
        .nav-item {
          margin-bottom: 5px;
        }
        
        .nav-link {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          color: #8b92b2;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          margin: 5px 10px;
          border-radius: 8px;
        }
        
        .nav-link:hover {
          background-color: rgba(44, 133, 63, 0.15);
          color: #f8f9fa;
        }
        
        .nav-link.active {
          background-color: #2c853f;
          color: #ffffff;
          font-weight: 600;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          position: relative;
          animation: pulseIndicator 2s ease-in-out infinite alternate;
        }
        
        .nav-link.active::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background-color: #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          animation: pulseIndicator 2s ease-in-out infinite alternate;
        }
        
        .nav-link.active i {
          color: #ffffff;
        }
        
        @keyframes pulseIndicator {
          from {
            opacity: 0.7;
          }
          to {
            opacity: 1;
            box-shadow: 0 0 5px #2c853f;
          }
        }
        
        .nav-link i {
          width: 20px;
          font-size: 16px;
          margin-right: 12px;
          text-align: center;
        }
        
        .nav-link span {
          white-space: nowrap;
          transition: opacity 0.3s ease;
        }
        
        .admin-sidebar.collapsed .nav-link span {
          opacity: 0;
        }
        
        .admin-sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 12px;
        }
        
        .admin-sidebar.collapsed .nav-link i {
          margin-right: 0;
        }
        
        /* Custom scrollbar */
        .admin-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        
        .admin-sidebar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .admin-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        
        .admin-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          
          .admin-sidebar.show {
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  )
}