// main.js - Entry point for "From Sagnay to Every Home" e-commerce platform

import { initializeSearch, initializeProductSearch } from '../ui/search.js';
import { initializeAddToBasket, updateBasketCounter } from '../cart/basket.js';
import { initializeQuantitySelectors } from '../cart/quantity.js';
import { loadFeaturedProducts } from '../products/featured-products.js';
import { initializeLocationMap } from '../ui/map.js';
import { initializeLGUValidation } from '../validation/lgu-validate.js';
import { initializeProducerVerification } from '../validation/producer-verification.js';
import { initializeAccountForms } from '../auth/account.js';
import { trackPerformance } from './performance.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    initializeSearch();
    
    // Initialize components
    initializeAddToBasket();
    initializeQuantitySelectors();
    initializeProductSearch();
    initializeLocationMap();
    initializeLGUValidation();
    initializeProducerVerification();
    trackPerformance();
    
    // Sample data for demonstration
    loadFeaturedProducts();
    
    // Initialize basket badge
    updateBasketCounter();

    // Ensure basket badge is visible
    const basketBadges = document.querySelectorAll('.basket-badge');
    basketBadges.forEach(badge => {
        // Make sure the badge is visible
        badge.style.display = 'flex';
    });
});

// Support login/register pages
if (document.getElementById('login-form') || document.getElementById('register-form')) {
    initializeAccountForms();
}

// Ensure badge remains visible post-load
setTimeout(function() {
    const basketBadges = document.querySelectorAll('.basket-badge');
    basketBadges.forEach(badge => {
        // Force badge to be visible
        badge.style.display = 'flex';
    });
}, 500); 
