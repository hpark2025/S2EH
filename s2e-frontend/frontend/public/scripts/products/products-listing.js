/**
 * Products Listing functionality
 * Handles product display, filtering, sorting, and pagination
 */

document.addEventListener('DOMContentLoaded', function() {
    // Sample product data (in a real app, this would come from an API)
    const products = [
        {
            id: 1,
            name: "Organic White Rice (5kg)",
            price: 320,
            originalPrice: null,
            seller: "Juan Dela Cruz",
            location: "Sagnay, Camarines Sur",
            image: "../../images/unknown.jpg",
            category: "agricultural",
            rating: 4.8,
            reviews: 156,
            lguValidated: true,
            verifiedSeller: true,
            description: "Premium organic white rice, freshly harvested",
            tags: ["organic", "rice", "agriculture"]
        },
        {
            id: 2,
            name: "Handwoven Abaca Basket",
            price: 450,
            originalPrice: null,
            seller: "Maria Santos",
            location: "Sagnay, Camarines Sur",
            image: "../../images/unknown.jpg",
            category: "handicrafts",
            rating: 5.0,
            reviews: 89,
            lguValidated: true,
            verifiedSeller: true,
            description: "Traditional handwoven basket made from premium abaca fiber",
            tags: ["handicraft", "basket", "abaca"]
        },
        {
            id: 3,
            name: "Coconut Jam (500g)",
            price: 180,
            originalPrice: 220,
            seller: "Pedro Reyes",
            location: "Sagnay, Camarines Sur",
            image: "../../images/unknown.jpg",
            category: "delicacies",
            rating: 4.5,
            reviews: 234,
            lguValidated: false,
            verifiedSeller: true,
            description: "Sweet and creamy coconut jam made from fresh coconuts",
            tags: ["coconut", "jam", "sweet"]
        },
        {
            id: 4,
            name: "Pili Nuts (250g)",
            price: 280,
            originalPrice: null,
            seller: "Ana Dizon",
            location: "Naga City",
            image: "../../images/unknown.jpg",
            category: "delicacies",
            rating: 4.7,
            reviews: 67,
            lguValidated: true,
            verifiedSeller: false,
            description: "Premium quality pili nuts, locally sourced",
            tags: ["pili", "nuts", "snack"]
        },
        {
            id: 5,
            name: "Bamboo Table Set",
            price: 2500,
            originalPrice: null,
            seller: "Carlos Mendoza",
            location: "Legaspi City",
            image: "../../images/unknown.jpg",
            category: "furniture",
            rating: 4.3,
            reviews: 45,
            lguValidated: false,
            verifiedSeller: true,
            description: "Handcrafted bamboo table set perfect for outdoor dining",
            tags: ["bamboo", "furniture", "table"]
        },
        {
            id: 6,
            name: "Embroidered Barong",
            price: 1800,
            originalPrice: 2200,
            seller: "Rosa Garcia",
            location: "Iriga City",
            image: "../../images/unknown.jpg",
            category: "textiles",
            rating: 4.9,
            reviews: 123,
            lguValidated: true,
            verifiedSeller: true,
            description: "Elegant embroidered barong for special occasions",
            tags: ["barong", "embroidered", "formal"]
        },
        {
            id: 7,
            name: "Laing Mix (100g)",
            price: 85,
            originalPrice: null,
            seller: "Lorna Cruz",
            location: "Sagnay, Camarines Sur",
            image: "../../images/unknown.jpg",
            category: "delicacies",
            rating: 4.6,
            reviews: 178,
            lguValidated: true,
            verifiedSeller: true,
            description: "Authentic Bicolano laing seasoning mix",
            tags: ["laing", "seasoning", "bicol"]
        },
        {
            id: 8,
            name: "Rattan Bag",
            price: 650,
            originalPrice: null,
            seller: "Elena Flores",
            location: "Sagnay, Camarines Sur",
            image: "../../images/unknown.jpg",
            category: "accessories",
            rating: 4.4,
            reviews: 91,
            lguValidated: false,
            verifiedSeller: false,
            description: "Stylish rattan bag perfect for everyday use",
            tags: ["rattan", "bag", "fashion"]
        }
    ];

    let filteredProducts = [...products];
    let currentView = 'grid';
    let currentPage = 1;
    const productsPerPage = 12;

    // DOM Elements
    const productsContainer = document.getElementById('productsContainer');
    const productCount = document.getElementById('productCount');
    const searchQuery = document.getElementById('searchQuery');
    const sortBy = document.getElementById('sortBy');
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const mainSearch = document.getElementById('mainSearch');
    const pagination = document.getElementById('pagination');
    
    // Filter elements
    const categoryFilters = document.querySelectorAll('.category-filters input[type="checkbox"]');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const locationFilter = document.getElementById('locationFilter');
    const ratingFilters = document.querySelectorAll('input[name="rating"]');
    const lguValidated = document.getElementById('lguValidated');
    const verifiedSellers = document.getElementById('verifiedSellers');
    const applyFilters = document.getElementById('applyFilters');
    const clearFilters = document.getElementById('clearFilters');

    // Initialize
    displayProducts();
    updateProductCount();

    // Event Listeners
    sortBy.addEventListener('change', () => {
        sortProducts();
        displayProducts();
    });

    gridView.addEventListener('click', () => {
        currentView = 'grid';
        gridView.classList.add('active');
        listView.classList.remove('active');
        displayProducts();
    });

    listView.addEventListener('click', () => {
        currentView = 'list';
        listView.classList.add('active');
        gridView.classList.remove('active');
        displayProducts();
    });

    mainSearch.addEventListener('input', debounce(searchProducts, 300));
    applyFilters.addEventListener('click', applyAllFilters);
    clearFilters.addEventListener('click', clearAllFilters);

    function displayProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = filteredProducts.slice(startIndex, endIndex);

        if (currentView === 'grid') {
            displayGridView(productsToShow);
        } else {
            displayListView(productsToShow);
        }

        updatePagination();
        updateProductCount();
    }

    function displayGridView(products) {
        const gridHTML = `
            <div class="row g-4">
                ${products.map(product => createProductCard(product)).join('')}
            </div>
        `;
        productsContainer.innerHTML = gridHTML;
    }

    function displayListView(products) {
        const listHTML = products.map(product => createProductListItem(product)).join('');
        productsContainer.innerHTML = `<div class="products-list">${listHTML}</div>`;
    }

    function createProductCard(product) {
        const discountPercentage = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
            <div class="col-lg-4 col-md-6 col-sm-6">
                <div class="card product-card h-100">
                    ${product.originalPrice ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2 z-2">${discountPercentage}% OFF</span>` : ''}
                    ${product.lguValidated ? '<span class="badge bg-success position-absolute top-0 start-0 m-2 z-2">LGU</span>' : ''}
                    
                    <div class="position-relative">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                        <div class="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0">
                            <button class="btn btn-primary btn-sm me-2" onclick="viewProduct(${product.id})">
                                <i class="bi bi-eye"></i> Quick View
                            </button>
                            <button class="btn btn-outline-primary btn-sm" onclick="addToWishlist(${product.id})">
                                <i class="bi bi-heart"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-body">
                        <h6 class="card-title">${product.name}</h6>
                        <p class="seller-name text-muted small">
                            <i class="bi bi-person-circle me-1"></i>${product.seller}
                            ${product.verifiedSeller ? '<i class="bi bi-patch-check text-primary ms-1" title="Verified Seller"></i>' : ''}
                        </p>
                        <p class="location text-muted small">
                            <i class="bi bi-geo-alt me-1"></i>${product.location}
                        </p>
                        
                        <div class="rating mb-2">
                            ${createStarRating(product.rating)}
                            <small class="text-muted">(${product.reviews})</small>
                        </div>
                        
                        <div class="price-section mb-3">
                            ${product.originalPrice ? 
                                `<span class="text-decoration-line-through text-muted me-2">₱${product.originalPrice.toLocaleString()}</span>` : ''}
                            <span class="fw-bold text-success fs-5">₱${product.price.toLocaleString()}</span>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-outline-success btn-sm flex-grow-1 me-2" onclick="viewProduct(${product.id})">
                                <i class="bi bi-eye me-1"></i>View
                            </button>
                            <button class="btn btn-success btn-sm flex-grow-1 add-to-basket" data-product-id="${product.id}">
                                <i class="bi bi-cart-plus me-1"></i>Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function createProductListItem(product) {
        const discountPercentage = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
            <div class="product-list-item bg-white border rounded mb-3 p-3">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <div class="position-relative">
                            <img src="${product.image}" alt="${product.name}" class="img-fluid rounded" style="height: 120px; width: 100%; object-fit: cover;">
                            ${product.originalPrice ? `<span class="badge bg-danger position-absolute top-0 end-0 m-1">${discountPercentage}% OFF</span>` : ''}
                            ${product.lguValidated ? '<span class="badge bg-success position-absolute top-0 start-0 m-1">LGU</span>' : ''}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h5 class="mb-2">${product.name}</h5>
                        <p class="text-muted mb-2">${product.description}</p>
                        <p class="seller-name text-muted small mb-1">
                            <i class="bi bi-person-circle me-1"></i>${product.seller}
                            ${product.verifiedSeller ? '<i class="bi bi-patch-check text-primary ms-1" title="Verified Seller"></i>' : ''}
                        </p>
                        <p class="location text-muted small mb-2">
                            <i class="bi bi-geo-alt me-1"></i>${product.location}
                        </p>
                        <div class="rating">
                            ${createStarRating(product.rating)}
                            <small class="text-muted">(${product.reviews} reviews)</small>
                        </div>
                    </div>
                    <div class="col-md-3 text-end">
                        <div class="price-section mb-3">
                            ${product.originalPrice ? 
                                `<div class="text-decoration-line-through text-muted">₱${product.originalPrice.toLocaleString()}</div>` : ''}
                            <div class="fw-bold text-success fs-4">₱${product.price.toLocaleString()}</div>
                        </div>
                        <div class="d-grid gap-2">
                            <button class="btn btn-outline-success btn-sm" onclick="viewProduct(${product.id})">
                                <i class="bi bi-eye me-1"></i>View Details
                            </button>
                            <button class="btn btn-success btn-sm add-to-basket" data-product-id="${product.id}">
                                <i class="bi bi-cart-plus me-1"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function createStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="bi bi-star-fill text-warning"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="bi bi-star-half text-warning"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="bi bi-star text-warning"></i>';
        }
        
        return `<span class="rating-stars">${stars}</span> <span class="rating-value">${rating}</span>`;
    }

    function sortProducts() {
        const sortValue = sortBy.value;
        
        filteredProducts.sort((a, b) => {
            switch (sortValue) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'newest':
                    return b.id - a.id; // Assuming higher ID means newer
                case 'popular':
                    return b.reviews - a.reviews;
                case 'rating':
                    return b.rating - a.rating;
                default: // relevance
                    return a.id - b.id;
            }
        });
    }

    function searchProducts() {
        const query = mainSearch.value.toLowerCase().trim();
        
        if (query) {
            filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.seller.toLowerCase().includes(query) ||
                product.tags.some(tag => tag.toLowerCase().includes(query))
            );
            searchQuery.textContent = `for "${query}"`;
        } else {
            filteredProducts = [...products];
            searchQuery.textContent = '';
        }
        
        currentPage = 1;
        applyCurrentFilters();
        displayProducts();
    }

    function applyAllFilters() {
        applyCurrentFilters();
        currentPage = 1;
        displayProducts();
    }

    function applyCurrentFilters() {
        let filtered = [...products];
        
        // Apply search if active
        const query = mainSearch.value.toLowerCase().trim();
        if (query) {
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.seller.toLowerCase().includes(query) ||
                product.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Category filters
        const selectedCategories = Array.from(categoryFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product => selectedCategories.includes(product.category));
        }
        
        // Price range filters
        const minPriceValue = parseFloat(minPrice.value) || 0;
        const maxPriceValue = parseFloat(maxPrice.value) || Infinity;
        
        filtered = filtered.filter(product => 
            product.price >= minPriceValue && product.price <= maxPriceValue
        );
        
        // Location filter
        if (locationFilter.value) {
            filtered = filtered.filter(product => 
                product.location.toLowerCase().includes(locationFilter.value.toLowerCase())
            );
        }
        
        // Rating filter
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        if (selectedRating) {
            const minRating = parseFloat(selectedRating.value);
            filtered = filtered.filter(product => product.rating >= minRating);
        }
        
        // LGU validation filter
        if (lguValidated.checked) {
            filtered = filtered.filter(product => product.lguValidated);
        }
        
        // Verified sellers filter
        if (verifiedSellers.checked) {
            filtered = filtered.filter(product => product.verifiedSeller);
        }
        
        filteredProducts = filtered;
        sortProducts();
    }

    function clearAllFilters() {
        // Clear all filter inputs
        categoryFilters.forEach(cb => cb.checked = false);
        minPrice.value = '';
        maxPrice.value = '';
        locationFilter.value = '';
        ratingFilters.forEach(radio => radio.checked = false);
        lguValidated.checked = false;
        verifiedSellers.checked = false;
        mainSearch.value = '';
        
        // Reset filtered products
        filteredProducts = [...products];
        searchQuery.textContent = '';
        currentPage = 1;
        
        sortProducts();
        displayProducts();
    }

    function setPriceRange(min, max) {
        minPrice.value = min;
        maxPrice.value = max;
    }

    function updateProductCount() {
        productCount.textContent = filteredProducts.length;
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        let paginationHTML = '';
        
        if (totalPages > 1) {
            // Previous button
            paginationHTML += `
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
                </li>
            `;
            
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    paginationHTML += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`;
                } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    paginationHTML += `<li class="page-item disabled"><a class="page-link" href="#">...</a></li>`;
                }
            }
            
            // Next button
            paginationHTML += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
                </li>
            `;
        }
        
        pagination.querySelector('ul').innerHTML = paginationHTML;
    }

    // Global functions
    window.changePage = function(page) {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            displayProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.viewProduct = function(productId) {
        // Navigate to product details page
        window.location.href = `../product-details/product.html?id=${productId}`;
    };

    window.addToWishlist = function(productId) {
        // Add to wishlist functionality
        console.log('Add to wishlist:', productId);
        // This would integrate with a wishlist system
    };

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
});
