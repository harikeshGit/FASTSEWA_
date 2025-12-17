const validationMiddleware = {
    // Validate user registration
    validateRegister: (req, res, next) => {
        const { username, email, password, confirmPassword } = req.body;
        const errors = [];
        
        // Check required fields
        if (!username) errors.push('Username is required');
        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');
        if (!confirmPassword) errors.push('Confirm password is required');
        
        // Validate email format
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }
        
        // Check password length
        if (password && password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        
        // Check passwords match
        if (password && confirmPassword && password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        // Check username length
        if (username && username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: errors
            });
        }
        
        next();
    },
    
    // Validate user login
    validateLogin: (req, res, next) => {
        const { email, password } = req.body;
        const errors = [];
        
        if (!email) errors.push('Email is required');
        if (!password) errors.push('Password is required');
        
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors: errors
            });
        }
        
        next();
    },
    
    // Validate email
    validateEmail: (req, res, next) => {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        
        next();
    },
    
    // Validate required fields
    validateRequiredFields: (fields) => {
        return (req, res, next) => {
            const errors = [];
            
            fields.forEach(field => {
                if (!req.body[field]) {
                    errors.push(`${field} is required`);
                }
            });
            
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    errors: errors
                });
            }
            
            next();
        };
    }
};

module.exports = validationMiddleware;