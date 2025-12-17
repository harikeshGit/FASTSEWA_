class AuthController {
    // Register new user
    static register(req, res) {
        const { username, email, password, confirmPassword } = req.body;
        
        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'Passwords do not match'
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }
        
        // Create user (in real app, hash password)
        const user = {
            id: Date.now(),
            username,
            email,
            token: this.generateToken(),
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                token: user.token,
                role: user.role
            }
        });
    }
    
    // Login user
    static login(req, res) {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }
        
        // Simulate user lookup (in real app, check database)
        const user = {
            id: 1,
            username: 'demo_user',
            email: email,
            role: 'user',
            token: this.generateToken()
        };
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                token: user.token,
                role: user.role
            }
        });
    }
    
    // Get current user profile
    static getProfile(req, res) {
        // In real app, get from token
        const user = {
            id: 1,
            username: 'current_user',
            email: 'user@example.com',
            profile: {
                bio: 'Software developer',
                location: 'San Francisco',
                website: 'https://example.com'
            },
            stats: {
                posts: 24,
                followers: 150,
                following: 89
            }
        };
        
        res.json({
            success: true,
            data: user
        });
    }
    
    // Helper method to generate token
    static generateToken() {
        return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Date.now()}.fake-signature`;
    }
}

module.exports = AuthController;