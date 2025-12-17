class UserController {
    // Get all users
    static getAllUsers(req, res) {
        const users = [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
        ];
        
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    }
    
    // Get user by ID
    static getUserById(req, res) {
        const userId = parseInt(req.params.id);
        
        // Simulate database lookup
        const user = {
            id: userId,
            name: 'Example User',
            email: `user${userId}@example.com`,
            profile: {
                age: 25,
                location: 'New York',
                bio: 'Software developer'
            }
        };
        
        res.json({
            success: true,
            data: user
        });
    }
    
    // Create user
    static createUser(req, res) {
        const { name, email, password } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, email, and password'
            });
        }
        
        // Create new user object
        const newUser = {
            id: Date.now(),
            name,
            email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: newUser
        });
    }
    
    // Update user
    static updateUser(req, res) {
        const userId = parseInt(req.params.id);
        const updates = req.body;
        
        // Simulate update
        const updatedUser = {
            id: userId,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            message: `User ${userId} updated successfully`,
            data: updatedUser
        });
    }
    
    // Delete user
    static deleteUser(req, res) {
        const userId = parseInt(req.params.id);
        
        res.json({
            success: true,
            message: `User ${userId} deleted successfully`,
            data: { id: userId }
        });
    }
}

module.exports = UserController;