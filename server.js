const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 5000;

// Create an HTTP server and pass it to Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Setup middlewares
app.use(cors());
app.use(express.json());

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MSqlF#786',
    database: 'dish_management'
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

// API to fetch all dishes
app.get('/api/dishes', (req, res) => {
    db.query('SELECT * FROM dishes', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// API to toggle dish's published status
app.patch('/api/dishes/:id', (req, res) => {
    const dishId = req.params.id;
    const { isPublished } = req.body;
    db.query('UPDATE dishes SET isPublished = ? WHERE dishId = ?', [isPublished, dishId], (err, result) => {
        if (err) throw err;
        // Emit an event to notify clients about the update
        io.emit('dishUpdated', { dishId, isPublished });
        res.sendStatus(200);
    });
});

// Setup WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the HTTP server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
