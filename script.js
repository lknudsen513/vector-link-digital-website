/**
 * Vector Link Digital - Contact Form with Power Automate
 * Optimized for Power Automate HTTP Triggers
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // ** PASTE YOUR POWER AUTOMATE HTTP POST URL HERE **
    // Make sure it's the FULL URL with sp= and sig= parameters!
    powerAutomateEndpoint: 'https://defaultd0b33a9da17844a29bc8068e3a67e8.ec.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4924f036d7bb469b8c4b82378604f9dd/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=IDopDJmfkycPKcmF875YQJwXO_J4NefVDemzKRacG8U',
    
    validation: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\d\s\-\+\(\)]+$/
    },
    
    messages: {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        invalidPhone: 'Please enter a valid phone number'
    }
};

// ============================================
// MODAL FUNCTIONALITY
// ============================================

class ContactModal {
    constructor() {
        this.modal = document.getElementById('contactModal');
        this.form = document.getElementById('contactForm');
        this.successMessage = document.getElementById('successMessage');
        this.errorMessage = document.getElementById('errorMessage');
        this.submitBtn = document.getElementById('submitBtn');
        this.retryBtn = document.getElementById('retryBtn');
        
        this.init();
    }
    
    init() {
        // Modal triggers
        document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });
        
        // Close triggers
        document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.close());
        });
        
        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('is-active')) {
                this.close();
            }
        });
        
        // Form submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Retry
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => this.showForm());
        }
        
        this.setupRealtimeValidation();
    }
    
    open() {
        this.modal.classList.add('is-active');
        document.body.classList.add('modal-open');
        setTimeout(() => document.getElementById('firstName').focus(), 100);
    }
    
    close() {
        this.modal.classList.remove('is-active');
        document.body.classList.remove('modal-open');
        setTimeout(() => this.reset(), 300);
    }
    
    reset() {
        this.form.reset();
        this.clearErrors();
        this.showForm();
    }
    
    showForm() {
        this.form.style.display = 'flex';
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
    
    showSuccess() {
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }
    
    showError() {
        this.form.style.display = 'none';
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'block';
    }
    
    setupRealtimeValidation() {
        const inputs = this.form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    this.validateField(input);
                }
            });
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        let isValid = true;
        let errorMessage = '';
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = CONFIG.messages.required;
        }
        
        if (fieldName === 'email' && value && !CONFIG.validation.email.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.invalidEmail;
        }
        
        if (fieldName === 'phone' && value && !CONFIG.validation.phone.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.invalidPhone;
        }
        
        if (isValid) {
            field.classList.remove('is-invalid');
            if (errorElement) errorElement.textContent = '';
        } else {
            field.classList.add('is-invalid');
            if (errorElement) errorElement.textContent = errorMessage;
        }
        
        return isValid;
    }
    
    validateForm() {
        const inputs = this.form.querySelectorAll('.form-input[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!this.validateField(input)) isValid = false;
        });
        return isValid;
    }
    
    clearErrors() {
        const inputs = this.form.querySelectorAll('.form-input');
        const errors = this.form.querySelectorAll('.form-error');
        inputs.forEach(input => input.classList.remove('is-invalid'));
        errors.forEach(error => error.textContent = '');
    }
    
    async handleSubmit() {
        console.log('🚀 Form submission started...');
        
        // Check configuration
        if (CONFIG.powerAutomateEndpoint.includes('YOUR_COMPLETE_POWER_AUTOMATE')) {
            console.error('❌ Power Automate endpoint not configured');
            alert('Configuration Error: Please update the Power Automate endpoint in script.js');
            return;
        }
        
        // Validate
        if (!this.validateForm()) {
            console.log('❌ Validation failed');
            const firstError = this.form.querySelector('.is-invalid');
            if (firstError) firstError.focus();
            return;
        }
        
        // Prepare data - EXACTLY matching Power Automate schema
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            description: document.getElementById('description').value.trim(),
            timestamp: new Date().toISOString()
        };
        
        console.log('📦 Form data:', formData);
        console.log('📡 Endpoint:', CONFIG.powerAutomateEndpoint);
        
        this.setLoading(true);
        
        try {
            const response = await fetch(CONFIG.powerAutomateEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            console.log('📨 Response status:', response.status);
            
            // Power Automate returns 200 or 202 for success
            if (response.ok || response.status === 202) {
                console.log('✅ Success!');
                this.showSuccess();
                
                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        event_category: 'Contact',
                        event_label: 'Contact Form'
                    });
                }
            } else {
                // Log the full error for debugging
                const errorText = await response.text();
                console.error('❌ Server error:', response.status, errorText);
                
                // Check for specific Power Automate errors
                if (response.status === 401) {
                    console.error('🔐 Authentication Error - Flow requires authentication');
                    console.error('Solution: Make sure your Power Automate HTTP trigger allows anonymous access');
                } else if (response.status === 403) {
                    console.error('🚫 Forbidden - Check Power Automate flow permissions');
                }
                
                this.showError();
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            this.showError();
        } finally {
            this.setLoading(false);
        }
    }
    
    setLoading(isLoading) {
        const btnText = this.submitBtn.querySelector('.btn__text');
        const btnLoader = this.submitBtn.querySelector('.btn__loader');
        
        if (isLoading) {
            this.submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';
        } else {
            this.submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new ContactModal();
    console.log('✅ Vector Link Digital contact form initialized');
    console.log('⚡ Using Power Automate for form submission');
});

// ============================================
// ACCESSIBILITY
// ============================================

document.addEventListener('keydown', (e) => {
    const modal = document.querySelector('.modal.is-active');
    if (!modal || e.key !== 'Tab') return;
    
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
});
