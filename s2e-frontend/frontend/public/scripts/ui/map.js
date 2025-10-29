// map.js – Handles seller location map using Leaflet.js

export function initializeLocationMap() {
    const mapContainer = document.getElementById('seller-map');
    
    if (mapContainer && typeof L !== 'undefined') {
        // Create map centered on Sagnay, Camarines Sur
        const map = L.map('seller-map').setView([13.6010, 123.5125], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add markers for sellers
        // In a real application, this data would come from an API
        const sellers = [
            {
                id: 1,
                name: 'Juan Dela Cruz',
                lat: 13.6010,
                lng: 123.5125,
                products: 'Agricultural Goods'
            },
            {
                id: 2,
                name: 'Maria Santos',
                lat: 13.6050,
                lng: 123.5200,
                products: 'Handwoven Crafts'
            },
            {
                id: 3,
                name: 'Pedro Reyes',
                lat: 13.5950,
                lng: 123.5150,
                products: 'Local Delicacies'
            }
        ];
        
        sellers.forEach(seller => {
            const marker = L.marker([seller.lat, seller.lng]).addTo(map);
            marker.bindPopup(`
                <strong>${seller.name}</strong><br>
                Products: ${seller.products}<br>
                <a href="seller-profile.html?id=${seller.id}">View Profile</a>
            `);
        });
    }
}

