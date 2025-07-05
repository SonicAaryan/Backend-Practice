const { pool } = require('../config/db')

// Get all the users except me
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'select id, name, email from users where id = $1', [req.userId]
        )
        res.json({ users: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' })
    }
};

// Send friend request
exports.sendFriendRequest = async (req, res) => {
    const fromUserId = req.userId;
    const toUserId = parseInt(req.params.toUserId, 10);

    if (fromUserId === toUserId)
        return res.status(400).json({ message: "Can't send request to yourself" });

    try {
        // ① Does the target user exist?
        const target = await pool.query('SELECT id FROM users WHERE id = $1', [toUserId]);
        if (target.rows.length === 0)
            return res.status(404).json({ message: 'Target user not found' });

        // ② Are we already friends?
        const alreadyFriends = await pool.query(
            'SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2',
            [fromUserId, toUserId]
        );
        if (alreadyFriends.rows.length)
            return res.status(409).json({ message: 'You are already friends' });

        // ③ Is a pending request already there?
        const dup = await pool.query(
            `SELECT 1 FROM friend_requests
         WHERE from_user_id = $1 AND to_user_id = $2 AND status = 'pending'`,
            [fromUserId, toUserId]
        );
        if (dup.rows.length)
            return res.status(409).json({ message: 'Request already sent' });

        // ④ Create request
        await pool.query(
            'INSERT INTO friend_requests (from_user_id, to_user_id) VALUES ($1, $2)',
            [fromUserId, toUserId]
        );

        res.json({ message: 'Friend request sent' });
    } catch (err) {
        console.error('sendFriendRequest ❌', err);
        res.status(500).json({ message: 'Error sending request' });
    }
};


// View incoming friend requests
exports.getFriendRequests = async (req, res) => {
    try {

        const result = await pool.query(
            `select fr.id, u.id as from_user_id, u.name, u.email
            from friend_requests fr
            join users u on u.id = fr.from_user_id
            where fr.to_user_id = $1 and fr.status = 'pending'`, [req.userId]
        );

        res.json({ requests: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
}

// Accept request
exports.acceptRequest = async (req, res) => {
    const toUserId = req.userId;
    const fromUserId = parseInt(req.params.fromUserId, 10);

    try {
        // ① Is there a pending request?
        const pending = await pool.query(
            `SELECT id FROM friend_requests
         WHERE from_user_id = $1 AND to_user_id = $2 AND status = 'pending'`,
            [fromUserId, toUserId]
        );
        if (pending.rows.length === 0)
            return res.status(404).json({ message: 'No pending request found' });

        // ② Already friends?
        const dup = await pool.query(
            'SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2',
            [toUserId, fromUserId]
        );
        if (dup.rows.length)
            return res.status(409).json({ message: 'Already friends' });

        // ③ Mark request as accepted
        await pool.query(
            `UPDATE friend_requests
         SET status = 'accepted'
         WHERE id = $1`,
            [pending.rows[0].id]
        );

        // ④ Insert friendship both ways
        await pool.query(
            'INSERT INTO friends (user_id, friend_id) VALUES ($1,$2),($2,$1)',
            [toUserId, fromUserId]
        );

        res.json({ message: 'Friend request accepted' });
    } catch (err) {
        console.error('acceptRequest ❌', err);
        res.status(500).json({ message: 'Error accepting request' });
    }
};


// Remove friend
exports.removeFriend = async (req, res) => {
    const userId = req.userId;
    const friendId = parseInt(req.params.friendId, 10);


    try {
        // Delete both rows from friends table (user→friend and friend→user)
        await pool.query(
            `DELETE FROM friends
           WHERE (user_id = $1 AND friend_id = $2)
              OR (user_id = $2 AND friend_id = $1)`,
            [userId, friendId]
        );

        // Delete any friend_requests (pending or accepted) in either direction
        await pool.query(
            `DELETE FROM friend_requests
         WHERE (from_user_id = $1 AND to_user_id = $2)
            OR (from_user_id = $2 AND to_user_id = $1)`,
            [userId, friendId]
        );
        res.json({ message: 'Friend removed' });
    } catch (err) {
        console.error('removeFriend ❌', err);
        res.status(500).json({ message: 'Error removing friend' });
    }
};