const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            email: 'customer@royalstore.com',
            password: 'Customer@123'
        });
        console.log('Login Successful:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Login Failed:', error.response.status, error.response.data);
        } else {
            console.log('Login Error:', error.message);
        }
    }
}

testLogin();
