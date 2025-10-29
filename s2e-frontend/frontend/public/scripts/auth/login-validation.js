/**
 * Login Form Validation
 * Handles client-side validation for login form
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    if (!form) return; // Exit if form not found
    
    form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        form.classList.add('was-validated');
    });
    
    // Phone number validation
    const phoneInput = document.getElementById('login-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Remove any non-digit characters
            this.value = this.value.replace(/\D/g, '');
            
            // Limit to 10 digits (excluding the +63 prefix)
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
            
            // Check if valid (must start with 9 and have 10 digits)
            const isValid = /^9\d{9}$/.test(this.value);
            
            if (isValid) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else if (this.value.length > 0) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    }
    
    // Password validation
    const passwordInput = document.getElementById('login-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const isValid = this.value.length >= 8;
            
            if (isValid) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else if (this.value.length > 0) {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    }
});
