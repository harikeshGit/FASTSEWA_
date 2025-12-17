// ================= API CONFIG =================
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
    static async request(endpoint, method = 'GET', body = null, auth = false) {
        const headers = { 'Content-Type': 'application/json' };

        if (auth) {
            const token = localStorage.getItem('fastsewa_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Server Error');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async uploadFile(endpoint, formData, auth = false) {
        const headers = {};
        
        if (auth) {
            const token = localStorage.getItem('fastsewa_token');
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            
            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    }
}

// ================= AUTH SYSTEM =================
class AuthSystem {
    static async register(userData) {
        try {
            return await ApiService.request('/auth/register', 'POST', userData);
        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    }

    static async login(email, password) {
        try {
            const res = await ApiService.request('/auth/login', 'POST', { email, password });
            
            if (res.success && res.token) {
                localStorage.setItem('fastsewa_token', res.token);
                localStorage.setItem('fastsewa_user', JSON.stringify(res.user));
                return res;
            }
            throw new Error('Invalid response from server');
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    }

    static logout() {
        localStorage.removeItem('fastsewa_token');
        localStorage.removeItem('fastsewa_user');
    }

    static isLoggedIn() {
        return !!localStorage.getItem('fastsewa_token');
    }

    static getUser() {
        const user = localStorage.getItem('fastsewa_user');
        return user ? JSON.parse(user) : null;
    }

    static isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }

    static async updateProfile(userData) {
        try {
            const user = this.getUser();
            return await ApiService.request(`/users/${user.id}`, 'PUT', userData, true);
        } catch (error) {
            throw new Error(error.message || 'Profile update failed');
        }
    }
}

// ================= DASHBOARD DATA =================
class DashboardData {
    static async getStats() {
        try {
            const response = await ApiService.request('/stats', 'GET');
            return response.stats || { totalUsers: 0, activeUsers: 0, usersToday: 0 };
        } catch (error) {
            console.error('Error fetching stats:', error);
            return { totalUsers: 0, activeUsers: 0, usersToday: 0 };
        }
    }

    static async getAllUsers() {
        try {
            if (!AuthSystem.isAdmin()) {
                throw new Error('Admin access required');
            }
            const response = await ApiService.request('/users', 'GET', null, true);
            return response.users || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    static async getCurrentUser() {
        try {
            const user = AuthSystem.getUser();
            if (!user) return null;
            
            const response = await ApiService.request(`/users/${user.id}`, 'GET', null, true);
            return response.user || user;
        } catch (error) {
            console.error('Error fetching user:', error);
            return AuthSystem.getUser();
        }
    }

    static async exportToExcel() {
        try {
            if (!AuthSystem.isAdmin()) {
                throw new Error('Admin access required');
            }
            return await ApiService.request('/export/users', 'POST', null, true);
        } catch (error) {
            console.error('Export error:', error);
            throw error;
        }
    }
}

// ================= FORM VALIDATION =================
class FormValidator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateName(name) {
        return name.length >= 2;
    }

    static validateUsername(username) {
        return username.length >= 3;
    }

    static showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    static hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    static validateRegistrationForm(formData) {
        const errors = [];

        if (!this.validateName(formData.firstName)) {
            errors.push('First name must be at least 2 characters');
        }

        if (!this.validateName(formData.lastName)) {
            errors.push('Last name must be at least 2 characters');
        }

        if (!this.validateEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!this.validateUsername(formData.username)) {
            errors.push('Username must be at least 3 characters');
        }

        if (!this.validatePassword(formData.password)) {
            errors.push('Password must be at least 6 characters');
        }

        if (formData.password !== formData.confirmPassword) {
            errors.push('Passwords do not match');
        }

        if (!formData.userType) {
            errors.push('Please select an account type');
        }

        return errors;
    }

    static validateLoginForm(email, password) {
        const errors = [];

        if (!email) {
            errors.push('Email is required');
        } else if (!this.validateEmail(email)) {
            errors.push('Please enter a valid email');
        }

        if (!password) {
            errors.push('Password is required');
        }

        return errors;
    }
}

// ================= NOTIFICATION SYSTEM =================
class Notification {
    static show(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);

        return notification;
    }

    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    static hideAll() {
        document.querySelectorAll('.notification').forEach(notification => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }
}

// ================= EVENT HANDLERS =================
class EventHandlers {
    static init() {
        this.initForms();
        this.initDashboard();
        this.initModals();
        this.initPasswordVisibility();
        this.initPasswordStrength();
        this.checkAuth();
    }

    static initForms() {
        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = loginForm.loginUsername?.value || document.getElementById('loginUsername')?.value;
                const password = loginForm.loginPassword?.value || document.getElementById('loginPassword')?.value;
                
                // Clear previous errors
                FormValidator.hideError('loginUsernameError');
                FormValidator.hideError('loginPasswordError');
                
                // Validate
                const errors = FormValidator.validateLoginForm(email, password);
                if (errors.length > 0) {
                    errors.forEach(error => {
                        if (error.includes('Email')) {
                            FormValidator.showError('loginUsernameError', error);
                        } else {
                            FormValidator.showError('loginPasswordError', error);
                        }
                    });
                    return;
                }
                
                // Show loading state
                const submitBtn = loginForm.querySelector('.auth-btn');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                }
                
                try {
                    await AuthSystem.login(email, password);
                    
                    Notification.show('Login successful! Redirecting...', 'success');
                    
                    // Check if user is admin
                    const user = AuthSystem.getUser();
                    if (user && user.role === 'admin') {
                        setTimeout(() => {
                            window.location.href = 'admin.html';
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    }
                    
                } catch (error) {
                    FormValidator.showError('loginPasswordError', error.message || 'Invalid email or password');
                    Notification.show(error.message || 'Login failed', 'error');
                } finally {
                    // Reset loading state
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }
                }
            });
        }

        // Register Form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = {
                    firstName: registerForm.firstName.value,
                    lastName: registerForm.lastName.value,
                    email: registerForm.registerEmail.value,
                    username: registerForm.registerUsername.value,
                    password: registerForm.registerPassword.value,
                    confirmPassword: registerForm.confirmPassword.value,
                    userType: registerForm.userType.value
                };
                
                // Clear previous errors
                ['firstNameError', 'lastNameError', 'registerEmailError', 'registerUsernameError', 
                 'registerPasswordError', 'confirmPasswordError', 'userTypeError'].forEach(id => {
                    FormValidator.hideError(id);
                });
                
                // Validate
                const errors = FormValidator.validateRegistrationForm(formData);
                if (errors.length > 0) {
                    errors.forEach(error => {
                        if (error.includes('First name')) FormValidator.showError('firstNameError', error);
                        else if (error.includes('Last name')) FormValidator.showError('lastNameError', error);
                        else if (error.includes('email')) FormValidator.showError('registerEmailError', error);
                        else if (error.includes('Username')) FormValidator.showError('registerUsernameError', error);
                        else if (error.includes('Password')) FormValidator.showError('registerPasswordError', error);
                        else if (error.includes('match')) FormValidator.showError('confirmPasswordError', error);
                        else if (error.includes('account type')) FormValidator.showError('userTypeError', error);
                    });
                    return;
                }
                
                // Show loading state
                const submitBtn = registerForm.querySelector('.auth-btn');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                }
                
                try {
                    // Remove confirmPassword before sending
                    const { confirmPassword, ...dataToSend } = formData;
                    
                    const response = await AuthSystem.register(dataToSend);
                    
                    Notification.show('Registration successful! Please login.', 'success');
                    
                    // Redirect to login after delay
                    setTimeout(() => {
                        window.location.href = 'index.html?registered=true';
                    }, 1500);
                    
                } catch (error) {
                    if (error.message.includes('Email already')) {
                        FormValidator.showError('registerEmailError', error.message);
                    } else {
                        FormValidator.showError('registerPasswordError', error.message || 'Registration failed');
                    }
                    Notification.show(error.message || 'Registration failed', 'error');
                } finally {
                    // Reset loading state
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }
                }
            });
        }

        // Forgot Password Form
        const forgotPasswordBtn = document.getElementById('sendResetLink');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', async () => {
                const email = document.getElementById('resetEmail')?.value;
                if (!email || !FormValidator.validateEmail(email)) {
                    Notification.show('Please enter a valid email address', 'error');
                    return;
                }
                
                // In a real app, you would call an API here
                Notification.show('Password reset link sent to your email', 'success');
                
                // Close modal after delay
                setTimeout(() => {
                    document.querySelector('#forgotPasswordModal .close-modal')?.click();
                }, 2000);
            });
        }
    }

    static initDashboard() {
        if (!window.location.pathname.includes('dashboard.html') && 
            !window.location.pathname.includes('admin.html')) return;

        // Check authentication
        if (!AuthSystem.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // Load user data
        this.loadUserData();
        
        // Load dashboard data
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadDashboardData();
        }
        
        // Load admin data
        if (window.location.pathname.includes('admin.html')) {
            if (!AuthSystem.isAdmin()) {
                window.location.href = 'dashboard.html';
                return;
            }
            this.loadAdminData();
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthSystem.logout();
                window.location.href = 'index.html';
            });
        }

        // Update time every minute
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
    }

    static async loadUserData() {
        try {
            const user = await DashboardData.getCurrentUser();
            if (!user) {
                AuthSystem.logout();
                window.location.href = 'index.html';
                return;
            }

            // Update UI elements
            const elements = {
                'welcomeName': user.firstName || user.username,
                'userName': `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
                'userEmail': user.email,
                'userRole': user.role || 'user'
            };

            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && value) {
                    element.textContent = value;
                }
            });

        } catch (error) {
            console.error('Error loading user data:', error);
            Notification.show('Failed to load user data', 'error');
        }
    }

    static async loadDashboardData() {
        try {
            // Load stats
            const stats = await DashboardData.getStats();
            
            const statElements = {
                'totalBookings': stats.totalUsers || 0,
                'completedServices': stats.activeUsers || 0,
                'pendingRequests': stats.usersToday || 0,
                'userRating': '4.5' // Default rating
            };

            Object.entries(statElements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

            // Load recent bookings (mock data for now)
            this.loadMockBookings();

            // Load service categories (mock data)
            this.loadServiceCategories();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Notification.show('Failed to load dashboard data', 'error');
        }
    }

    static async loadAdminData() {
        try {
            // Load users
            const users = await DashboardData.getAllUsers();
            this.renderUsersTable(users);
            
            // Load stats
            const stats = await DashboardData.getStats();
            this.renderAdminStats(stats);
            
        } catch (error) {
            console.error('Error loading admin data:', error);
            Notification.show('Failed to load admin data', 'error');
        }
    }

    static renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id || 'N/A'}</td>
                <td>${user.username || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="role-${user.role || 'user'}">${user.role || 'user'}</span></td>
                <td><span class="status-${user.isActive ? 'active' : 'inactive'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span></td>
                <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="btn btn-primary" onclick="AdminControls.viewUser(${user.id})" style="padding: 5px 10px;">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger" onclick="AdminControls.toggleUserStatus(${user.id}, ${!user.isActive})" style="padding: 5px 10px;">
                        <i class="fas fa-power-off"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    static renderAdminStats(stats) {
        const container = document.getElementById('statsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Total Users</div>
                <div class="stat-value">${stats.totalUsers || 0}</div>
                <i class="fas fa-users fa-2x" style="color: #3498db;"></i>
            </div>
            <div class="stat-card">
                <div class="stat-label">Active Users</div>
                <div class="stat-value">${stats.activeUsers || 0}</div>
                <i class="fas fa-user-check fa-2x" style="color: #2ecc71;"></i>
            </div>
            <div class="stat-card">
                <div class="stat-label">New Today</div>
                <div class="stat-value">${stats.usersToday || 0}</div>
                <i class="fas fa-user-plus fa-2x" style="color: #9b59b6;"></i>
            </div>
            <div class="stat-card">
                <div class="stat-label">Export Ready</div>
                <div class="stat-value">${stats.totalUsers || 0}</div>
                <i class="fas fa-file-excel fa-2x" style="color: #f39c12;"></i>
            </div>
        `;
    }

    static loadMockBookings() {
        const bookings = [
            { service: 'Plumbing Repair', provider: 'John Plumbing', date: '2024-01-15', status: 'completed', amount: '500' },
            { service: 'Electrical Work', provider: 'Spark Electric', date: '2024-01-14', status: 'confirmed', amount: '750' },
            { service: 'Cleaning Service', provider: 'Clean Pro', date: '2024-01-13', status: 'pending', amount: '300' },
            { service: 'AC Repair', provider: 'Cool Air', date: '2024-01-12', status: 'completed', amount: '1200' }
        ];

        const tbody = document.getElementById('recentBookings');
        if (!tbody) return;

        tbody.innerHTML = bookings.map(booking => `
            <tr>
                <td>${booking.service}</td>
                <td>${booking.provider}</td>
                <td>${booking.date}</td>
                <td><span class="status ${booking.status}">${booking.status}</span></td>
                <td>₹${booking.amount}</td>
            </tr>
        `).join('');
    }

    static loadServiceCategories() {
        const categories = [
            { name: 'Plumbing', icon: 'fa-faucet' },
            { name: 'Electrical', icon: 'fa-bolt' },
            { name: 'Cleaning', icon: 'fa-broom' },
            { name: 'Repair', icon: 'fa-tools' },
            { name: 'Painting', icon: 'fa-paint-roller' },
            { name: 'Carpentry', icon: 'fa-hammer' }
        ];

        const container = document.getElementById('serviceCategories');
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <div class="category-card">
                <i class="fas ${category.icon}"></i>
                <span>${category.name}</span>
            </div>
        `).join('');
    }

    static initModals() {
        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Forgot password link
        const forgotPasswordLink = document.getElementById('forgotPassword');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('forgotPasswordModal');
                if (modal) {
                    modal.classList.add('show');
                }
            });
        }

        // Terms and Privacy links
        const termsLink = document.getElementById('termsLink');
        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('termsModal').classList.add('show');
            });
        }

        const privacyLink = document.getElementById('privacyLink');
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('privacyModal').classList.add('show');
            });
        }
    }

    static initPasswordVisibility() {
        document.querySelectorAll('.show-password').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (input) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    } else {
                        input.type = 'password';
                        button.innerHTML = '<i class="fas fa-eye"></i>';
                    }
                }
            });
        });
    }

    static initPasswordStrength() {
        const passwordInput = document.getElementById('registerPassword');
        const strengthBar = document.getElementById('passwordStrength');
        
        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                let strength = '';
                
                if (password.length === 0) {
                    strength = '';
                } else if (password.length < 6) {
                    strength = 'weak';
                } else if (password.length < 10) {
                    strength = 'medium';
                } else {
                    strength = 'strong';
                }
                
                strengthBar.className = 'password-strength ' + strength;
            });
        }
    }

    static checkAuth() {
        // Check for registered parameter
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('registered') === 'true') {
            Notification.show('Registration successful! Please login.', 'success');
            // Remove parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Check for logged out parameter
        if (urlParams.get('logout') === 'true') {
            Notification.show('Logged out successfully', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    static updateTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}

// ================= ADMIN CONTROLS =================
class AdminControls {
    static async exportAllUsers() {
        try {
            if (!AuthSystem.isAdmin()) {
                Notification.show('Admin access required', 'error');
                return;
            }
            
            Notification.show('Exporting users...', 'info');
            
            const response = await DashboardData.exportToExcel();
            
            if (response.success && response.file) {
                // Show download modal or auto-download
                const modal = document.getElementById('exportModal');
                const exportDetails = document.getElementById('exportDetails');
                
                if (modal && exportDetails) {
                    exportDetails.innerHTML = `
                        <div style="line-height: 2;">
                            <p><strong>File:</strong> ${response.file.filename}</p>
                            <p><strong>Records:</strong> ${response.file.count}</p>
                            <p><strong>Status:</strong> Export completed successfully</p>
                            <div class="btn-group">
                                <button class="btn btn-success" onclick="AdminControls.downloadFile('${response.file.filename}')">
                                    <i class="fas fa-download"></i> Download Now
                                </button>
                                <button class="btn btn-primary" onclick="AdminControls.closeModal('exportModal')">
                                    Close
                                </button>
                            </div>
                        </div>
                    `;
                    modal.style.display = 'flex';
                }
                
                Notification.show('Export completed successfully', 'success');
            }
            
        } catch (error) {
            console.error('Export error:', error);
            Notification.show(error.message || 'Export failed', 'error');
        }
    }

    static downloadFile(filename) {
        window.open(`${API_BASE_URL}/download/${filename}`, '_blank');
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    static viewUser(userId) {
        // Implement user view modal
        Notification.show('User details view not implemented yet', 'info');
    }

    static toggleUserStatus(userId, newStatus) {
        if (!confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) {
            return;
        }
        
        Notification.show('User status updated', 'success');
        // In a real app, you would call an API here
    }

    static applyFilters() {
        Notification.show('Filters applied', 'success');
    }

    static refreshData() {
        EventHandlers.loadAdminData();
        Notification.show('Data refreshed', 'success');
    }
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
    EventHandlers.init();
    
    // Make AdminControls available globally
    window.AdminControls = AdminControls;
    window.AuthSystem = AuthSystem;
    window.DashboardData = DashboardData;
});

// ================= GLOBAL FUNCTIONS =================
function exportAllUsers() {
    AdminControls.exportAllUsers();
}

function exportFilteredUsers() {
    Notification.show('Filtered export not implemented yet', 'info');
}

function applyFilters() {
    AdminControls.applyFilters();
}

function refreshData() {
    AdminControls.refreshData();
}

function viewUser(userId) {
    AdminControls.viewUser(userId);
}

function toggleUserStatus(userId, newStatus) {
    AdminControls.toggleUserStatus(userId, newStatus);
}

function downloadFile(filename) {
    AdminControls.downloadFile(filename);
}