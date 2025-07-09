const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Setup AWS S3
const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Define upload middleware
const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read', // makes image accessible via public URL
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const filename = `images/${Date.now()}-${file.originalname}`;
            cb(null, filename);
        },
    }),
});

module.exports = upload;
