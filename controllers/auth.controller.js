const pool = require('../config/db').pool;
const redis = require('../config/redis');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'none';

// Register User
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' })

    try {
        // Check if user exists
        const existing = await pool.query('select * from users where email = $1', [email]);

        if (existing.rows.length > 0) return res.status(409).json({ message: 'Email already exists' });

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Insert User
        const result = await pool.query(
            'insert into users (name, email, password) values ($1, $2, $3) returning id,name,email', [name, email, hashed]
        )

        res.status(201).json({ message: 'User registered', user: result.rows[0] });
        console.log("-----> user", result.rows[0]);

    } catch (error) {
        res.status(500).json({ message: 'Registration failed' })
    }
}

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and passowrd required!' })

    try {
        const result = await pool.query('select * from users where email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.json(401).json({ message: 'Invalid User' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid Password' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Login Failed' });
    }
};

// Protected Profile Route
exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId

        const result = await pool.query(
            'select id, name, email from users where id = $1', [userId]
        )
        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Profile fetched', user });

    } catch (error) {
        res.status(500).json({ message: 'Error Fetching Profile!' });
    }
};

exports.getUserProfile = async (req, res) => {
    const userId = req.userId
    const cachekey = `user:${userId}`;
    try {
        // 1 Try Redis First
        const cached = await redis.get(cachekey);
        if (cached) return res.json(JSON.parse(cached));

        // 2 Fallback to DB
        const result = await pool.query(`select id,name,email from users where id = $1`, [userId]);
        const user = result.rows[0];

        // 3 Save to cache
        await redis.set(cachekey, JSON.stringify(user), { EX: 3600 })
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching profile!' });
    }
};