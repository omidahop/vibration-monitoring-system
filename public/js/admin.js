class AdminManager {
    constructor() {
        this.currentTab = 'pending-users';
        this.currentPage = 1;
        this.pageSize = 10;
        this.filters = {
            status: '',
            role: '',
            dateFrom: '',
            dateTo: '',
            action: ''
        };
        this.init();
    }

    init() {
        this.loadAdminStats();
        this.loadPendingUsers();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadAdminStats();
            if (this.currentTab === 'pending-users') {
                this.loadPendingUsers();
            }
        }, 30000);
    }

    async loadAdminStats() {
        try {
            const response = await authManager.makeAuthenticatedRequest('/admin/stats');
            if (response) {
                const result = await response.json();
                if (result.success) {
                    this.updateStatsDisplay(result.data);
                }
            }
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        const pendingUsersCount = document.getElementById('pendingUsersCount');
        const activeUsersCount = document.getElementById('activeUsersCount');
        const todayDataCount = document.getElementById('todayDataCount');
        const alertsCount = document.getElementById('alertsCount');
        
        if (pendingUsersCount) pendingUsersCount.textContent = stats.pendingUsers || 0;
        if (activeUsersCount) activeUsersCount.textContent = stats.activeUsers || 0;
        if (todayDataCount) todayDataCount.textContent = stats.todayData || 0;
        if (alertsCount) alertsCount.textContent = stats.alerts || 0;

        // Update badge
        const badge = document.getElementById('pendingBadge');
        const pendingCount = stats.pendingUsers || 0;
        if (badge) {
            badge.textContent = pendingCount;
            badge.className = pendingCount > 0 ? 'badge' : 'badge zero';
        }
    }

    async loadPendingUsers() {
        try {
            const response = await authManager.makeAuthenticatedRequest('/admin/pending-users');
            if (response) {
                const result = await response.json();
                if (result.success) {
                    this.renderPendingUsers(result.data);
                }
            }
        } catch (error) {
            console.error('Error loading pending users:', error);
        }
    }

    renderPendingUsers(users) {
        const container = document.getElementById('pendingUsersList');
        
        if (!container) return;
        
        if (users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                    <h3>درخواستی وجود ندارد</h3>
                    <p>همه درخواست‌های ثبت‌نام بررسی شده‌اند</p>
                </div>
            `;
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="pending-user-card">
                <div class="pending-user-header">
                    <div class="pending-user-info">
                        <div class="pending-user-avatar">
                            ${user.full_name.charAt(0)}
                        </div>
                        <div class="pending-user-details">
                            <h4>${user.full_name}</h4>
                            <p>@${user.username}</p>
                        </div>
                    </div>
                    <div class="pending-user-actions">
                        <button class="btn btn-success btn-sm" onclick="adminManager.approveUser(${user.id})">
                            <i class="fas fa-check"></i>
                            تایید
                        </button>
                        <button class="btn btn-error btn-sm" onclick="adminManager.rejectUser(${user.id})">
                            <i class="fas fa-times"></i>
                            رد
                        </button>
                    </div>
                </div>
                <div class="pending-user-meta">
                    <div class="meta-item">
                        <div class="meta-label">سمت شغلی</div>
                        <div class="meta-value">${user.job_role || 'نامشخص'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">کد پرسنلی</div>
                        <div class="meta-value">${user.employee_id || 'ندارد'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">شیف کاری</div>
                        <div class="meta-value">${user.work_shift || 'نامشخص'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">تاریخ درخواست</div>
                        <div class="meta-value">${this.formatDate(user.created_at)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async approveUser(userId) {
        if (!confirm('آیا از تایید این کاربر اطمینان دارید؟')) return;

        try {
            const response = await authManager.makeAuthenticatedRequest('/admin/users', {
                method: 'PUT',
                body: JSON.stringify({
                    userId,
                    action: 'approve'
                })
            });

            if (response) {
                const result = await response.json();
                if (result.success) {
                    showNotification('کاربر با موفقیت تایید شد', 'success');
                    this.loadPendingUsers();
                    this.loadAdminStats();
                } else {
                    showNotification(result.error || 'خطا در تایید کاربر', 'error');
                }
            }
        } catch (error) {
            console.error('Error approving user:', error);
            showNotification('خطا در تایید کاربر', 'error');
        }
    }

    async rejectUser(userId) {
        if (!confirm('آیا از رد این کاربر اطمینان دارید؟ این عمل قابل بازگشت نیست!')) return;

        try {
            const response = await authManager.makeAuthenticatedRequest('/admin/users', {
                method: 'PUT',
                body: JSON.stringify({
                    userId,
                    action: 'reject'
                })
            });

            if (response) {
                const result = await response.json();
                if (result.success) {
                    showNotification('کاربر رد شد', 'success');
                    this.loadPendingUsers();
                    this.loadAdminStats();
                } else {
                    showNotification(result.error || 'خطا در رد کاربر', 'error');
                }
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            showNotification('خطا در رد کاربر', 'error');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR');
    }
}

// Tab management functions
function showAdminTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetBtn = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.admin-tabs .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(`${tabName}-tab`);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Load appropriate data
    if (window.adminManager) {
        window.adminManager.currentTab = tabName;
        
        switch (tabName) {
            case 'pending-users':
                window.adminManager.loadPendingUsers();
                break;
            case 'all-users':
                if (window.adminManager.loadAllUsers) {
                    window.adminManager.loadAllUsers();
                }
                break;
        }
    }
}

function refreshPendingUsers() {
    if (window.adminManager) {
        window.adminManager.loadPendingUsers();
    }
}

// Initialize admin manager for admin users
document.addEventListener('DOMContentLoaded', () => {
    if (authManager.hasRole('admin')) {
        window.adminManager = new AdminManager();
    }
});