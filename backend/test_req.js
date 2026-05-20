const http = require('http');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: 'test_id', role: 'member', username: 'test_user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products?category=' + encodeURIComponent('Chuột'),
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, res => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        console.log('DATA:', data);
    });
});

req.on('error', error => {
    console.error('ERROR:', error);
});

req.end();
