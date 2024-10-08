const { S3Client } = require("@aws-sdk/client-s3");

// Set the AWS Region.
const { REGION } = process.env;

const s3Client = new S3Client({ region: REGION });

module.exports = {
    s3Client
};