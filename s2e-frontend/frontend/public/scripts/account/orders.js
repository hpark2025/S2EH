/**
 * Orders page functionality
 * Handles order display, filtering, status updates, and tracking
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sample orders data
    const ordersData = [
        {
            id: 'ORD-2025-001',
            date: '2025-01-10',
            status: 'delivered',
            total: 450.00,
            items: [
                {
                    id: 1,
                    name: 'Pili Nuts (250g)',
                    price: 180.00,
                    quantity: 2,
                    image: '../../../images/unknown.jpg',
                    seller: 'Maria\'s Farm'
                },
                {
                    id: 2,
                    name: 'Coconut Vinegar',
                    price: 95.00,
                    quantity: 1,
                    image: '../../../images/unknown.jpg',
                    seller: 'Bicol Essentials'
                }
            ],
            shipping: {
                address: '123 Main Street, Barangay Centro, Sagnay, Camarines Sur',
                method: 'Standard Delivery',
                fee: 50.00
            },
            timeline: [
                { status: 'Order Placed', date: '2025-01-10 10:30 AM', completed: true },
                { status: 'Order Confirmed', date: '2025-01-10 11:15 AM', completed: true },
                { status: 'Being Prepared', date: '2025-01-10 2:00 PM', completed: true },
                { status: 'Shipped', date: '2025-01-11 9:00 AM', completed: true },
                { status: 'Out for Delivery', date: '2025-01-12 8:30 AM', completed: true },
                { status: 'Delivered', date: '2025-01-12 3:45 PM', completed: true }
            ]
        },
        {
            id: 'ORD-2025-002',
            date: '2025-01-08',
            status: 'shipped',
            total: 825.00,
            items: [
                {
                    id: 3,
                    name: 'Handwoven Basket',
                    price: 350.00,
                    quantity: 1,
                    image: '../../../images/unknown.jpg',
                    seller: 'Sagnay Crafts'
                },
                {
                    id: 4,
                    name: 'Abaca Bag',
                    price: 450.00,
                    quantity: 1,
                    image: '../../../images/unknown.jpg',
                    seller: 'Bicol Crafts'
                }
            ],
            shipping: {
                address: '123 Main Street, Barangay Centro, Sagnay, Camarines Sur',
                method: 'Express Delivery',
                fee: 150.00
            },
            timeline: [
                { status: 'Order Placed', date: '2025-01-08 2:15 PM', completed: true },
                { status: 'Order Confirmed', date: '2025-01-08 3:00 PM', completed: true },
                { status: 'Being Prepared', date: '2025-01-08 4:30 PM', completed: true },
                { status: 'Shipped', date: '2025-01-09 10:00 AM', completed: true, active: true },
                { status: 'Out for Delivery', date: 'Expected: Jan 13', completed: false },
                { status: 'Delivered', date: 'Expected: Jan 13', completed: false }
            ]
        },
        {
            id: 'ORD-2025-003',
            date: '2025-01-12',
            status: 'pending',
            total: 320.00,
            items: [
                {
                    id: 5,
                    name: 'Organic Rice (5kg)',
                    price: 320.00,
                    quantity: 1,
                    image: '../../../images/unknown.jpg',
                    seller: 'Santos Family Farm'
                }
            ],
            shipping: {
                address: '123 Main Street, Barangay Centro, Sagnay, Camarines Sur',
                method: 'Standard Delivery',
                fee: 50.00
            },
            timeline: [
                { status: 'Order Placed', date: '2025-01-12 11:20 AM', completed: true, active: true },
                { status: 'Order Confirmed', date: 'Pending confirmation', completed: false },
                { status: 'Being Prepared', date: 'Waiting...', completed: false },
                { status: 'Shipped', date: 'Waiting...', completed: false },
                { status: 'Out for Delivery', date: 'Waiting...', completed: false },
                { status: 'Delivered', date: 'Waiting...', completed: false }
            ]
        }
    ];

    // DOM Elements
    const orderSearch = document.getElementById('orderSearch');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const allOrdersList = document.getElementById('allOrdersList');
    const pendingOrdersList = document.getElementById('pendingOrdersList');
    const shippedOrdersList = document.getElementById('shippedOrdersList');
    const deliveredOrdersList = document.getElementById('deliveredOrdersList');
    const cancelledOrdersList = document.getElementById('cancelledOrdersList');
    const ordersPagination = document.getElementById('ordersPagination');
    
    // Modal elements
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const orderDetailsContent = document.getElementById('orderDetailsContent');
    const cancelOrderModal = document.getElementById('cancelOrderModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    
    let currentPage = 1;
    const itemsPerPage = 5;
    let filteredOrders = [...ordersData];
    let selectedOrderId = null;
    
    // Initialize
    loadOrders();
    setupEventListeners();
    
    function setupEventListeners() {
        orderSearch.addEventListener('input', debounce(filterOrders, 300));
        statusFilter.addEventListener('change', filterOrders);
        dateFilter.addEventListener('change', filterOrders);
        
        // Tab click handlers
        document.querySelectorAll('#ordersTabs button').forEach(tab => {
            tab.addEventListener('click', function() {
                filterOrdersByStatus(this.id.replace('-tab', ''));
            });
        });
        
        confirmCancelBtn.addEventListener('click', cancelOrder);
        trackOrderBtn.addEventListener('click', trackOrder);
    }
    
    function loadOrders() {
        displayOrders(filteredOrders, allOrdersList);
        updateTabCounts();
        updatePagination();
    }
    
    function displayOrders(orders, container) {
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-box-seam text-muted" style="font-size: 3rem;"></i>
                    <h5 class="text-muted mt-3">No orders found</h5>
                    <p class="text-muted">Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }
        
        // Paginate orders
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedOrders = orders.slice(startIndex, endIndex);
        
        container.innerHTML = paginatedOrders.map(order => createOrderCard(order)).join('');
        
        // Add event listeners to order cards
        container.querySelectorAll('.order-card').forEach(card => {
            const orderId = card.dataset.orderId;
            
            card.querySelector('.view-details-btn').addEventListener('click', () => {
                showOrderDetails(orderId);
            });
            
            const cancelBtn = card.querySelector('.cancel-order-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    selectedOrderId = orderId;
                    const modal = new bootstrap.Modal(cancelOrderModal);
                    modal.show();
                });
            }
            
            const reorderBtn = card.querySelector('.reorder-btn');
            if (reorderBtn) {
                reorderBtn.addEventListener('click', () => {
                    reorderItems(orderId);
                });
            }
        });
    }
    
    function createOrderCard(order) {
        const canCancel = ['pending', 'confirmed'].includes(order.status);
        const canReorder = ['delivered', 'cancelled'].includes(order.status);
        
        return `
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">Order ${order.id}</h6>
                            <small class="text-muted">
                                <i class="bi bi-calendar me-1"></i>
                                ${formatDate(order.date)}
                            </small>
                        </div>
                        <div class="text-end">
                            <span class="order-status ${order.status}">${formatStatus(order.status)}</span>
                            <div class="fw-bold text-success mt-1">₱${order.total.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="order-body">
                    <div class="order-items mb-3">
                        ${order.items.map(item => `
                            <div class="order-item d-flex align-items-center">
                                <img src="${item.image}" alt="${item.name}" class="order-item-image me-3">
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">${item.name}</h6>
                                    <p class="text-muted mb-1 small">by ${item.seller}</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="text-muted small">Qty: ${item.quantity}</span>
                                        <span class="fw-bold">₱${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-actions d-flex gap-2 flex-wrap">
                        <button class="btn btn-outline-primary btn-sm view-details-btn">
                            <i class="bi bi-eye me-1"></i>View Details
                        </button>
                        
                        ${canCancel ? `
                            <button class="btn btn-outline-danger btn-sm cancel-order-btn">
                                <i class="bi bi-x-circle me-1"></i>Cancel Order
                            </button>
                        ` : ''}
                        
                        ${canReorder ? `
                            <button class="btn btn-outline-success btn-sm reorder-btn">
                                <i class="bi bi-arrow-repeat me-1"></i>Reorder
                            </button>
                        ` : ''}
                        
                        ${order.status === 'delivered' ? `
                            <button class="btn btn-outline-warning btn-sm" onclick="writeReview('${order.id}')">
                                <i class="bi bi-star me-1"></i>Write Review
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    function showOrderDetails(orderId) {
        const order = ordersData.find(o => o.id === orderId);
        if (!order) return;
        
        orderDetailsContent.innerHTML = `
            <div class="order-details">
                <!-- Order Summary -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6>Order Information</h6>
                        <p class="mb-1"><strong>Order ID:</strong> ${order.id}</p>
                        <p class="mb-1"><strong>Order Date:</strong> ${formatDate(order.date)}</p>
                        <p class="mb-1"><strong>Status:</strong> <span class="order-status ${order.status}">${formatStatus(order.status)}</span></p>
                    </div>
                    <div class="col-md-6">
                        <h6>Shipping Information</h6>
                        <p class="mb-1"><strong>Address:</strong></p>
                        <p class="text-muted small">${order.shipping.address}</p>
                        <p class="mb-1"><strong>Method:</strong> ${order.shipping.method}</p>
                    </div>
                </div>
                
                <!-- Order Items -->
                <div class="mb-4">
                    <h6>Order Items</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Seller</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="${item.image}" alt="${item.name}" width="40" height="40" class="me-2 rounded">
                                                <div>
                                                    <div class="fw-bold small">${item.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><small class="text-muted">${item.seller}</small></td>
                                        <td>${item.quantity}</td>
                                        <td>₱${item.price.toFixed(2)}</td>
                                        <td class="fw-bold">₱${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                                <tr class="border-top">
                                    <td colspan="4" class="text-end"><strong>Shipping Fee:</strong></td>
                                    <td class="fw-bold">₱${order.shipping.fee.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-end"><strong>Total Amount:</strong></td>
                                    <td class="fw-bold text-success">₱${order.total.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Order Timeline -->
                <div class="mb-4">
                    <h6>Order Timeline</h6>
                    <div class="order-timeline">
                        ${order.timeline.map(step => `
                            <div class="timeline-item ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}">
                                <div class="d-flex justify-content-between">
                                    <span class="fw-bold">${step.status}</span>
                                    <small class="text-muted">${step.date}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Update track order button
        trackOrderBtn.setAttribute('data-order-id', orderId);
        
        const modal = new bootstrap.Modal(orderDetailsModal);
        modal.show();
    }
    
    function filterOrders() {
        const searchTerm = orderSearch.value.toLowerCase();
        const statusValue = statusFilter.value;
        const dateValue = parseInt(dateFilter.value);
        
        filteredOrders = ordersData.filter(order => {
            // Text search
            const matchesSearch = !searchTerm || 
                order.id.toLowerCase().includes(searchTerm) ||
                order.items.some(item => 
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.seller.toLowerCase().includes(searchTerm)
                );
            
            // Status filter
            const matchesStatus = !statusValue || order.status === statusValue;
            
            // Date filter
            let matchesDate = true;
            if (dateValue) {
                const orderDate = new Date(order.date);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - dateValue);
                matchesDate = orderDate >= cutoffDate;
            }
            
            return matchesSearch && matchesStatus && matchesDate;
        });
        
        currentPage = 1;
        loadOrders();
    }
    
    function filterOrdersByStatus(status) {
        let targetContainer;
        let targetOrders;
        
        switch(status) {
            case 'all':
                targetContainer = allOrdersList;
                targetOrders = ordersData;
                break;
            case 'pending':
                targetContainer = pendingOrdersList;
                targetOrders = ordersData.filter(order => order.status === 'pending');
                break;
            case 'shipped':
                targetContainer = shippedOrdersList;
                targetOrders = ordersData.filter(order => order.status === 'shipped');
                break;
            case 'delivered':
                targetContainer = deliveredOrdersList;
                targetOrders = ordersData.filter(order => order.status === 'delivered');
                break;
            case 'cancelled':
                targetContainer = cancelledOrdersList;
                targetOrders = ordersData.filter(order => order.status === 'cancelled');
                break;
        }
        
        if (targetContainer) {
            displayOrders(targetOrders, targetContainer);
        }
    }
    
    function updateTabCounts() {
        document.querySelector('#all-tab .badge').textContent = ordersData.length;
        document.querySelector('#pending-tab .badge').textContent = ordersData.filter(o => o.status === 'pending').length;
        document.querySelector('#shipped-tab .badge').textContent = ordersData.filter(o => o.status === 'shipped').length;
        document.querySelector('#delivered-tab .badge').textContent = ordersData.filter(o => o.status === 'delivered').length;
        document.querySelector('#cancelled-tab .badge').textContent = ordersData.filter(o => o.status === 'cancelled').length;
    }
    
    function updatePagination() {
        const totalItems = filteredOrders.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        if (totalPages <= 1) {
            ordersPagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;
        
        ordersPagination.innerHTML = paginationHTML;
        
        // Add event listeners
        ordersPagination.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.dataset.page);
                if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                    currentPage = page;
                    loadOrders();
                }
            });
        });
    }
    
    function cancelOrder() {
        const reason = document.getElementById('cancellationReason').value;
        const comments = document.getElementById('cancellationComments').value;
        
        if (!reason) {
            showNotification('Please select a reason for cancellation', 'error');
            return;
        }
        
        // Show loading
        confirmCancelBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cancelling...';
        confirmCancelBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Update order status
            const orderIndex = ordersData.findIndex(o => o.id === selectedOrderId);
            if (orderIndex !== -1) {
                ordersData[orderIndex].status = 'cancelled';
                ordersData[orderIndex].timeline.push({
                    status: 'Order Cancelled',
                    date: new Date().toLocaleString(),
                    completed: true
                });
            }
            
            // Reset button
            confirmCancelBtn.innerHTML = 'Cancel Order';
            confirmCancelBtn.disabled = false;
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(cancelOrderModal);
            modal.hide();
            
            // Refresh orders
            loadOrders();
            updateTabCounts();
            
            showNotification('Order cancelled successfully', 'success');
        }, 1500);
    }
    
    function trackOrder() {
        const orderId = trackOrderBtn.getAttribute('data-order-id');
        // This would typically redirect to a tracking page
        showNotification(`Tracking order ${orderId}...`, 'info');
    }
    
    function reorderItems(orderId) {
        const order = ordersData.find(o => o.id === orderId);
        if (!order) return;
        
        // Add items to cart
        order.items.forEach(item => {
            // This would typically call the basket.js addToBasket function
            console.log(`Adding ${item.name} to cart`);
        });
        
        showNotification(`${order.items.length} items added to cart`, 'success');
    }
    
    // Global functions
    window.writeReview = function(orderId) {
        // This would redirect to review page or show review modal
        showNotification('Opening review form...', 'info');
    };
    
    window.logout = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userToken');
            sessionStorage.clear();
            window.location.href = '../../../unauth/home.html';
            showNotification('Logged out successfully', 'success');
        }
    };
    
    // Helper functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    function formatStatus(status) {
        const statusMap = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return statusMap[status] || status;
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi ${getNotificationIcon(type)} me-2"></i>
                ${message}
            </div>
            <button class="notification-close">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1050',
            maxWidth: '400px',
            padding: '15px',
            backgroundColor: getNotificationColor(type),
            color: 'white',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    function getNotificationIcon(type) {
        const icons = {
            success: 'bi-check-circle',
            error: 'bi-exclamation-triangle',
            info: 'bi-info-circle',
            warning: 'bi-exclamation-circle'
        };
        return icons[type] || 'bi-info-circle';
    }
    
    function getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        return colors[type] || '#17a2b8';
    }
});
