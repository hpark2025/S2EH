// Seller Dashboard Main JavaScript - From Sagnay to Every Home

document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle
    initializeSidebarToggle();
    
    // Initialize notification system
    initializeNotifications();
    
    // Initialize responsive behavior
    initializeResponsiveBehavior();
    
    // Initialize tooltips and popovers
    initializeTooltips();
    
    // Initialize charts (if Chart.js is loaded)
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
    
    // Initialize data tables (if DataTables is loaded)
    if (typeof $.fn.DataTable !== 'undefined') {
        initializeDataTables();
    }
});

// Sidebar Toggle Functionality
function initializeSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.seller-main');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            
            // For mobile, add overlay
            if (window.innerWidth <= 768) {
                toggleSidebarOverlay();
            }
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                    removeSidebarOverlay();
                }
            }
        });
    }
}

// Sidebar Overlay for Mobile
function toggleSidebarOverlay() {
    let overlay = document.querySelector('.sidebar-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 999;
            backdrop-filter: blur(2px);
        `;
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            document.getElementById('sidebar').classList.remove('show');
            removeSidebarOverlay();
        });
    }
}

function removeSidebarOverlay() {
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Notification System
function initializeNotifications() {
    // Mock notification data - replace with real data from backend
    const notifications = [
        { type: 'order', message: 'New order received from Juan Santos', time: '2 minutes ago' },
        { type: 'product', message: 'Rice stock running low (5 remaining)', time: '1 hour ago' },
        { type: 'message', message: 'New message from customer Maria Lopez', time: '3 hours ago' }
    ];
    
    updateNotificationBadge(notifications.length);
    
    // Add click handler for notification icon
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            showNotificationDropdown(notifications);
        });
    }
}

function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function showNotificationDropdown(notifications) {
    // Create notification dropdown if it doesn't exist
    let dropdown = document.querySelector('.notification-dropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            width: 320px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 1000;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        const notificationIcon = document.querySelector('.notification-icon');
        notificationIcon.style.position = 'relative';
        notificationIcon.appendChild(dropdown);
    }
    
    // Populate dropdown
    dropdown.innerHTML = `
        <div style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0;">
            <h6 style="margin: 0; font-weight: 600;">Notifications</h6>
        </div>
        ${notifications.map(notification => `
            <div style="padding: 15px 20px; border-bottom: 1px solid #f5f5f5; cursor: pointer;" 
                 onmouseover="this.style.backgroundColor='#f5f5f5'" 
                 onmouseout="this.style.backgroundColor='white'">
                <div style="font-weight: 500; margin-bottom: 5px;">${notification.message}</div>
                <div style="font-size: 12px; color: #757575;">${notification.time}</div>
            </div>
        `).join('')}
        <div style="padding: 15px 20px; text-align: center;">
            <a href="../messages/messages.html" style="color: #2E7D32; text-decoration: none; font-weight: 500;">
                View All Notifications
            </a>
        </div>
    `;
    
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && !document.querySelector('.notification-icon').contains(e.target)) {
            dropdown.style.display = 'none';
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Responsive Behavior
function initializeResponsiveBehavior() {
    window.addEventListener('resize', function() {
        const sidebar = document.getElementById('sidebar');
        
        if (window.innerWidth > 768) {
            sidebar.classList.remove('show');
            removeSidebarOverlay();
        }
    });
}

// Tooltips
function initializeTooltips() {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Charts Initialization
function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales (₱)',
                    data: [12000, 15000, 18000, 22000, 19000, 25000],
                    borderColor: '#2E7D32',
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₱' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Orders Chart
    const ordersCtx = document.getElementById('ordersChart');
    if (ordersCtx) {
        new Chart(ordersCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'Cancelled'],
                datasets: [{
                    data: [75, 20, 5],
                    backgroundColor: ['#4CAF50', '#FF9800', '#F44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// DataTables Initialization
function initializeDataTables() {
    // Initialize all tables with class 'data-table'
    $('.data-table').each(function() {
        $(this).DataTable({
            responsive: true,
            pageLength: 10,
            language: {
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            },
            dom: "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                 "<'row'<'col-sm-12'tr>>" +
                 "<'row'<'col-sm-5'i><'col-sm-7'p>>",
            order: [[0, 'desc']]
        });
    });
}

// Utility Functions
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showInfoMessage(message) {
    showMessage(message, 'info');
}

function showMessage(message, type = 'info') {
    // Create or get existing message container
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        messageContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(messageContainer);
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `alert alert-${type} alert-dismissible fade show`;
    messageEl.style.cssText = `
        margin-bottom: 10px;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const bgColors = {
        success: '#d4edda',
        error: '#f8d7da',
        info: '#d1ecf1',
        warning: '#fff3cd'
    };
    
    const textColors = {
        success: '#155724',
        error: '#721c24',
        info: '#0c5460',
        warning: '#856404'
    };
    
    messageEl.style.backgroundColor = bgColors[type] || bgColors.info;
    messageEl.style.color = textColors[type] || textColors.info;
    messageEl.style.border = `1px solid ${textColors[type] || textColors.info}`;
    
    messageEl.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" 
                style="background: none; border: none; font-size: 20px; cursor: pointer; float: right;">×</button>
    `;
    
    messageContainer.appendChild(messageEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Format currency
function formatCurrency(amount) {
    return '₱' + Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Confirm action
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Export functions for use in HTML
window.sellerDashboard = {
    showSuccessMessage,
    showErrorMessage,
    showInfoMessage,
    formatCurrency,
    formatDate,
    confirmAction
};
