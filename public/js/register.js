// Register Page Logic
class RegisterManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.initializeForm();
        this.setupEventListeners();
    }

    initializeForm() {
        this.updateStepDisplay();
        this.updateNavigationButtons();
    }

    setupEventListeners() {
        // Username availability check
        document.getElementById('username').addEventListener('blur', () => {
            this.checkUsernameAvailability();
        });

        // Password strength checker
        document.getElementById('password').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // Confirm password check
        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.checkPasswordMatch();
        });

        // Form submission
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Real-time validation
        this.setupRealTimeValidation();
    }

    async checkUsernameAvailability() {
        const username = document.getElementById('username').value.trim();
        const feedback = document.getElementById('usernameFeedback');
        
        if (username.length < 3) {
            feedback.textContent = 'نام کاربری باید حداقل 3 کاراکتر باشد';
            feedback.className = 'input-feedback error';
            return false;
        }

        try {
            const response = await fetch('/api/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username })
            });

            const result = await response.json();
            
            if (result.available) {
                feedback.textContent = 'نام کاربری در دسترس است';
                feedback.className = 'input-feedback success';
                return true;
            } else {
                feedback.textContent = 'این نام کاربری قبلاً استفاده شده است';
                feedback.className = 'input-feedback error';
                return false;
            }
        } catch (error) {
            feedback.textContent = 'خطا در بررسی نام کاربری';
            feedback.className = 'input-feedback error';
            return false;
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return false;
        
        let strength = 0;
        let strengthLabel = '';

        // Length check
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;

        // Character variety checks
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        // Remove previous classes
        strengthBar.className = 'strength-fill';
        
        if (strength < 3) {
            strengthBar.classList.add('weak');
            strengthLabel = 'ضعیف';
        } else if (strength < 4) {
            strengthBar.classList.add('fair');
            strengthLabel = 'متوسط';
        } else if (strength < 5) {
            strengthBar.classList.add('good');
            strengthLabel = 'خوب';
        } else {
            strengthBar.classList.add('strong');
            strengthLabel = 'قوی';
        }

        strengthText.textContent = `قدرت رمز عبور: ${strengthLabel}`;
        
        return strength >= 3;
    }

        checkPasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const feedback = document.getElementById('confirmPasswordFeedback');
        
        if (confirmPassword === '') {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
            return false;
        }

        if (password === confirmPassword) {
            feedback.textContent = 'رمز عبور مطابقت دارد';
            feedback.className = 'input-feedback success';
            return true;
        } else {
            feedback.textContent = 'رمز عبور مطابقت ندارد';
            feedback.className = 'input-feedback error';
            return false;
        }
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateCurrentStep();
            });
        });
    }

    validateCurrentStep() {
        let isValid = true;

        switch (this.currentStep) {
            case 1:
                isValid = this.validateStep1();
                break;
            case 2:
                isValid = this.validateStep2();
                break;
            case 3:
                isValid = this.validateStep3();
                break;
        }

        this.updateNavigationButtons();
        return isValid;
    }

    validateStep1() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        return username.length >= 3 && 
               password.length >= 8 && 
               password === confirmPassword &&
               this.checkPasswordStrength(password);
    }

    validateStep2() {
        const fullName = document.getElementById('fullName').value.trim();
        const jobRole = document.getElementById('jobRole').value;

        return fullName.length >= 2 && jobRole !== '';
    }

    validateStep3() {
        const agreeTerms = document.getElementById('agreeTerms').checked;
        return agreeTerms;
    }

    updateStepDisplay() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update step content
        document.querySelectorAll('.step-content').forEach((content, index) => {
            const stepNumber = index + 1;
            content.classList.remove('active');
            
            if (stepNumber === this.currentStep) {
                content.classList.add('active');
            }
        });

        // Update summary in step 3
        if (this.currentStep === 3) {
            this.updateSummary();
        }
    }

    updateSummary() {
        document.getElementById('summaryUsername').textContent = 
            document.getElementById('username').value;
        document.getElementById('summaryFullName').textContent = 
            document.getElementById('fullName').value;
        document.getElementById('summaryJobRole').textContent = 
            document.getElementById('jobRole').value || 'انتخاب نشده';
        document.getElementById('summaryWorkShift').textContent = 
            document.getElementById('workShift').value || 'انتخاب نشده';
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Previous button
        if (this.currentStep === 1) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
        }

        // Next/Submit button
        if (this.currentStep === this.totalSteps) {
            nextBtn.classList.add('d-none');
            submitBtn.classList.remove('d-none');
            submitBtn.disabled = !this.validateCurrentStep();
        } else {
            nextBtn.classList.remove('d-none');
            submitBtn.classList.add('d-none');
            nextBtn.disabled = !this.validateCurrentStep();
        }
    }

    async handleRegistration() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ثبت...';

        try {
            const formData = {
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value,
                fullName: document.getElementById('fullName').value.trim(),
                jobRole: document.getElementById('jobRole').value,
                employeeId: document.getElementById('employeeId').value.trim(),
                workShift: document.getElementById('workShift').value,
                role: 'operator' // Default role
            };

            const result = await authManager.register(formData);

            if (result.success) {
                this.showSuccessMessage();
            } else {
                throw new Error(result.error || 'خطا در ثبت‌نام');
            }

        } catch (error) {
            console.error('Registration error:', error);
            showNotification(error.message || 'خطا در ثبت‌نام', 'error');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> ثبت درخواست';
        }
    }

    showSuccessMessage() {
        const authCard = document.querySelector('.auth-card');
        authCard.innerHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>ثبت‌نام موفقیت‌آمیز</h2>
                <p>درخواست ثبت‌نام شما با موفقیت ارسال شد.</p>
                <p>پس از تایید توسط مدیر سیستم، می‌توانید وارد شوید.</p>
                <div class="success-actions">
                    <a href="login.html" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i>
                        بازگشت به صفحه ورود
                    </a>
                </div>
            </div>
        `;
    }
}

// Step navigation function
function changeStep(direction) {
    const registerManager = window.registerManager;
    const newStep = registerManager.currentStep + direction;
    
    if (newStep >= 1 && newStep <= registerManager.totalSteps) {
        if (direction > 0 && !registerManager.validateCurrentStep()) {
            return;
        }
        
        registerManager.currentStep = newStep;
        registerManager.updateStepDisplay();
        registerManager.updateNavigationButtons();
    }
}

// Password toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Initialize register manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.registerManager = new RegisterManager();
});