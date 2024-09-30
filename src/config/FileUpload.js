const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

const { s3Client } = require("./s3Client");

const { AWS_BUCKET } = process.env;

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb({
      message: "Invalid file type, supported file types are jpg, png, jpeg, pdf, csv",
      code: 201
    }, false);
  }
}

const uploadFile = multer({
  fileFilter,
  storage: multerS3({
    s3: s3Client,
    bucket: AWS_BUCKET,
    acl: 'public-read',
    key: function (req, file, cb) {
      const fileName = path.parse(file.originalname).name;
      const fileExt = path.parse(file.originalname).ext;
      cb(null, `${req.query.path}${fileName}_${Date.now().toString()}${fileExt}`)
    }
  })
});

module.exports = uploadFile;