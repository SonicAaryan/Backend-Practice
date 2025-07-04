const { Pool } = require('pg'); //pg a tool that helps Node talk to PostgreSQL.
require('dotenv').config();

// like a pipeline to connect to DB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('PostgreSQL connected');
    } catch (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    }
};

module.exports = { pool, connectDB };