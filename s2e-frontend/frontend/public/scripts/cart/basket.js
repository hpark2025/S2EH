// basket.js – Handles basket/cart functionality

import { showNotification } from '../ui/notifications.js';
import { updateCartTotal } from './quantity.js';

// Initialize basket when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // For testing - add some items to basket if empty
    let basket = JSON.parse(localStorage.getItem('basket')) || [];
    if (basket.length === 0) {
        // Add test items to make badge visible for testing
        basket = [
            { id: '1', quantity: 2 },
            { id: '2', quantity: 1 }
        ];
        localStorage.setItem('basket', JSON.stringify(basket));
    }
    
    updateBasketCounter();
    initializeAddToBasket();
});

// Attach event listeners to "Add to Basket" buttons
export function initializeAddToBasket() {
    // Remove existing listeners to avoid duplicates
    const existingButtons = document.querySelectorAll('.add-to-cart, .add-to-basket');
    existingButtons.forEach(button => {
        button.removeEventListener('click', handleAddToBasket);
    });

    // Use event delegation for better performance and dynamic content support
    document.removeEventListener('click', handleAddToBasketDelegated);
    document.addEventListener('click', handleAddToBasketDelegated);
}

// Event handler for delegated clicks
function handleAddToBasketDelegated(event) {
    if (event.target.matches('.add-to-cart, .add-to-basket')) {
        const productId = event.target.getAttribute('data-product-id');
        if (productId) {
            addToBasket(productId, 1);
            // Show confirmation message
            showNotification('Product added to basket successfully!', 'success');
        }
    }
}

// Individual button handler (kept for backwards compatibility)
function handleAddToBasket() {
    const productId = this.getAttribute('data-product-id');
    if (productId) {
        addToBasket(productId, 1);
        // Show confirmation message
        showNotification('Product added to basket successfully!', 'success');
    }
}

// Add product to basket in localStorage
export function addToBasket(productId, quantity) {
    let basket = JSON.parse(localStorage.getItem('basket')) || [];
    
    const existingProductIndex = basket.findIndex(item => item.id === productId);
    
    if (existingProductIndex > -1) {
        basket[existingProductIndex].quantity += quantity;
    } else {
        basket.push({ id: productId, quantity });
    }
    
    localStorage.setItem('basket', JSON.stringify(basket));

    updateBasketCounter();  // Refresh badge
    updateCartTotal?.();    // Optional: update cart total if on cart page
}

// Update basket badge count
export function updateBasketCounter() {
    const basket = JSON.parse(localStorage.getItem('basket')) || [];
    const totalItems = basket.reduce((total, item) => total + item.quantity, 0);
    const basketWrapper = document.querySelector('.basket-wrapper');
  
    if (!basketWrapper) return;

    let badge = basketWrapper.querySelector('.basket-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.classList.add('basket-badge');
        basketWrapper.appendChild(badge);
    }

    badge.textContent = totalItems;

    // Override display for visibility - use !important since CSS might conflict
    if (totalItems > 0) {
        badge.style.display = 'flex';
        badge.style.visibility = 'visible';
    } else {
        badge.style.display = 'none';
    }
}