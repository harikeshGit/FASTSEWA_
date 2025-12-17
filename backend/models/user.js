class User {
    constructor(id, username, email, password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.isActive = true;
        this.role = 'user';
    }
    
    // Get user info (without password)
    getPublicInfo() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            createdAt: this.createdAt,
            role: this.role,
            isActive: this.isActive
        };
    }
    
    // Update user
    update(updates) {
        Object.keys(updates).forEach(key => {
            if (key !== 'id' && key !== 'createdAt') {
                this[key] = updates[key];
            }
        });
        this.updatedAt = new Date().toISOString();
        return this;
    }
    
    // Deactivate user
    deactivate() {
        this.isActive = false;
        this.updatedAt = new Date().toISOString();
        return this;
    }
    
    // Check if password matches (in real app, use bcrypt)
    checkPassword(password) {
        return this.password === password;
    }
}

// Static methods
User.generateId = () => {
    return Date.now();
};

User.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

User.validatePassword = (password) => {
    return password.length >= 6;
};

module.exports = User;