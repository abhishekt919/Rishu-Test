const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const { s3Client } = require("./../config/s3Client");

const { AWS_BUCKET, S3URL } = process.env;

const putBase64ToS3 = async (data) => {
    const base64Data = new Buffer.from(data.base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = data.base64.split(';')[0].split('/')[1];
    const command = new PutObjectCommand({
        Bucket: AWS_BUCKET,
        Key: data.key,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    });

    return new Promise(async (resolve, reject) => {
        try {
            const response = await s3Client.send(command);
            const location = S3URL + data.key;
            let result = {
                url: location,
                key: params.Key
            };
            return resolve(result);
        } catch (err) {
            return reject(err);
        }
    });
};

const putFileToS3 = async (localPath, toPath, fileData, contentType) => {
    const command = new PutObjectCommand({
        Bucket: AWS_BUCKET,
        Key: toPath,
        Body: fileData,
        ACL: 'public-read',
        ContentType: contentType
    });

    return new Promise(async (resolve, reject) => {
        try {
            const response = await s3Client.send(command);
            const location = S3URL + toPath;

            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
            }
            return resolve(location);
        } catch (err) {
            return reject(err);
        }
    });
};

const deleteObjectFromS3 = async (key) => {
    if (key) {
        const command = new DeleteObjectCommand({
            Bucket: AWS_BUCKET,
            Key: key
        });

        return new Promise(async (resolve, reject) => {
            try {
                const response = await s3Client.send(command);
                return resolve(response);
            } catch (err) {
                return reject(err);
            }
        });
    } else {
        return;
    }
};

module.exports = {
    putBase64ToS3,
    putFileToS3,
    deleteObjectFromS3
};
