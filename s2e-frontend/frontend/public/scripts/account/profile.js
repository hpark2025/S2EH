/**
 * Profile page functionality
 * Handles profile editing, avatar upload, and form validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileForm = document.getElementById('profileForm');
    const profileActions = document.getElementById('profileActions');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
    const profileAvatar = document.getElementById('profileAvatar');
    
    // Form fields
    const formFields = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        birthDate: document.getElementById('birthDate'),
        gender: document.getElementById('gender'),
        streetAddress: document.getElementById('streetAddress'),
        city: document.getElementById('city'),
        province: document.getElementById('province'),
        postalCode: document.getElementById('postalCode'),
        country: document.getElementById('country'),
        bio: document.getElementById('bio')
    };
    
    let isEditing = false;
    let originalFormData = {};
    
    // Initialize
    saveOriginalFormData();
    
    // Event Listeners
    editProfileBtn.addEventListener('click', toggleEditMode);
    cancelEditBtn.addEventListener('click', cancelEdit);
    profileForm.addEventListener('submit', saveProfile);
    avatarInput.addEventListener('change', previewAvatar);
    uploadAvatarBtn.addEventListener('click', uploadAvatar);
    
    function toggleEditMode() {
        isEditing = !isEditing;
        
        if (isEditing) {
            enableEditMode();
        } else {
            disableEditMode();
        }
    }
    
    function enableEditMode() {
        // Enable form fields (except email which should remain readonly)
        Object.keys(formFields).forEach(key => {
            if (key !== 'email') {
                formFields[key].readOnly = false;
                formFields[key].disabled = false;
            }
        });
        
        // Update UI
        editProfileBtn.innerHTML = '<i class="bi bi-x-lg me-1"></i>Cancel Edit';
        editProfileBtn.className = 'btn btn-outline-secondary';
        profileActions.classList.remove('d-none');
        
        // Add visual feedback
        Object.values(formFields).forEach(field => {
            if (field.id !== 'email') {
                field.classList.add('border-primary');
            }
        });
    }
    
    function disableEditMode() {
        // Disable form fields
        Object.values(formFields).forEach(field => {
            field.readOnly = true;
            field.disabled = false; // Keep enabled for select dropdowns
            field.classList.remove('border-primary');
        });
        
        // Special handling for select dropdown
        formFields.gender.disabled = true;
        
        // Update UI
        editProfileBtn.innerHTML = '<i class="bi bi-pencil me-1"></i>Edit Profile';
        editProfileBtn.className = 'btn btn-outline-primary';
        profileActions.classList.add('d-none');
    }
    
    function cancelEdit() {
        // Restore original data
        Object.keys(originalFormData).forEach(key => {
            if (formFields[key]) {
                formFields[key].value = originalFormData[key];
            }
        });
        
        isEditing = false;
        disableEditMode();
        
        showNotification('Changes cancelled', 'info');
    }
    
    function saveProfile(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Update original data
            saveOriginalFormData();
            
            // Update user name in sidebar
            const userName = document.getElementById('userName');
            userName.textContent = `${formFields.firstName.value} ${formFields.lastName.value}`;
            
            // Disable edit mode
            isEditing = false;
            disableEditMode();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            showNotification('Profile updated successfully!', 'success');
        }, 1500);
    }
    
    function validateForm() {
        let isValid = true;
        const errors = [];
        
        // Required fields validation
        const requiredFields = ['firstName', 'lastName', 'phone'];
        
        requiredFields.forEach(fieldName => {
            const field = formFields[fieldName];
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                errors.push(`${getFieldLabel(fieldName)} is required`);
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
            }
        });
        
        // Phone number validation
        const phoneValue = formFields.phone.value.replace(/\D/g, '');
        if (phoneValue && !/^9\d{9}$/.test(phoneValue)) {
            formFields.phone.classList.add('is-invalid');
            errors.push('Phone number must be a valid 10-digit number starting with 9');
            isValid = false;
        }
        
        // Postal code validation
        const postalCode = formFields.postalCode.value.trim();
        if (postalCode && !/^\d{4}$/.test(postalCode)) {
            formFields.postalCode.classList.add('is-invalid');
            errors.push('Postal code must be 4 digits');
            isValid = false;
        }
        
        if (!isValid) {
            showNotification(`Please fix the following errors: ${errors.join(', ')}`, 'error');
        }
        
        return isValid;
    }
    
    function getFieldLabel(fieldName) {
        const labels = {
            firstName: 'First Name',
            lastName: 'Last Name',
            phone: 'Phone Number'
        };
        return labels[fieldName] || fieldName;
    }
    
    function saveOriginalFormData() {
        originalFormData = {};
        Object.keys(formFields).forEach(key => {
            originalFormData[key] = formFields[key].value;
        });
    }
    
    function previewAvatar() {
        const file = avatarInput.files[0];
        if (!file) return;
        
        // Validate file
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            avatarInput.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB
            showNotification('File size must be less than 5MB', 'error');
            avatarInput.value = '';
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            avatarPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    function uploadAvatar() {
        const file = avatarInput.files[0];
        if (!file) {
            showNotification('Please select an image first', 'error');
            return;
        }
        
        // Show loading state
        uploadAvatarBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
        uploadAvatarBtn.disabled = true;
        
        // Simulate upload
        setTimeout(() => {
            // Update profile avatar
            profileAvatar.src = avatarPreview.src;
            
            // Reset button
            uploadAvatarBtn.innerHTML = 'Upload';
            uploadAvatarBtn.disabled = false;
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
            modal.hide();
            
            showNotification('Profile picture updated successfully!', 'success');
        }, 2000);
    }
    
    // Phone number formatting
    formFields.phone.addEventListener('input', function() {
        // Remove non-digits
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 10 digits
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
    
    // Postal code formatting
    formFields.postalCode.addEventListener('input', function() {
        // Remove non-digits
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 4 digits
        if (this.value.length > 4) {
            this.value = this.value.slice(0, 4);
        }
    });
    
    // Global logout function
    window.logout = function() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear any stored user data
            localStorage.removeItem('userToken');
            sessionStorage.clear();
            
            // Redirect to home page
            window.location.href = '../../../unauth/home.html';
            
            showNotification('Logged out successfully', 'success');
        }
    };
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi ${getNotificationIcon(type)} me-2"></i>
                ${message}
            </div>
            <button class="notification-close">
                <i class="bi bi-x"></i>
            </button>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1050',
            maxWidth: '400px',
            padding: '15px',
            backgroundColor: getNotificationColor(type),
            color: 'white',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    function getNotificationIcon(type) {
        const icons = {
            success: 'bi-check-circle',
            error: 'bi-exclamation-triangle',
            info: 'bi-info-circle',
            warning: 'bi-exclamation-circle'
        };
        return icons[type] || 'bi-info-circle';
    }
    
    function getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8',
            warning: '#ffc107'
        };
        return colors[type] || '#17a2b8';
    }
});
