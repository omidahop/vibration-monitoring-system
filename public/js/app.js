// Main Application Logic
class VibrationMonitoringApp {
    constructor() {
        this.currentSection = 'data-entry';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkUserRole();
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-tab')) {
                const sectionId = e.target.onclick?.toString().match(/showSection\('([^']+)'\)/)?.[1];
                if (sectionId) {
                    this.showSection(sectionId);
                }
            }
        });

        // Modal handling
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    checkUserRole() {
        // Show admin panel for admin users
        if (authManager.hasRole('admin')) {
            const adminTab = document.querySelector('.admin-only');
            if (adminTab) {
                adminTab.style.display = 'block';
            }
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const targetTab = document.querySelector(`[onclick*="${sectionId}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        this.currentSection = sectionId;

        // Initialize section-specific functionality
        this.initializeSection(sectionId);
    }

    initializeSection(sectionId) {
        switch (sectionId) {
            case 'admin-panel':
                if (window.adminManager) {
                    window.adminManager.loadAdminStats();
                }
                break;
            // Add other section initializations here
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
}

// Global functions for backwards compatibility
function showSection(sectionId) {
    if (window.vibrationApp) {
        window.vibrationApp.showSection(sectionId);
    }
}

function closeModal(modalId) {
    if (window.vibrationApp) {
        window.vibrationApp.closeModal(modalId);
    }
}

function showModal(modalId) {
    if (window.vibrationApp) {
        window.vibrationApp.showModal(modalId);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (authManager.isAuthenticated()) {
        window.vibrationApp = new VibrationMonitoringApp();
    }
});