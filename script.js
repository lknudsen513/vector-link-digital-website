/**
 * Vector Link Digital - Contact Form with Power Automate Integration
 * Professional Modal System with Form Validation
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // ** REPLACE THIS WITH YOUR POWER AUTOMATE FLOW HTTP ENDPOINT **
    powerAutomateEndpoint: 'YOUR_POWER_AUTOMATE_FLOW_URL_HERE',
    
    // Form validation rules
    validation: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\d\s\-\+\(\)]+$/
    },
    
    // UI Messages
    messages: {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        invalidPhone: 'Please enter a valid phone number',
        submitError: 'Unable to send your request. Please try again or contact us directly.',
        networkError: 'Network error. Please check your connection and try again.'
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
        // Modal triggers (all CTA buttons)
        document.querySelectorAll('[data-modal-trigger]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        });
        
        // Modal close triggers
        document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.close());
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('is-active')) {
                this.close();
            }
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Retry button
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => {
                this.showForm();
            });
        }
        
        // Real-time validation
        this.setupRealtimeValidation();
    }
    
    open() {
        this.modal.classList.add('is-active');
        document.body.classList.add('modal-open');
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('firstName').focus();
        }, 100);
    }
    
    close() {
        this.modal.classList.remove('is-active');
        document.body.classList.remove('modal-open');
        
        // Reset form after animation
        setTimeout(() => {
            this.reset();
        }, 300);
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
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
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
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = CONFIG.messages.required;
        }
        
        // Email validation
        if (fieldName === 'email' && value && !CONFIG.validation.email.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.invalidEmail;
        }
        
        // Phone validation (if provided)
        if (fieldName === 'phone' && value && !CONFIG.validation.phone.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.invalidPhone;
        }
        
        // Update UI
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
            if (!this.validateField(input)) {
                isValid = false;
            }
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
        // Validate form
        if (!this.validateForm()) {
            // Scroll to first error
            const firstError = this.form.querySelector('.is-invalid');
            if (firstError) {
                firstError.focus();
            }
            return;
        }
        
        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            description: document.getElementById('description').value.trim()
        };
        
        // Show loading state
        this.setLoading(true);
        
        try {
            // Send to Power Automate
            const response = await fetch(CONFIG.powerAutomateEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                // Success!
                this.showSuccess();
                
                // Optional: Track conversion (Google Analytics, etc.)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submission', {
                        event_category: 'Contact',
                        event_label: 'Contact Form'
                    });
                }
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
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
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new ContactModal();
    
    console.log('✅ Vector Link Digital - Contact system initialized');
});

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

// Trap focus within modal when open
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
