const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '✅ Backend is running!',
        time: new Date().toISOString()
    });
});

app.post('/api/auth/register', (req, res) => {
    res.json({
        success: true,
        message: 'User registered (test mode)',
        user: req.body,
        token: 'test_token_' + Date.now()
    });
});

app.post('/api/auth/login', (req, res) => {
    res.json({
        success: true,
        message: 'Login successful (test mode)',
        user: {
            email: req.body.email
        },
        token: 'test_token_' + Date.now()
    });
});

app.listen(5000, () => {
    console.log('✅ Backend server: http://localhost:5000');
    console.log('📅 Week 1 testing ready!');
});