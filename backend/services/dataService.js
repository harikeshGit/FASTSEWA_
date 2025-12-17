const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DATA_FILE = path.join(__dirname, '../data/users.json');
const BOOKINGS_FILE = path.join(__dirname, '../data/bookings.json');
const SERVICES_FILE = path.join(__dirname, '../data/services.json');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

class DataService {
    constructor() {
        this.users = [];
        this.bookings = [];
        this.services = [];
        this.initializeData();
    }

    // Initialize or load existing data
    async initializeData() {
        try {
            // Load users
            const usersData = await fs.readFile(DATA_FILE, 'utf8');
            this.users = JSON.parse(usersData);
            console.log(`📊 Loaded ${this.users.length} users from storage`);

            // Load bookings
            try {
                const bookingsData = await fs.readFile(BOOKINGS_FILE, 'utf8');
                this.bookings = JSON.parse(bookingsData);
                console.log(`📊 Loaded ${this.bookings.length} bookings from storage`);
            } catch (error) {
                this.bookings = [];
                await this.saveBookings();
            }

            // Load services
            try {
                const servicesData = await fs.readFile(SERVICES_FILE, 'utf8');
                this.services = JSON.parse(servicesData);
                console.log(`📊 Loaded ${this.services.length} services from storage`);
            } catch (error) {
                this.services = [
                    { id: 1, name: 'Web Development', description: 'Custom website development', price: 500, duration: 30 },
                    { id: 2, name: 'Mobile App', description: 'iOS and Android app development', price: 1000, duration: 60 },
                    { id: 3, name: 'SEO Services', description: 'Search engine optimization', price: 300, duration: 15 },
                    { id: 4, name: 'UI/UX Design', description: 'User interface and experience design', price: 400, duration: 45 }
                ];
                await this.saveServices();
            }

            // Create admin user if not exists
            const adminExists = this.users.find(u => u.role === 'admin');
            if (!adminExists) {
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                const adminUser = {
                    id: 1,
                    username: ADMIN_USERNAME,
                    email: 'admin@example.com',
                    password: hashedPassword,
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    profile: {
                        name: 'Administrator',
                        phone: '+1234567890'
                    }
                };
                
                this.users.push(adminUser);
                await this.saveData();
                console.log('👑 Default admin user created');
            }
        } catch (error) {
            // If file doesn't exist, create with default data
            if (error.code === 'ENOENT') {
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                const adminUser = {
                    id: 1,
                    username: ADMIN_USERNAME,
                    email: 'admin@example.com',
                    password: hashedPassword,
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    isActive: true,
                    profile: {
                        name: 'Administrator',
                        phone: '+1234567890'
                    }
                };
                
                this.users = [adminUser];
                this.bookings = [];
                this.services = [
                    { id: 1, name: 'Web Development', description: 'Custom website development', price: 500, duration: 30 },
                    { id: 2, name: 'Mobile App', description: 'iOS and Android app development', price: 1000, duration: 60 },
                    { id: 3, name: 'SEO Services', description: 'Search engine optimization', price: 300, duration: 15 },
                    { id: 4, name: 'UI/UX Design', description: 'User interface and experience design', price: 400, duration: 45 }
                ];
                
                await this.saveData();
                await this.saveBookings();
                await this.saveServices();
                console.log('📁 Created new data files with default admin user');
            } else {
                console.error('Error loading data:', error);
            }
        }
    }

    // Save users data to JSON file
    async saveData() {
        try {
            await fs.writeFile(DATA_FILE, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving users data:', error);
            throw error;
        }
    }

    // Save bookings data to JSON file
    async saveBookings() {
        try {
            await fs.writeFile(BOOKINGS_FILE, JSON.stringify(this.bookings, null, 2));
        } catch (error) {
            console.error('Error saving bookings data:', error);
            throw error;
        }
    }

    // Save services data to JSON file
    async saveServices() {
        try {
            await fs.writeFile(SERVICES_FILE, JSON.stringify(this.services, null, 2));
        } catch (error) {
            console.error('Error saving services data:', error);
            throw error;
        }
    }

    // Get all users
    async getAllUsers() {
        return this.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    // Get user by ID
    async getUserById(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    // Register new user
    async registerUser(userData) {
        // Check if email already exists
        const existingUser = this.users.find(u => u.email === userData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create new user
        const newUser = {
            id: Date.now(), // Simple ID generation
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            ...(userData.profile && { profile: userData.profile })
        };

        this.users.push(newUser);
        await this.saveData();

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    // Authenticate user
    async authenticateUser(email, password) {
        const user = this.users.find(u => u.email === email && u.isActive);
        
        if (!user) {
            throw new Error('User not found');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            token
        };
    }

    // Update user
    async updateUser(id, updates) {
        const userIndex = this.users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Don't allow updating password directly
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        this.users[userIndex] = {
            ...this.users[userIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveData();

        const { password, ...updatedUser } = this.users[userIndex];
        return updatedUser;
    }

    // Delete user (soft delete)
    async deleteUser(id) {
        const userIndex = this.users.findIndex(u => u.id === id);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        this.users[userIndex].isActive = false;
        this.users[userIndex].updatedAt = new Date().toISOString();
        
        await this.saveData();
        
        return { message: 'User deactivated successfully' };
    }

    // BOOKINGS MANAGEMENT
    async createBooking(bookingData) {
        const newBooking = {
            id: Date.now(),
            userId: bookingData.userId,
            serviceId: bookingData.serviceId,
            serviceName: bookingData.serviceName,
            userName: bookingData.userName,
            userEmail: bookingData.userEmail,
            bookingDate: bookingData.bookingDate || new Date().toISOString().split('T')[0],
            bookingTime: bookingData.bookingTime || new Date().toTimeString().split(' ')[0],
            status: bookingData.status || 'pending',
            amount: bookingData.amount || 0,
            price: bookingData.price || bookingData.amount || 0,
            paymentMethod: bookingData.paymentMethod || 'cash',
            paymentStatus: bookingData.paymentStatus || 'pending',
            notes: bookingData.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.bookings.push(newBooking);
        await this.saveBookings();
        return newBooking;
    }

    async getAllBookings() {
        return this.bookings.map(booking => ({
            ...booking,
            user: this.users.find(u => u.id === booking.userId)
        }));
    }

    async getBookingById(id) {
        return this.bookings.find(b => b.id === id);
    }

    async updateBooking(id, updates) {
        const bookingIndex = this.bookings.findIndex(b => b.id === id);
        
        if (bookingIndex === -1) {
            throw new Error('Booking not found');
        }

        this.bookings[bookingIndex] = {
            ...this.bookings[bookingIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        await this.saveBookings();
        return this.bookings[bookingIndex];
    }

    async deleteBooking(id) {
        const bookingIndex = this.bookings.findIndex(b => b.id === id);
        
        if (bookingIndex === -1) {
            throw new Error('Booking not found');
        }

        this.bookings.splice(bookingIndex, 1);
        await this.saveBookings();
        
        return { message: 'Booking deleted successfully' };
    }

    // SERVICES MANAGEMENT
    async getAllServices() {
        return this.services;
    }

    async createService(serviceData) {
        const newService = {
            id: Date.now(),
            ...serviceData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.services.push(newService);
        await this.saveServices();
        return newService;
    }

    // Get statistics
    async getStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.isActive).length;
        const adminUsers = this.users.filter(u => u.role === 'admin').length;
        const regularUsers = this.users.filter(u => u.role === 'user').length;
        const totalBookings = this.bookings.length;
        const pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
        const confirmedBookings = this.bookings.filter(b => b.status === 'confirmed').length;
        const completedBookings = this.bookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = this.bookings.filter(b => b.status === 'cancelled').length;
        const totalRevenue = this.bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, booking) => sum + (booking.amount || 0), 0);

        return {
            totalUsers,
            activeUsers,
            adminUsers,
            regularUsers,
            totalBookings,
            pendingBookings,
            confirmedBookings,
            completedBookings,
            cancelledBookings,
            totalRevenue
        };
    }
}

module.exports = new DataService();