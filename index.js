const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());

// Endpoint to verify token
app.post('/verify-token', (req, res) => {
    const { token } = req.body;
    
    // Dummy token verification logic
    if (token === 'VALID_TOKEN') {
        res.status(200).json({ success: true, message: 'Token is valid.' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
