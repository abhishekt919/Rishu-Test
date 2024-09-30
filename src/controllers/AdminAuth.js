const AdminObj = require("../models/Admin");
const ForgotPasswordObj = require("../models/ForgotPassword");
const AccessTokenObj = require("../models/AccessToken");
const AccountVerifcationObj = require("../models/AccountVerifcation");

const { sendEmailUsingTemplate } = require("./../config/EmailService");
const constantObj = require("./../config/Constants");
const {
  createJwtToken,
  decryptPassword,
  encryptPassword,
  errorHandler
} = require("./../helpers/helperFunctions");

// Admin Login 
exports.Login = (req, res) => {
  AdminObj.findOne({ email: req.body.email.toLowerCase() }).then(user => {
    if (!user) {
      return res.jsonp(errorHandler(constantObj.messages.EmailPasswordError));
    }

    let password = decryptPassword(user.password);
    console.log("User ==> ", password, "Request ==> ", req.body.password)
    if (password !== req.body.password) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.EmailPasswordError
      });
    }

    if (user.isDeleted  || !user.isActive) {
      // Deleted Account
      return res.jsonp({
        status: "failure",
        messageId: 401,
        message: constantObj.messages.UnauthorizedAccessError
      });
    }

    const authToken = createJwtToken(user);
    let inputJson = {
      admin: user._id,
      accessToken: authToken
    }
    const accessToken = new AccessTokenObj(inputJson);
    accessToken.save().then(result => {
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        accessToken: authToken,
        user: {
          _id: user._id,
          role: user.role,
          lastLoginEnabled: user.lastLoginEnabled
        }
      });
    })
  }).catch(err => {
    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: constantObj.messages.ErrorRetrievingData
    });
  });
};

exports.CheckEmail = (req, res) => {
  AdminObj.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.jsonp({
        status: "success",
        messageId: 200
      });
    }

    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: 'Email is ' + constantObj.messages.AlreadyExisted
    });
  }).catch(err => {
    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: constantObj.messages.ErrorRetrievingData
    });
  });
};

exports.CheckMobilePhone = (req, res) => {
  AdminObj.findOne({ mobilePhone: req.body.mobilePhone }).then(user => {
    if (!user) {
      return res.jsonp({
        status: "success",
        messageId: 200
      });
    }

    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: 'Mobile phone is ' + constantObj.messages.AlreadyExisted
    });
  }).catch(err => {
    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: constantObj.messages.ErrorRetrievingData
    });
  });
};

// Admin Forgot Password.
exports.ForgotPassword = (req, res) => {
  AdminObj.findOne({ email: req.body.email.toLowerCase() }, function (err, user) {
    if (err) {
      return res.jsonp(errorHandler());
    }

    if (!user) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.EmailDoesnotExist
      });
    }

    const token = createJwtToken(user);
    let today = new Date();
    today.setMinutes(today.getMinutes() + 30);
    ForgotPasswordObj.findOne({ email: user.email }, function (err, dataExist) {
      if (err) {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.ErrorRetrievingData
        });
      }
      if (dataExist) {
        let updateData = {
          "token": token,
          "expiryTime": today
        };
        ForgotPasswordObj.updateOne({ _id: dataExist._id }, { $set: updateData }, function (err, post) {
          if (err) {
            return res.jsonp({
              status: "failure",
              messageId: 203,
              message: constantObj.messages.ErrorRetrievingData
            });
          }
          sendResetLinkEmail(user, token);
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.ForgotPassword
          })
        });
      } else {
        const adding = new ForgotPasswordObj({
          "email": user.email,
          "token": token,
          "expiryTime": today
        });

        adding.save(function (err, post) {
          if (err) {
            return res.jsonp({
              status: "failure",
              messageId: 203,
              message: constantObj.messages.ErrorRetrievingData
            });
          }

          sendResetLinkEmail(user, token);
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.ForgotPassword
          })
        });
      }
    });
  });
};

function sendResetLinkEmail(user, token) {
  let emailTemplateData = {
    userFullName: user.firstName + " " + user.lastName,
    resetPasswordLink: process.env.SUPERADMIN_PORTAL_URL + "/reset-password/" + token
  };
  sendEmailUsingTemplate(user.email, process.env.ForgotPassword, emailTemplateData);
}

//Reset Password
exports.ResetPassword = (req, res) => {
  ForgotPasswordObj.findOne({ token: req.body.token }, function (err, data) {
    if (err) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData
      });
    }
    if (!data) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.PasswordResetFailed
      });
    }
    ForgotPasswordObj.deleteOne({ _id: data._id }, function (err, done) {
      if (err) {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.ErrorRetrievingData
        });
      }
      let newPassword = encryptPassword(req.body.password);
      let updateData = {
        password: newPassword
      };
      AdminObj.updateOne({ email: data.email }, { $set: updateData }).then(result => {
        AdminObj.findOne({ email: data.email }, function (err, data) {
          if (err) {
            return res.jsonp({
              status: "failure",
              messageId: 203,
              message: constantObj.messages.ErrorRetrievingData
            });
          }
          let emailTemplateData = {
            userFullName: data.firstName + " " + data.lastName
          };
          sendEmailUsingTemplate(data.email, process.env.ResetPassword, emailTemplateData);
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.PasswordResetSuccess
          });
        })
      }).catch(err => {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.PasswordResetFailed
        });
      });
    });
  })
};

// Get Admin Profile
exports.GetProfile = (req, res) => {
  AdminObj.findOne({ _id: req.body._id }).lean().exec(function (err, user) {
    if (!user || err) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData
      });
    }
    let mobilePhone = user.mobilePhone;
    let countryCodeLength = mobilePhone.length - 10;
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: constantObj.messages.SuccessRetreivingData,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        mobilePhone: user.mobilePhone,
        createdAt: user.createdAt,
        profilePic: user.profilePic,
        timezone: user.timezone,
        countryCode: user.countryCode,
        mobilePhone: mobilePhone.substring(countryCodeLength, mobilePhone.length)
      }
    });
  })
};

// Update Admin Profile
exports.UpdateProfile = (req, res) => {
  AdminObj.updateOne({ _id: req.body._id }, { $set: req.body }).lean().exec(function (err, updated) {
    if (!updated || err) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData
      });
    }

    AdminObj.findOne({ _id: req.body._id }).lean().exec(function (err, user) {
      if (!user || err) {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.ErrorRetrievingData
        });
      }
      let mobilePhone = user.mobilePhone;
      let countryCodeLength = mobilePhone.length - 10;
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.ProfileUpdated,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          mobilePhone: user.mobilePhone,
          createdAt: user.createdAt,
          profilePic: user.profilePic,
          timezone: user.timezone,
          countryCode: user.countryCode,
          mobilePhone: mobilePhone.substring(countryCodeLength, mobilePhone.length)
        }
      });
    })
  })
};

// Change Password API
exports.ChangePassword = function (req, res) {
  AdminObj.findOne({ _id: req.body._id }, { password: 1 }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp({
        'status': 'failure',
        'messageId': 203,
        'message': constantObj.messages.ErrorRetrievingData
      });
    }
    if (data) {
      // Check for Existing Password
      let existingPassword = decryptPassword(data.password);
      if (existingPassword === req.body.currentPassword) {
        // Old password and new password can't be same
        if (existingPassword === req.body.password) {
          return res.jsonp({
            'status': 'warning',
            'messageId': 203,
            'message': constantObj.messages.OldNewPasswordSameError
          });
        }
        let newPassword = encryptPassword(req.body.password);
        let updatePassword = {
          password: newPassword
        };
        AdminObj.updateOne({ _id: req.body._id }, { $set: updatePassword }, function (err, result) {
          return res.jsonp({
            'status': 'success',
            'messageId': 200,
            'message': constantObj.messages.PasswordChangedSuccess
          });
        });
      } else {
        // Old Password is incorrect
        return res.jsonp({
          'status': 'failure',
          'messageId': 203,
          'message': constantObj.messages.OldPasswordIncorrect
        });
      }
    }
  });
}

exports.VerifyEmail = (req, res) => {
  AccountVerifcationObj.findOne({ jwtCode: req.body.jwtCode, verificationCode: req.body.verificationCode }).lean().exec(function (err, result) {
    if (err) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData
      });
    }

    // If we found a email and code, then check expiry time.
    if (result) {
      let d1 = new Date(result.expiryTime);
      let d2 = new Date();
      if (d1.getTime() >= d2.getTime()) {
        AccountVerifcationObj.deleteOne({ jwtCode: req.body.jwtCode }, function (err, data) {
          if (err) {
            return res.jsonp({
              status: "failure",
              messageId: 203,
              message: constantObj.messages.ErrorRetrievingData
            });
          }
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.EmailVerificationSuccess
          });
        });
      } else {
        return res.jsonp({
          status: "failure",
          messageId: 203,
          message: constantObj.messages.OtpExpired
        });
      }
    } else {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.OtpMismatch
      });
    }
  });
};

exports.LoginAsUser = (req, res) => {
  AdminObj.findOne({ email: req.body.email.toLowerCase() }).then(user => {
    if (!user) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.EmailPasswordError
      });
    }

    const authToken = createJwtToken(user);
    let inputJson = {
      admin: user._id,
      accessToken: authToken
    }
    const accessToken = new AccessTokenObj(inputJson);
    accessToken.save().then(result => {
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.LoginInAs + " " + user.firstName + " " + user.lastName,
        accessToken: authToken,
        user: {
          _id: user._id,
          role: user.role,
          switchUserEmail: req.body.switchUserEmail ? req.body.switchUserEmail : null
        }
      });
    })
  }).catch(err => {
    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: constantObj.messages.ErrorRetrievingData
    });
  });
};