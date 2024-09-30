const { errorHandler } = require("../helpers/helperFunctions");
const {
  deleteObjectFromS3,
  putBase64ToS3,
} = require("../helpers/awsS3Functions");

const constantObj = require("../config/Constants");

exports.UploadSingleFile = async (req, res) => {
  try {
    const { originalname, key } = req.file;
    const data = {
      key,
      fileName: originalname,
    };
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: `File ${constantObj.messages.RecordUploaded}`,
      data: data,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

exports.UploadMultipleFiles = async (req, res) => {
  try {
    const files = req.files.map((file) => {
      const { originalname, location, key } = file;
      return {
        key,
        location,
        fileName: originalname,
      };
    });
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: `Files ${constantObj.messages.RecordUploaded}`,
      data: files,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

// Delete File From S3
exports.DeleteFile = async (req, res) => {
  try {
    await deleteObjectFromS3(req.query.key);

    return res.jsonp({
      status: "success",
      messageId: 200,
      message: `File ${constantObj.messages.RecordDeleted}`,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

// Get File
exports.GetFile = (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "public/uploads/", fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.jsonp({
        status: "failure",
        messageId: 404,
        message: "File not found",
      });
    }

    // Send the file
    res.sendFile(filePath);
  });
};

// Upload base-64 string to S3
exports.UploadBase64 = async (req, res) => {
  try {
    const result = await putBase64ToS3(req.body);
    return res.jsonp({
      status: "success",
      messageId: 200,
      data: result,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};
