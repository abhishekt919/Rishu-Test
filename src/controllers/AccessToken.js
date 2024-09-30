const AccessTokenObj = require("../models/AccessToken");
const constantObj = require("./../config/Constants");

// Get Access Token
exports.GetAccessToken = (req, res) => {
  AccessTokenObj.findOne({ accessToken: req.body.accessToken })
    .lean()
    .populate("admin", "role isActive lastLoginEnabled")
    .populate("user", "role company isActive lastLoginEnabled")
    .exec(function (err, result) {
      if (!result || err) {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.ErrorRetrievingData
        });
      }
      if (result.admin) {
        if (result.admin?.isActive) {
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.SuccessRetreivingData,
            user: {
              _id: result.admin._id,
              role: result.admin.role,
              lastLoginEnabled: result.admin.lastLoginEnabled
            },
            accessToken: result.accessToken
          });
        } else {
          return res.jsonp({
            status: "failure",
            messageId: 203,
            message: constantObj.messages.UnauthorizedAccessError
          });
        }
      } else {
        if (result.user?.isActive) {
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.SuccessRetreivingData,
            user: {
              _id: result.user._id,
              role: result.user.role,
              lastLoginEnabled: result.user.lastLoginEnabled,
              company: result.user.company
            },
            accessToken: result.accessToken
          });
        } else {
          return res.jsonp({
            status: "failure",
            messageId: 203,
            message: constantObj.messages.UnauthorizedAccessError
          });
        }
      }
    })
};