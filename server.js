const express = require('express');
const { connectDB } = require('./config/db')
require('dotenv').config();
const userRoutes = require('./routes/user.routes')
const authRoutes = require('./routes/auth.routes')
const friendRoutes = require('./routes/friend.routes')
const upload = require('./routes/upload.routes')

const app = express(); // now we can use it to define APIs (app.get, app.post, etc.)
const PORT = process.env.PORT

connectDB()

// middlewares
app.use(express.json()); // This middleware allows your server to understand JSON in requests.

// routes
app.get('/', (req, res) => {
    // req → Incoming request
    // res → What we send back(response)
    res.send('Hello,Backend Kid! 🚀');
})

app.use('/users', userRoutes)
app.use('/auth', authRoutes)
app.use('/friends', friendRoutes)
app.use('/uploads', upload)

const HOST = process.env.HOST;
const os = require('os');

const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
};

app.listen(PORT, HOST, () => {
    const ip = getLocalIP();
    console.log(` Server is accessible at:  http://${ip}:${PORT}`);
});