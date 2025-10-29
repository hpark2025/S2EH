// featured-products.js – Handles loading and displaying featured products

import { initializeAddToBasket } from './basket.js';

export function loadFeaturedProducts() {
    const featuredProductsContainer = document.querySelector('.featured-products .row');
    
    if (featuredProductsContainer) {
        // In a real application, this data would come from an API
        const products = [
            {
                id: 1,
                name: 'Organic Rice',
                seller: 'Juan Dela Cruz',
                price: 150.00,
                image: 'images/product1.jpg'
            },
            {
                id: 2,
                name: 'Handwoven Basket',
                seller: 'Maria Santos',
                price: 350.00,
                image: 'images/product2.jpg'
            },
            {
                id: 3,
                name: 'Coconut Jam',
                seller: 'Pedro Reyes',
                price: 120.00,
                image: 'images/product3.jpg'
            },
            {
                id: 4,
                name: 'Abaca Bag',
                seller: 'Ana Dizon',
                price: 450.00,
                image: 'images/product4.jpg'
            }
        ];
        
        // Clear existing content
        featuredProductsContainer.innerHTML = '';
        
        // Add product cards
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-3';
            productCard.innerHTML = `
                <div class="card product-card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="seller-name">${product.seller}</p>
                        <p class="price">₱${product.price.toFixed(2)}</p>
                        <div class="d-flex justify-content-between">
                            <a href="product-details.html?id=${product.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                            <button class="btn btn-sm btn-primary add-to-cart" data-product-id="${product.id}">Add to Basket</button>
                        </div>
                    </div>
                </div>
            `;
            
            featuredProductsContainer.appendChild(productCard);
        });
        
        // Reinitialize add to cart buttons
        initializeAddToBasket();
    }
}
