// quantity.js – Manages product quantity changes and cart updates

import { updateBasketCounter } from './basket.js';

export function initializeQuantitySelectors() {
    const quantitySelectors = document.querySelectorAll('.quantity-selector');
    
    quantitySelectors.forEach(selector => {
        const decrementBtn = selector.querySelector('.quantity-decrease'); // Fixed class name
        const incrementBtn = selector.querySelector('.quantity-increase');   // Fixed class name
        const quantityInput = selector.querySelector('.quantity-input');     // More specific selector
        
        if (decrementBtn && incrementBtn && quantityInput) {
            decrementBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantityInput.value);
                const minValue = parseInt(quantityInput.getAttribute('min')) || 1;
                
                if (currentValue > minValue) {
                    quantityInput.value = currentValue - 1;
                    updateCartItemQuantity(selector);
                }
            });
            
            incrementBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantityInput.value);
                const maxValue = parseInt(quantityInput.getAttribute('max')) || Infinity;
                
                if (currentValue < maxValue) {
                    quantityInput.value = currentValue + 1;
                    updateCartItemQuantity(selector);
                }
            });
            
            quantityInput.addEventListener('change', function() {
                const minValue = parseInt(this.getAttribute('min')) || 1;
                const maxValue = parseInt(this.getAttribute('max')) || Infinity;
                let value = parseInt(this.value);
                
                if (isNaN(value) || value < minValue) {
                    this.value = minValue;
                } else if (value > maxValue) {
                    this.value = maxValue;
                }
                
                updateCartItemQuantity(selector);
            });
            
            // Prevent typing non-numeric characters
            quantityInput.addEventListener('keypress', function(e) {
                // Allow: backspace, delete, tab, escape, enter
                if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)) {
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        }
    });
}

export function updateCartItemQuantity(selector) {
    const productId = selector.getAttribute('data-product-id');
    const quantityInput = selector.querySelector('input');
    const newQuantity = parseInt(quantityInput.value);

    // Update basket in localStorage
    let basket = JSON.parse(localStorage.getItem('basket')) || [];
    const productIndex = basket.findIndex(item => item.id == productId); // Match ID

    if (productIndex > -1) {
        basket[productIndex].quantity = newQuantity;
        localStorage.setItem('basket', JSON.stringify(basket)); // ✅ Corrected

        // Update subtotal display
        const subtotalElement = selector.closest('.cart-item')?.querySelector('.subtotal');
        if (subtotalElement) {
            const price = parseFloat(selector.getAttribute('data-price'));
            subtotalElement.textContent = '₱' + (price * newQuantity).toFixed(2);
        }

        // Update cart total and badge
        updateCartTotal();
        updateBasketCounter(); // ✅ So badge is updated too
    }
}
export function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('basket')) || [];
    const cartTotalElement = document.getElementById('cart-total');
    
    if (cartTotalElement) {
        // In a real application, you would fetch prices from the server
        // This is just a simplified example
        let total = 0;
        
        cart.forEach(item => {
            const priceElement = document.querySelector(`.quantity-selector[data-product-id="${item.id}"]`);
            if (priceElement) {
                const price = parseFloat(priceElement.getAttribute('data-price'));
                total += price * item.quantity;
            }
        });
        
        cartTotalElement.textContent = '₱' + total.toFixed(2);
    }
}