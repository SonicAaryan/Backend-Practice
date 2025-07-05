const express = require('express')
const router = express.Router();
const verifyToken = require('../middlewares/auth')
const friend = require('../controllers/friends.controller');

router.get('/users', verifyToken, friend.getAllUsers);
router.post('/request/:toUserId', verifyToken, friend.sendFriendRequest);
router.get('/requests', verifyToken, friend.getFriendRequests);
router.post('/accept/:fromUserId', verifyToken, friend.acceptRequest);
router.delete('/:friendId', verifyToken, friend.removeFriend);

module.exports = router;