/**
 * Reset Password functionality
 * Handles the multi-step password reset process
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const resetForm = document.getElementById('resetForm');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verifyCodeBtn = document.getElementById('verifyCodeBtn');
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    const phoneInput = document.getElementById('reset-phone');
    const codeInput = document.getElementById('verification-code');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-new-password');
    
    // Send verification code
    sendCodeBtn.addEventListener('click', function() {
        // Validate phone number
        if (!validatePhone(phoneInput.value)) {
            phoneInput.classList.add('is-invalid');
            return;
        }
        
        // Simulate sending code (in a real app, this would be an API call)
        phoneInput.disabled = true;
        sendCodeBtn.disabled = true;
        sendCodeBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
        
        setTimeout(() => {
            // Show success message
            showNotification('Verification code sent to your phone', 'success');
            
            // Move to step 2
            step1.style.display = 'none';
            step2.style.display = 'block';
            
            // Start resend timer
            startResendTimer();
        }, 1500);
    });
    
    // Verify code
    verifyCodeBtn.addEventListener('click', function() {
        // Validate verification code
        if (!validateCode(codeInput.value)) {
            codeInput.classList.add('is-invalid');
            return;
        }
        
        // Simulate verifying code (in a real app, this would be an API call)
        codeInput.disabled = true;
        verifyCodeBtn.disabled = true;
        verifyCodeBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
        
        setTimeout(() => {
            // Show success message
            showNotification('Code verified successfully', 'success');
            
            // Move to step 3
            step2.style.display = 'none';
            step3.style.display = 'block';
        }, 1500);
    });
    
    // Resend code
    resendCodeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check if button is disabled (timer still running)
        if (resendCodeBtn.classList.contains('disabled')) {
            return;
        }
        
        // Simulate resending code
        resendCodeBtn.classList.add('disabled');
        
        setTimeout(() => {
            showNotification('New verification code sent', 'success');
            startResendTimer();
        }, 1000);
    });
    
    // Form submission (reset password)
    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate passwords
        if (!validatePasswords(newPasswordInput.value, confirmPasswordInput.value)) {
            return;
        }
        
        // Simulate password reset (in a real app, this would be an API call)
        const submitBtn = resetForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Resetting...';
        
        setTimeout(() => {
            showNotification('Password reset successful!', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }, 1500);
    });
    
    // Validation functions
    function validatePhone(phone) {
        // Remove any non-digit characters
        phone = phone.replace(/\D/g, '');
        
        // Check if valid (must start with 9 and have 10 digits)
        const isValid = /^9\d{9}$/.test(phone);
        
        if (isValid) {
            phoneInput.classList.remove('is-invalid');
            phoneInput.classList.add('is-valid');
            return true;
        } else {
            phoneInput.classList.remove('is-valid');
            phoneInput.classList.add('is-invalid');
            return false;
        }
    }
    
    function validateCode(code) {
        // Check if valid (6 digits)
        const isValid = /^\d{6}$/.test(code);
        
        if (isValid) {
            codeInput.classList.remove('is-invalid');
            codeInput.classList.add('is-valid');
            return true;
        } else {
            codeInput.classList.remove('is-valid');
            codeInput.classList.add('is-invalid');
            return false;
        }
    }
    
    function validatePasswords(password, confirmPassword) {
        let isValid = true;
        
        // Check password length
        if (password.length < 8) {
            newPasswordInput.classList.add('is-invalid');
            isValid = false;
        } else {
            newPasswordInput.classList.remove('is-invalid');
            newPasswordInput.classList.add('is-valid');
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            isValid = false;
        } else if (password.length >= 8) {
            confirmPasswordInput.classList.remove('is-invalid');
            confirmPasswordInput.classList.add('is-valid');
        }
        
        return isValid;
    }
    
    // Timer for resend code
    function startResendTimer() {
        let seconds = 60;
        resendCodeBtn.classList.add('disabled');
        
        // Create or update timer element
        let timerEl = document.querySelector('.resend-timer');
        if (!timerEl) {
            timerEl = document.createElement('span');
            timerEl.className = 'resend-timer';
            resendCodeBtn.parentNode.appendChild(timerEl);
        }
        
        timerEl.textContent = `(${seconds}s)`;
        
        const timer = setInterval(() => {
            seconds--;
            timerEl.textContent = `(${seconds}s)`;
            
            if (seconds <= 0) {
                clearInterval(timer);
                resendCodeBtn.classList.remove('disabled');
                timerEl.textContent = '';
            }
        }, 1000);
    }
    
    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'success' ? '<i class="bi bi-check-circle"></i>' : '<i class="bi bi-exclamation-circle"></i>'}
            </div>
            <div class="notification-content">
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Input validation events
    phoneInput.addEventListener('input', function() {
        // Remove any non-digit characters
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 10 digits
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
        
        // Live validation
        validatePhone(this.value);
    });
    
    codeInput.addEventListener('input', function() {
        // Remove any non-digit characters
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 6 digits
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6);
        }
    });
    
    newPasswordInput.addEventListener('input', function() {
        if (this.value.length >= 8) {
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
        if (confirmPasswordInput.value) {
            if (this.value === confirmPasswordInput.value) {
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
            } else {
                confirmPasswordInput.classList.remove('is-valid');
                confirmPasswordInput.classList.add('is-invalid');
            }
        }
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        if (this.value === newPasswordInput.value && newPasswordInput.value.length >= 8) {
            this.classList.remove('is-invalid');
            this.classList.add('is-valid');
        } else {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        }
    });
});
