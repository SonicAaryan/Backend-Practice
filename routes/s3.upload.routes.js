const express = require('express');
const router = express.Router();
const upload = require('../middlewares/s3Uploader');

router.post('/image', upload.single('photo'), (req, res) => {
    const imageURL = req.file.location;
    res.json({ message: 'Image Uploaded', imageURL });
});
module.exports = router;
