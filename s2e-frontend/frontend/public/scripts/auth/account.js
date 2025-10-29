// account.js – Handles login and registration logic

import { showNotification } from '../ui/notifications.js';

export function initializeAccountForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real application, this would send a request to the server
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'account.html';
            }, 1500);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real application, this would send a request to the server
            showNotification('Registration successful! Please check your email to verify your account.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }
}