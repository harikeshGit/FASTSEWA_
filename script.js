// ====== UTILITY FUNCTIONS ======
class Utils {
    static sanitizeInput(data) {
        if (typeof data !== 'string') return data;
        return data
            .trim()
            .replace(/[<>]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
        return usernameRegex.test(username);
    }

    static getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static formatTime(date) {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static showLoading(button) {
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }
    }

    static hideLoading(button) {
        if (button) {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    static getGravatar(email, size = 80) {
        const hash = md5(email.trim().toLowerCase());
        return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=pg`;
    }
}

// ====== NOTIFICATION SYSTEM ======
class NotificationSystem {
    static show(message, type = 'info', duration = 5000) {
        // Remove existing notification
        const existing = document.getElementById('system-notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'system-notification';
        notification.className = `notification ${type} show`;

        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        notification.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        `;

        document.body.appendChild(notification);

        // Add close button event
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => this.hide(notification));

        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hide(notification), duration);
        }

        return notification;
    }

    static hide(notification) {
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    static showInContainer(message, type = 'info', containerId = 'messages') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 5000);
    }
}

// ====== FORM VALIDATION ======
class FormValidator {
    static validateLoginForm() {
        let isValid = true;
        const username = document.getElementById('loginUsername');
        const password = document.getElementById('loginPassword');

        // Clear previous errors
        this.clearErrors(['loginUsernameError', 'loginPasswordError']);

        // Validate username/email
        if (!username.value.trim()) {
            this.showError('loginUsernameError', 'Username or email is required');
            isValid = false;
        } else if (!Utils.validateEmail(username.value) && !Utils.validateUsername(username.value)) {
            this.showError('loginUsernameError', 'Please enter a valid email or username');
            isValid = false;
        }

        // Validate password
        if (!password.value) {
            this.showError('loginPasswordError', 'Password is required');
            isValid = false;
        } else if (password.value.length < 6) {
            this.showError('loginPasswordError', 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    static validateRegistrationForm() {
        let isValid = true;

        // Get form elements
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('registerEmail');
        const username = document.getElementById('registerUsername');
        const password = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const userType = document.getElementById('userType');
        const terms = document.getElementById('terms');

        // Clear previous errors
        this.clearErrors([
            'firstNameError', 'lastNameError', 'registerEmailError',
            'registerUsernameError', 'registerPasswordError',
            'confirmPasswordError', 'userTypeError', 'termsError'
        ]);

        // Validate first name
        if (!firstName.value.trim()) {
            this.showError('firstNameError', 'First name is required');
            isValid = false;
        }

        // Validate last name
        if (!lastName.value.trim()) {
            this.showError('lastNameError', 'Last name is required');
            isValid = false;
        }

        // Validate email
        if (!email.value.trim()) {
            this.showError('registerEmailError', 'Email is required');
            isValid = false;
        } else if (!Utils.validateEmail(email.value)) {
            this.showError('registerEmailError', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate username
        if (!username.value.trim()) {
            this.showError('registerUsernameError', 'Username is required');
            isValid = false;
        } else if (!Utils.validateUsername(username.value)) {
            this.showError('registerUsernameError', 'Username must be 3-30 characters (letters, numbers, _, .)');
            isValid = false;
        }

        // Validate password
        if (!password.value) {
            this.showError('registerPasswordError', 'Password is required');
            isValid = false;
        } else if (password.value.length < 6) {
            this.showError('registerPasswordError', 'Password must be at least 6 characters');
            isValid = false;
        }

        // Validate confirm password
        if (!confirmPassword.value) {
            this.showError('confirmPasswordError', 'Please confirm your password');
            isValid = false;
        } else if (password.value !== confirmPassword.value) {
            this.showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }

        // Validate user type
        if (!userType.value) {
            this.showError('userTypeError', 'Please select an account type');
            isValid = false;
        }

        // Validate terms
        if (!terms.checked) {
            this.showError('termsError', 'You must agree to the terms and conditions');
            isValid = false;
        }

        return isValid;
    }

    static showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    static clearErrors(elementIds) {
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '';
                element.classList.remove('show');
            }
        });
    }
}

// ====== AUTHENTICATION SYSTEM ======
class AuthSystem {
    static users = JSON.parse(localStorage.getItem('fastsewa_users') || '[]');
    static currentUser = JSON.parse(localStorage.getItem('fastsewa_current_user') || 'null');

    static register(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if email already exists
                const emailExists = this.users.some(user =>
                    user.email.toLowerCase() === userData.email.toLowerCase()
                );

                if (emailExists) {
                    reject({ success: false, message: 'Email already registered' });
                    return;
                }

                // Check if username already exists
                const usernameExists = this.users.some(user =>
                    user.username.toLowerCase() === userData.username.toLowerCase()
                );

                if (usernameExists) {
                    reject({ success: false, message: 'Username already taken' });
                    return;
                }

                // Create new user
                const newUser = {
                    id: Date.now().toString(),
                    ...userData,
                    created_at: new Date().toISOString(),
                    last_login: null,
                    is_active: true
                };

                this.users.push(newUser);
                localStorage.setItem('fastsewa_users', JSON.stringify(this.users));

                resolve({
                    success: true,
                    message: 'Registration successful! Please login.',
                    user: newUser
                });
            }, 1000); // Simulate API delay
        });
    }

    static login(identifier, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Find user by email or username
                const user = this.users.find(user =>
                    user.email.toLowerCase() === identifier.toLowerCase() ||
                    user.username.toLowerCase() === identifier.toLowerCase()
                );

                if (!user) {
                    reject({ success: false, message: 'User not found' });
                    return;
                }

                // Check password (in real app, this would compare hashed passwords)
                if (password !== user.password) {
                    reject({ success: false, message: 'Invalid password' });
                    return;
                }

                if (!user.is_active) {
                    reject({ success: false, message: 'Account is disabled' });
                    return;
                }

                // Update last login
                user.last_login = new Date().toISOString();
                localStorage.setItem('fastsewa_users', JSON.stringify(this.users));

                // Set current user
                this.currentUser = user;
                localStorage.setItem('fastsewa_current_user', JSON.stringify(user));

                resolve({
                    success: true,
                    message: 'Login successful!',
                    user
                });
            }, 1000); // Simulate API delay
        });
    }

    static logout() {
        this.currentUser = null;
        localStorage.removeItem('fastsewa_current_user');
        return { success: true, message: 'Logged out successfully' };
    }

    static isLoggedIn() {
        return this.currentUser !== null;
    }

    static getUser() {
        return this.currentUser;
    }

    static updateUser(userData) {
        const index = this.users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...userData };
            this.currentUser = this.users[index];
            localStorage.setItem('fastsewa_users', JSON.stringify(this.users));
            localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
            return { success: true, message: 'Profile updated successfully' };
        }
        return { success: false, message: 'User not found' };
    }
}

// ====== DASHBOARD DATA ======
class DashboardData {
    static getStats() {
        return {
            totalBookings: 24,
            completedServices: 18,
            pendingRequests: 6,
            userRating: 4.8
        };
    }

    static getRecentBookings() {
        return [
            {
                id: 1,
                service: 'Plumbing Repair',
                provider: 'John Plumbing',
                date: '2024-01-15',
                status: 'completed',
                amount: '$75'
            },
            {
                id: 2,
                service: 'Electrical Wiring',
                provider: 'Safe Electric',
                date: '2024-01-16',
                status: 'confirmed',
                amount: '$120'
            },
            {
                id: 3,
                service: 'Home Cleaning',
                provider: 'Clean Masters',
                date: '2024-01-17',
                status: 'pending',
                amount: '$65'
            },
            {
                id: 4,
                service: 'AC Repair',
                provider: 'Cool Solutions',
                date: '2024-01-18',
                status: 'cancelled',
                amount: '$90'
            }
        ];
    }

    static getServiceCategories() {
        return [
            { id: 1, name: 'Plumbing', icon: 'fa-tint' },
            { id: 2, name: 'Electrical', icon: 'fa-bolt' },
            { id: 3, name: 'Cleaning', icon: 'fa-broom' },
            { id: 4, name: 'Repair', icon: 'fa-tools' },
            { id: 5, name: 'Carpentry', icon: 'fa-hammer' },
            { id: 6, name: 'Painting', icon: 'fa-paint-roller' },
            { id: 7, name: 'Moving', icon: 'fa-truck-moving' },
            { id: 8, name: 'Gardening', icon: 'fa-leaf' }
        ];
    }
}

// ====== DOM EVENT HANDLERS ======
class EventHandlers {
    static init() {
        // Show/hide password functionality
        document.querySelectorAll('.show-password').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.target.closest('button').dataset.target;
                const input = document.getElementById(targetId);
                if (input) {
                    const type = input.type === 'password' ? 'text' : 'password';
                    input.type = type;
                    const icon = button.querySelector('i');
                    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
                }
            });
        });

        // Password strength indicator
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const strength = Utils.getPasswordStrength(e.target.value);
                const indicator = document.getElementById('passwordStrength');
                if (indicator) {
                    indicator.className = 'password-strength';
                    if (e.target.value.length === 0) return;

                    if (strength < 3) {
                        indicator.classList.add('weak');
                    } else if (strength < 5) {
                        indicator.classList.add('medium');
                    } else {
                        indicator.classList.add('strong');
                    }
                }
            });
        }

        // Modal handlers
        this.initModals();

        // Form handlers
        this.initForms();

        // Dashboard handlers
        this.initDashboard();

        // Check for remembered user
        this.checkRememberedUser();

        // Update current time
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 60000);
    }

    static initModals() {
        // Forgot password modal
        const forgotPasswordBtn = document.getElementById('forgotPassword');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('forgotPasswordModal').classList.add('show');
            });
        }

        // Terms and privacy modals
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

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.classList.remove('show');
                });
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('show');
                }
            });
        });

        // Send reset link
        const sendResetLinkBtn = document.getElementById('sendResetLink');
        if (sendResetLinkBtn) {
            sendResetLinkBtn.addEventListener('click', async () => {
                const email = document.getElementById('resetEmail').value;
                const errorElement = document.getElementById('resetEmailError');

                // Clear previous error
                errorElement.textContent = '';
                errorElement.classList.remove('show');

                // Validate email
                if (!email) {
                    errorElement.textContent = 'Email is required';
                    errorElement.classList.add('show');
                    return;
                }

                if (!Utils.validateEmail(email)) {
                    errorElement.textContent = 'Please enter a valid email address';
                    errorElement.classList.add('show');
                    return;
                }

                // Show loading
                sendResetLinkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                sendResetLinkBtn.disabled = true;

                // Simulate API call
                setTimeout(() => {
                    NotificationSystem.show('Reset link sent to your email!', 'success');
                    document.getElementById('forgotPasswordModal').classList.remove('show');
                    document.getElementById('resetEmail').value = '';

                    // Reset button
                    sendResetLinkBtn.innerHTML = 'Send Reset Link';
                    sendResetLinkBtn.disabled = false;
                }, 1500);
            });
        }
    }

    static initForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!FormValidator.validateLoginForm()) {
                    return;
                }

                const button = loginForm.querySelector('.auth-btn');
                Utils.showLoading(button);

                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                const remember = document.getElementById('remember')?.checked;

                try {
                    const result = await AuthSystem.login(username, password);

                    // Remember user if checked
                    if (remember) {
                        localStorage.setItem('remembered_user', username);
                    }

                    NotificationSystem.show(result.message, 'success');

                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);

                } catch (error) {
                    NotificationSystem.show(error.message, 'error');
                    Utils.hideLoading(button);
                }
            });
        }

        // Registration form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!FormValidator.validateRegistrationForm()) {
                    return;
                }

                const button = registerForm.querySelector('.auth-btn');
                Utils.showLoading(button);

                const userData = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('registerEmail').value,
                    username: document.getElementById('registerUsername').value,
                    password: document.getElementById('registerPassword').value,
                    userType: document.getElementById('userType').value
                };

                try {
                    const result = await AuthSystem.register(userData);

                    NotificationSystem.show(result.message, 'success');

                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = 'index.html?registered=true';
                    }, 2000);

                } catch (error) {
                    NotificationSystem.show(error.message, 'error');
                    Utils.hideLoading(button);
                }
            });
        }
    }

    static initDashboard() {
        // Only run on dashboard page
        if (!window.location.pathname.includes('dashboard.html')) return;

        // Check if user is logged in
        if (!AuthSystem.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // Load user data
        this.loadUserData();

        // Load dashboard data
        this.loadDashboardData();

        // Setup event listeners
        this.setupDashboardEvents();
    }

    static loadUserData() {
        const user = AuthSystem.getUser();
        if (user) {
            // Update welcome message
            const welcomeName = document.getElementById('welcomeName');
            if (welcomeName) {
                welcomeName.textContent = user.firstName;
            }

            // Update user name in navbar
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = `${user.firstName} ${user.lastName}`;
            }
        }
    }

    static loadDashboardData() {
        // Load stats
        const stats = DashboardData.getStats();
        document.getElementById('totalBookings').textContent = stats.totalBookings;
        document.getElementById('completedServices').textContent = stats.completedServices;
        document.getElementById('pendingRequests').textContent = stats.pendingRequests;
        document.getElementById('userRating').textContent = stats.userRating;

        // Load recent bookings
        const bookings = DashboardData.getRecentBookings();
        const bookingsTable = document.getElementById('recentBookings');
        if (bookingsTable) {
            bookingsTable.innerHTML = bookings.map(booking => `
                <tr>
                    <td>${booking.service}</td>
                    <td>${booking.provider}</td>
                    <td>${booking.date}</td>
                    <td><span class="status ${booking.status}">${booking.status}</span></td>
                    <td>${booking.amount}</td>
                </tr>
            `).join('');
        }

        // Load service categories
        const categories = DashboardData.getServiceCategories();
        const categoriesContainer = document.getElementById('serviceCategories');
        if (categoriesContainer) {
            categoriesContainer.innerHTML = categories.map(category => `
                <div class="category-card" data-category="${category.name}">
                    <i class="fas ${category.icon}"></i>
                    <span>${category.name}</span>
                </div>
            `).join('');

            // Add click event to categories
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', () => {
                    const category = card.dataset.category;
                    NotificationSystem.show(`Selected: ${category} services`, 'info');
                });
            });
        }
    }

    static setupDashboardEvents() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthSystem.logout();
                NotificationSystem.show('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            });
        }

        // Book service button
        const bookServiceBtn = document.getElementById('bookServiceBtn');
        if (bookServiceBtn) {
            bookServiceBtn.addEventListener('click', () => {
                document.getElementById('bookServiceModal').classList.add('show');
            });
        }

        // Confirm booking
        const confirmBookingBtn = document.getElementById('confirmBooking');
        if (confirmBookingBtn) {
            confirmBookingBtn.addEventListener('click', () => {
                const serviceType = document.getElementById('serviceType').value;
                const serviceDate = document.getElementById('serviceDate').value;
                const serviceTime = document.getElementById('serviceTime').value;

                if (!serviceType || !serviceDate || !serviceTime) {
                    NotificationSystem.show('Please fill all required fields', 'error');
                    return;
                }

                // Simulate booking
                NotificationSystem.show('Service booked successfully!', 'success');
                document.getElementById('bookServiceModal').classList.remove('show');

                // Reset form
                document.getElementById('bookServiceForm').reset();
            });
        }

        // Quick action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.querySelector('span').textContent;
                NotificationSystem.show(`${action} feature would be implemented here`, 'info');
            });
        });
    }

    static checkRememberedUser() {
        const rememberedUser = localStorage.getItem('remembered_user');
        const loginUsername = document.getElementById('loginUsername');
        const rememberCheckbox = document.getElementById('remember');

        if (rememberedUser && loginUsername && rememberCheckbox) {
            loginUsername.value = rememberedUser;
            rememberCheckbox.checked = true;
        }
    }

    static updateCurrentTime() {
        const currentTimeElement = document.getElementById('currentTime');
        if (currentTimeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            const dateString = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            currentTimeElement.textContent = `${dateString} • ${timeString}`;
        }
    }
}

// ====== URL PARAMETER HANDLING ======
class URLHandler {
    static getParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }

    static showMessagesFromParams() {
        const params = this.getParams();

        if (params.registered === 'true') {
            NotificationSystem.show('Registration successful! Please login.', 'success');

            // Clean URL
            const url = new URL(window.location);
            url.searchParams.delete('registered');
            window.history.replaceState({}, '', url);
        }

        if (params.error) {
            NotificationSystem.show(decodeURIComponent(params.error), 'error');

            // Clean URL
            const url = new URL(window.location);
            url.searchParams.delete('error');
            window.history.replaceState({}, '', url);
        }

        if (params.success) {
            NotificationSystem.show(decodeURIComponent(params.success), 'success');

            // Clean URL
            const url = new URL(window.location);
            url.searchParams.delete('success');
            window.history.replaceState({}, '', url);
        }
    }
}

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all event handlers
    EventHandlers.init();

    // Handle URL parameters
    URLHandler.showMessagesFromParams();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl + Enter to submit forms
        if (e.ctrlKey && e.key === 'Enter') {
            const activeForm = document.querySelector('form');
            if (activeForm) {
                activeForm.dispatchEvent(new Event('submit'));
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.show').forEach(modal => {
                modal.classList.remove('show');
            });
        }

        // F1 for help
        if (e.key === 'F1') {
            e.preventDefault();
            NotificationSystem.show('Press Ctrl+Enter to submit forms, Escape to close modals', 'info');
        }
    });

    // Add service worker for offline capability
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
        });
    }
});

// ====== SERVICE WORKER ======
// This would be in a separate sw.js file in production
const serviceWorkerCode = `
// Service Worker for offline capability
const CACHE_NAME = 'fastsewa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/register.html',
    '/dashboard.html',
    '/style.css',
    '/script.js',
    '/images/hari.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
`;

// ====== MD5 HASH FUNCTION (for Gravatar) ======
function md5(inputString) {
    // Simple MD5 implementation for demo purposes
    // In production, use a proper MD5 library
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// Export for testing/development
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        NotificationSystem,
        FormValidator,
        AuthSystem,
        DashboardData,
        EventHandlers,
        URLHandler
    };
}