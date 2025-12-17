const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import modules
const { authenticateToken, isAdmin } = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

// Create necessary directories
const createDirectories = async () => {
    const directories = [
        path.join(__dirname, 'data'),
        path.join(__dirname, 'exports'),
        path.join(__dirname, '../frontend')
    ];
    
    for (const dir of directories) {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`📁 Created directory: ${dir}`);
        } catch (error) {
            console.error(`Error creating directory ${dir}:`, error);
        }
    }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', authenticateToken, isAdmin, adminRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'FASTSEWA Admin API',
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize and start server
createDirectories().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
        console.log(`📝 Registration: http://localhost:${PORT}/register`);
        console.log(`🔐 Login: http://localhost:${PORT}/login`);
    });
});