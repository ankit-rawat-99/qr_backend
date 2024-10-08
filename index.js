const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid'); // Use UUID for token generation
const port = process.env.PORT || 3000;

// Create an HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware to parse JSON data
app.use(express.json()); //
app.use(express.urlencoded({ extended: true })); // Add this to handle form-encoded data

// Store active WebSocket connections
let connections = new Map();

// WebSocket connection setup
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    // Generate a unique token for this session
    const token = uuidv4(); // Generate a UUID token
    connections.set(token, ws); // Store WebSocket connection with the token
    
    // Send the token to the client
    ws.send(JSON.stringify({ token }));

    // Handle incoming WebSocket messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'INIT') {
                console.log(`WebSocket initialized for token: ${token}`);
                // You can do more logic if necessary, such as updating the connection map
            }
        } catch (err) {
            console.error('Error parsing WebSocket message:', err);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        // Optionally remove the connection from the map
        connections.delete(token);
    });
});

// Endpoint to verify token sent from the app
app.post('/verify-token', (req, res) => {
    const { token } = req.body;
  // Log the received token
  console.log('Received token from app:', token);

     // Verify the token
    if (connections.has(token)) {
        const ws = connections.get(token);

        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log('Token is valid, sending login success message to website.');
            ws.send(JSON.stringify({ success: true, message: 'Login successful!' }));
            res.status(200).json({ success: true, message: 'Token is valid.' });
        } else {
            console.log('WebSocket connection not active for token:', token);
            res.status(400).json({ success: false, message: 'WebSocket connection is not active.' });
        }
    } else {
        console.log('Invalid token received:', token);
        res.status(400).json({ success: false, message: 'Invalid token.' });
    }
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
