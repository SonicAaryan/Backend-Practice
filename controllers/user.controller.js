// Create User
const {pool} = require('../config/db')

exports.createUser = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and Email are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO USERS(name , email)VALUES($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error Creating User" })
    }
}

// Get all Users
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('select * from users');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get One User
exports.getUserById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query('select * from users where id = $1', [id]);

        if (result.rows.length == 0) return res.status(404).json({ message: 'User not Found' });
        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching user!' });
    }
};

// Update User
exports.updateUser = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;

    try {
        const result = await pool.query('update users set name = $1 , email = $2 where id = $3 returning *', [name, email, id])

        if (result.rows.length == 0) return res.status(404).json({ message: 'User not found' })
        res.json(result.rows[0]);
     } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await pool.query('delete from users where id = $1 returning *', [id]);

        if (result.rows.length == 0) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({message:'Error deleting user'})
    }
};