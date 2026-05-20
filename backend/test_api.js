const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: 'test_id', role: 'member', username: 'test_user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

fetch('http://127.0.0.1:5000/api/products?page=1&limit=8', {
    headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json().then(data => ({status: res.status, data})))
.then(({status, data}) => {
    console.log('Status:', status);
    console.log('Data keys:', Object.keys(data));
    if (data.products) {
        console.log('Products length:', data.products.length);
    } else {
        console.log('Data:', data);
    }
})
.catch(err => {
    console.error('API Error:', err.message);
});
