const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const port = process.env.PORT || 3000;

// Create an HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware to parse JSON data
app.use(express.json());

// Store active WebSocket connections
let connections = new Map();

// WebSocket connection setup
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        // Expect the message to be JSON containing the token and user information
        try {
            const data = JSON.parse(message);
            if (data.type === 'INIT') {
                // Store connection for the user, identified by token
                connections.set(data.token, ws);
                console.log(`Connection initialized for token: ${data.token}`);
            }
        } catch (err) {
            console.error('Error parsing WebSocket message:', err);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Endpoint to verify token sent from the app
app.post('/verify-token', (req, res) => {
    const { token } = req.body;

    // Dummy token verification logic
    if (token === 'VALID_TOKEN') {
        // Check if there's an active WebSocket connection for the token
        const ws = connections.get(token);
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Send login success message via WebSocket
            ws.send(JSON.stringify({ success: true, message: 'Login successful!' }));
            res.status(200).json({ success: true, message: 'Token is valid.' });
        } else {
            res.status(400).json({ success: false, message: 'No active connection for token.' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
