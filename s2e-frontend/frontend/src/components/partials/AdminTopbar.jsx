import { useState } from 'react'

export default function AdminTopbar({ 
  pageTitle = "Dashboard", 
  onToggleSidebar, 
  onLogout
}) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <>
      <header className="admin-topbar">
        <div className="topbar-left">
          <button className="sidebar-toggle" onClick={onToggleSidebar}>
            <i className="bi bi-list"></i>
          </button>
          <h1 className="page-title">{pageTitle}</h1>
        </div>
        
        <div className="topbar-right">
          <div className="admin-profile" onClick={handleProfileClick}>
            <div className="admin-avatar">A</div>
            <span>Admin User</span>
            <i className="bi bi-chevron-down"></i>
            
            {showProfileDropdown && (
              <div className="admin-dropdown show">
                <div className="dropdown-header">
                  <div className="user-name">Admin User</div>
                  <div className="user-role">Administrator</div>
                </div>
                <div className="dropdown-menu-items">
                  <button className="dropdown-item danger" onClick={handleLogoutClick}>
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <style>{`
        /* Admin Topbar Styles - Based on existing admin-styles.css */
        .admin-topbar {
          background-color: #ffffff;
          padding: 15px 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 999;
        }
        
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 18px;
          color: #212529;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        
        .sidebar-toggle:hover {
          background-color: #f8f9fa;
        }
        
        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: #212529;
          margin: 0;
        }
        
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .admin-profile {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        
        .admin-profile:hover {
          background-color: #f8f9fa;
        }
        
        .admin-avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background-color: #2c853f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }
        
        .admin-profile span {
          font-weight: 500;
          color: #212529;
        }
        
        .admin-profile i {
          color: #6c757d;
          font-size: 12px;
          transition: transform 0.3s ease;
        }
        
        /* Admin Dropdown Menu */
        .admin-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e3e6f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 200px;
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          margin-top: 8px;
        }
        
        .admin-dropdown.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .admin-dropdown::before {
          content: '';
          position: absolute;
          top: -6px;
          right: 15px;
          width: 12px;
          height: 12px;
          background: white;
          border: 1px solid #e3e6f0;
          border-bottom: none;
          border-right: none;
          transform: rotate(45deg);
        }
        
        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid #e3e6f0;
          background-color: #f8f9fa;
          border-radius: 8px 8px 0 0;
        }
        
        .dropdown-header .user-name {
          font-weight: 600;
          color: #212529;
          font-size: 14px;
        }
        
        .dropdown-header .user-role {
          font-size: 12px;
          color: #6c757d;
        }
        
        .dropdown-menu-items {
          padding: 8px 0;
        }
        
        .dropdown-item {
          display: block;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          text-align: left;
          text-decoration: none;
          color: #212529;
          font-size: 14px;
          transition: background-color 0.2s ease;
          cursor: pointer;
        }
        
        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: #212529;
        }
        
        .dropdown-item i {
          margin-right: 8px;
          width: 16px;
          text-align: center;
        }
        
        .dropdown-item.danger {
          color: #e44c31;
        }
        
        .dropdown-item.danger:hover {
          background-color: rgba(228, 76, 49, 0.1);
          color: #e44c31;
        }
        
        /* Close dropdown when clicking outside */
        @media (max-width: 768px) {
          .admin-topbar {
            padding: 12px 15px;
          }
          
          .page-title {
            font-size: 20px;
          }
          
          .admin-profile span {
            display: none;
          }
          
          .topbar-right {
            gap: 10px;
          }
        }
      `}</style>
    </>
  )
}