// Admin Dashboard JavaScript
function initAdminLegacy() {
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Only initialize if admin sidebar exists
    if (!sidebar) {
        return;
    }
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Save sidebar state to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
        
        // Restore sidebar state from localStorage
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
        }
    }
    
    // Mobile sidebar toggle
    function initMobileSidebar() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        
        function handleMobileView(e) {
            if (!sidebar) return;
            if (e.matches) {
                // Mobile view
                sidebar.classList.remove('collapsed');
                sidebar.classList.add('mobile');
                
                // Close sidebar when clicking outside
                document.addEventListener('click', function(event) {
                    if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                        sidebar.classList.remove('show');
                    }
                });
                
                // Toggle for mobile
                sidebarToggle.addEventListener('click', function() {
                    sidebar.classList.toggle('show');
                });
            } else {
                // Desktop view
                sidebar.classList.remove('mobile', 'show');
            }
        }
        
        mediaQuery.addListener(handleMobileView);
        handleMobileView(mediaQuery);
    }
    
    initMobileSidebar();
    
    // Active navigation highlighting
    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            // Check if href matches current page (handle both relative paths and # for current page)
            if (href === '#' || href === currentPage || href.endsWith('/' + currentPage)) {
                link.classList.add('active');
            }
        });
    }
    
    setActiveNavItem();
    
    // Table row hover effects and click handlers
    const tableRows = document.querySelectorAll('.admin-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                // Handle row click (e.g., navigate to detail page)
                console.log('Row clicked:', this);
            }
        });
    });
    
    // Button click handlers
    document.addEventListener('click', function(e) {
        // View button handler
        if (e.target.closest('.btn-admin-outline')) {
            const button = e.target.closest('.btn-admin-outline');
            if (button.textContent.trim().includes('View')) {
                const row = button.closest('tr');
                const orderId = row.querySelector('td:first-child').textContent;
                console.log('View order:', orderId);
                // Navigate to order detail page
                // window.location.href = `order-detail.html?id=${orderId}`;
            }
        }
        
        // Approve button handler
        if (e.target.closest('.btn-admin-primary')) {
            const button = e.target.closest('.btn-admin-primary');
            if (button.textContent.trim().includes('Approve')) {
                const row = button.closest('tr');
                const producerName = row.querySelector('td:first-child').textContent;
                
                if (confirm(`Are you sure you want to approve ${producerName}?`)) {
                    // Add loading state
                    button.innerHTML = '<div class="spinner"></div> Approving...';
                    button.disabled = true;
                    
                    // Simulate API call
                    setTimeout(() => {
                        showNotification('Producer approved successfully!', 'success');
                        row.remove();
                    }, 1500);
                }
            }
        }
        
        // Reject button handler
        if (e.target.closest('.btn-admin-danger')) {
            const button = e.target.closest('.btn-admin-danger');
            if (button.textContent.trim().includes('Reject')) {
                const row = button.closest('tr');
                const producerName = row.querySelector('td:first-child').textContent;
                
                if (confirm(`Are you sure you want to reject ${producerName}?`)) {
                    // Add loading state
                    button.innerHTML = '<div class="spinner"></div> Rejecting...';
                    button.disabled = true;
                    
                    // Simulate API call
                    setTimeout(() => {
                        showNotification('Producer rejected.', 'error');
                        row.remove();
                    }, 1500);
                }
            }
        }
    });
    
    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
            </div>
        `;
        
        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 2000;
                    max-width: 300px;
                    padding: 15px;
                    background-color: #fff;
                    border-radius: 4px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    transform: translateX(100%);
                    animation: slideIn 0.3s ease forwards;
                }
                .notification.success {
                    border-left: 4px solid var(--primary-color);
                }
                .notification.error {
                    border-left: 4px solid var(--highlight-color);
                }
                .notification.info {
                    border-left: 4px solid var(--accent-color);
                }
                @keyframes slideIn {
                    to {
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Stats animation on page load
    function animateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        
        statValues.forEach(stat => {
            const finalValue = stat.textContent;
            const isNumeric = /^\d+$/.test(finalValue.replace(/[₱,]/g, ''));
            
            if (isNumeric) {
                const numericValue = parseInt(finalValue.replace(/[₱,]/g, ''));
                const currency = finalValue.includes('₱') ? '₱' : '';
                let currentValue = 0;
                const increment = numericValue / 50;
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        currentValue = numericValue;
                        clearInterval(timer);
                    }
                    stat.textContent = currency + Math.floor(currentValue).toLocaleString();
                }, 30);
            }
        });
    }
    
    // Run stats animation after a short delay
    setTimeout(animateStats, 500);
    
    // Search functionality (can be expanded)
    function initSearch() {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const table = this.closest('.admin-card').querySelector('.admin-table tbody');
                
                if (table) {
                    const rows = table.querySelectorAll('tr');
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.includes(searchTerm) ? '' : 'none';
                    });
                }
            });
        });
    }
    
    initSearch();
    
    // Auto-refresh data every 5 minutes
    function autoRefresh() {
        setInterval(() => {
            // Only refresh if user is still active
            if (document.visibilityState === 'visible') {
                console.log('Auto-refreshing dashboard data...');
                // Add your data refresh logic here
                // refreshDashboardData();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    autoRefresh();
    
    // Form validation helpers
    window.validateForm = function(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        return isValid;
    };
    
    // Export data functionality
    window.exportData = function(type, data) {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${type}_export_${timestamp}.csv`;
        
        // Convert data to CSV format
        let csv = '';
        if (data && data.length > 0) {
            // Header row
            csv += Object.keys(data[0]).join(',') + '\n';
            // Data rows
            data.forEach(row => {
                csv += Object.values(row).map(value => `"${value}"`).join(',') + '\n';
            });
        }
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        
        showNotification(`${type} data exported successfully!`, 'success');
    };
    
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);
        showNotification('An error occurred. Please refresh the page.', 'error');
    });
    
    // Admin profile dropdown functionality
    function initAdminProfileDropdown() {
        const adminProfile = document.querySelector('.admin-profile');
        const dropdown = document.querySelector('.admin-dropdown');
        
        if (adminProfile && dropdown) {
            adminProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                dropdown.classList.remove('show');
            });
            
            // Prevent dropdown from closing when clicking inside it
            dropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
        
        // Logout functionality
        const logoutBtn = document.querySelector('#adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    // Clear session data
                    sessionStorage.clear();
                    localStorage.removeItem('adminLoggedIn');
                    
                    // Show logout message
                    showNotification('Logged out successfully!', 'success');
                    
                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = '../auth/login.html';
                    }, 1000);
                }
            });
        }
    }
    
    initAdminProfileDropdown();
    
    // Check authentication on page load
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
        if (isLoggedIn !== 'true') {
            // Redirect to login if not authenticated
            window.location.href = '../auth/login.html';
        }
    }
    
    // Only check auth if not on login page
    if (!window.location.pathname.includes('login.html')) {
        checkAuthentication();
    }
    
    // Page load complete
    console.log('Admin dashboard loaded successfully');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminLegacy);
} else {
    initAdminLegacy();
}
