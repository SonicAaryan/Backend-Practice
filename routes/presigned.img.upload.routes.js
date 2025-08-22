const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk')
require('dotenv').config();

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// GET /upload/presigned-url?filename=user.jpg&contentType=image/jpeg
router.get('/presigned-url', (req, res) => {
    const { filename, contentType } = req.query;

    if (!filename || !contentType) return res.status(400).json({ message: 'Filename and contentType required' })

    const key = `images/${Date.now()} - ${filename}`;
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        key: key,
        Expires: 60,
        contentType: contentType,
        ACL: 'public-read',
    };

    const uploadUrl = s3.getSignedUrl('putObject', params);
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ uploadUrl, publicUrl });
});
module.exports = router;