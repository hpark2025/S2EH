// producer-verification.js – Handles producer verification form submission

import { showNotification } from './notifications.js';

export function initializeProducerVerification() {
    const verificationForms = document.querySelectorAll('.producer-verification-form');
    
    verificationForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            try {
                // In production, this would submit to Laravel backend
                const response = await submitProducerVerification(formData);
                
                if (response.success) {
                    showNotification('Verification submitted successfully', 'success');
                    updateProducerStatus(response.status);
                } else {
                    showNotification('Verification submission failed', 'error');
                }
            } catch (error) {
                console.error('Producer verification error:', error);
                showNotification('Verification system error', 'error');
            }
        });
    });
}

async function submitProducerVerification(formData) {
    // This would be an API call to the Laravel backend in production
    // For now, return mock response
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                status: 'pending',
                message: 'Verification submitted for LGU review'
            });
        }, 1000);
    });
}

function updateProducerStatus(status) {
    const statusBadge = document.querySelector('.producer-status');
    if (statusBadge) {
        statusBadge.className = `producer-status producer-${status}`;
        statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
}
