// Authentication Manager
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        this.apiBase = '';
        this.setupInterceptors();
    }

    setupInterceptors() {
        // Setup request interceptor for auth token
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            if (url.startsWith('/api/') || url.startsWith('/auth/') || url.startsWith('/admin/')) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                };
            }
            
            const response = await originalFetch(url, options);
            
            // Handle 401 responses
            if (response.status === 401 && !url.includes('/auth/login')) {
                this.handleUnauthorized();
            }
            
            return response;
        };
    }

    handleUnauthorized() {
        this.clearAuth();
        if (window.location.pathname !== '/pages/login.html') {
            window.location.href = '/pages/login.html';
        }
    }

    async login(username, password, rememberMe = false) {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, rememberMe })
            });

            const result = await response.json();
            
            if (result.success) {
                this.token = result.data.token;
                this.user = result.data.user;
                
                // Store auth data
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                // Load user preferences
                await this.loadUserPreferences();
                
                return { success: true, user: this.user };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'خطای اتصال به سرور' };
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'خطای اتصال به سرور' };
        }
    }

    async logout() {
        try {
            await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        this.clearAuth();
        window.location.href = '/pages/login.html';
    }

    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userPreferences');
        
        this.token = null;
        this.user = null;
    }

    async loadUserPreferences() {
        try {
            const response = await fetch('/api/user-preferences');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    localStorage.setItem('userPreferences', JSON.stringify(result.data));
                    this.applyUserPreferences(result.data);
                }
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }

    applyUserPreferences(preferences) {
        // Apply theme
        document.documentElement.setAttribute('data-theme', preferences.theme || 'light');
        
        // Apply colors
        const root = document.documentElement;
        root.style.setProperty('--primary-color', preferences.primaryColor || '#2563eb');
        root.style.setProperty('--dri1-color', preferences.dri1Color || '#3b82f6');
        root.style.setProperty('--dri2-color', preferences.dri2Color || '#ef4444');
        
        // Store preferences globally
        window.currentSettings = preferences;
        
        // Update theme icon
        this.updateThemeIcon(preferences.theme);
    }

    updateThemeIcon(theme) {
        const themeIcon = document.querySelector('.theme-toggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    async saveUserPreferences(preferences) {
        try {
            const response = await fetch('/api/user-preferences', {
                method: 'POST',
                body: JSON.stringify(preferences)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    localStorage.setItem('userPreferences', JSON.stringify(preferences));
                    this.applyUserPreferences(preferences);
                    return { success: true };
                }
            }
            
            return { success: false, error: 'خطا در ذخیره تنظیمات' };
        } catch (error) {
            console.error('Error saving preferences:', error);
            return { success: false, error: 'خطای اتصال به سرور' };
        }
    }

    isAuthenticated() {
        return this.token && this.user;
    }

    hasRole(role) {
        return this.user && this.user.role === role;
    }

    hasPermission(permission) {
        if (!this.user) return false;
        
        const rolePermissions = {
            'admin': ['create', 'read', 'update', 'delete', 'approve', 'manage_users'],
            'supervisor': ['create', 'read', 'update', 'approve'],
            'operator': ['create', 'read', 'update']
        };
        
        return rolePermissions[this.user.role]?.includes(permission) || false;
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.handleUnauthorized();
            return null;
        }

        return response;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Theme toggle function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    authManager.updateThemeIcon(newTheme);
    
    // Save theme preference
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences.theme = newTheme;
    authManager.saveUserPreferences(preferences);
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    
    // Skip auth check for login and register pages
    if (currentPath.includes('/login.html') || currentPath.includes('/register.html')) {
        return;
    }
    
    // Redirect to login if not authenticated
    if (!authManager.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Load user preferences if authenticated
    authManager.loadUserPreferences();
    
    // Initialize PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
    }
});

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');
        
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ورود...';
        
        const result = await authManager.login(username, password, rememberMe);
        
        if (result.success) {
            window.location.href = '/pages/index.html';
        } else {
            showNotification(result.error, 'error');
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ورود به سیستم';
        }
    });
}

// Password toggle function
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Global notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    if (type === 'error') {
        notification.style.background = 'var(--error-color)';
    } else if (type === 'warning') {
        notification.style.background = 'var(--warning-color)';
    }
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export for use in other modules
window.authManager = authManager;
window.showNotification = showNotification;