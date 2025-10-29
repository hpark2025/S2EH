/**
 * Register Form Validation
 * Handles client-side validation for registration form
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    
    if (!form) return; // Exit if form not found
    
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    
    form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Check if passwords match
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setCustomValidity("Passwords don't match");
            event.preventDefault();
            event.stopPropagation();
        } else if (confirmPassword) {
            confirmPassword.setCustomValidity('');
        }
        
        form.classList.add('was-validated');
    });
    
    // Phone number validation
    const phoneInput = document.getElementById('phone');
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
    if (password) {
        password.addEventListener('input', function() {
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
            
            // Check confirm password match if it has a value
            if (confirmPassword && confirmPassword.value) {
                if (this.value === confirmPassword.value) {
                    confirmPassword.classList.remove('is-invalid');
                    confirmPassword.classList.add('is-valid');
                } else {
                    confirmPassword.classList.remove('is-valid');
                    confirmPassword.classList.add('is-invalid');
                }
            }
        });
    }
    
    // Confirm password validation
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (password && password.value === this.value) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        });
    }
});
