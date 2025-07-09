const express = require('express')
const router = express.Router();
const upload = require('../middlewares/upload')

router.post('/image', upload.single('image'), (req, res) => {
    res.json({ message: 'Image uploaded', file: req.file });
});

module.exports = router;