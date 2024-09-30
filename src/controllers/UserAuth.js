const fs = require("fs");
const lodash = require("lodash");

const UserObj = require("../models/User");
const AdminObj = require("../models/Admin");
const AccessTokenObj = require("../models/AccessToken");
const CompanyObj = require("../models/Company");
const AccountVerifcationObj = require("../models/AccountVerifcation");
const ForgotPasswordObj = require("../models/ForgotPassword");

const { sendEmailUsingTemplate, sendMobileText } = require("./../config/EmailService");
const constantObj = require("../config/Constants");
const { GetUserPermissionsByRole } = require("./UserPermissions");

const {
  createJwtToken,
  decryptPassword,
  encryptPassword,
  errorHandler,
  firstLetterCapital,
  generateReferralCode,
  randomString,
  verificationCode
} = require("./../helpers/helperFunctions");

exports.Login = (req, res) => {
  let query = {
    $or: [
      { email: req.body.userNameEmail.toLowerCase() },
      { username: req.body.userNameEmail }
    ]
  };
  UserObj.findOne(query)
    .populate('company', 'isActive')
    .then(user => {
      if (!user) {
        return res.jsonp(errorHandler(constantObj.messages.UsernameEmailAccount));
      }

      if (user.password) {
        if (req.body.password) {
          let password = decryptPassword(user.password);
          console.log("User ==> ", password, "Request ==>", req.body.password);
          if (password !== req.body.password) {
            return res.jsonp(errorHandler(constantObj.messages.UsernameEmailError));
          }
        } else {
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.SuccessRetreivingData,
            password: user.password
          });
        }
      } else {
        // Check for Users who don't have company account
        return res.jsonp({
          status: "success",
          messageId: 200,
          message: constantObj.messages.SuccessRetreivingData,
          user: {
            _id: user._id
          }
        });
      }

      // if (!user.emailVerified) {
      //   // Email Not Verified, Send Code to Verify Email
      //   saveEmailVerificationCode(user, res, 'LOGIN');
      //   return;
      // }

      if (user.isDeleted || !user.isActive) {
        // InActive Account
        return res.jsonp(errorHandler(constantObj.messages.ProfileApprovalPending));
      }

      if (!user.company.isActive) {
        return res.jsonp(errorHandler(constantObj.messages.ProfileApprovalPending));
      }

      const authToken = createJwtToken(user);
      let inputJson = {
        user: user._id,
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
            lastLoginEnabled: user.lastLoginEnabled,
            company: user.company._id
          }
        });
      })
    }).catch(err => {
      return res.jsonp(errorHandler(constantObj.messages.ErrorRetrievingData));
    });
};

exports.LoginMobilePhone = (req, res) => {
  UserObj.findOne({ mobilePhone: req.body.mobilePhone })
    .populate('company', 'isActive')
    .then(user => {
      if (!user) {
        return res.jsonp(errorHandler(constantObj.messages.NoMobileAccount));
      }

      if (user.password) {
        if (req.body.password) {
          let password = decryptPassword(user.password);
          console.log("User ==> ", password, "Request ==>", req.body.password);
          if (password !== req.body.password) {
            return res.jsonp(errorHandler(constantObj.messages.MobilePasswordError));
          }
        } else {
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.SuccessRetreivingData,
            password: user.password
          });
        }
      } else {
        // Check for Users who don't have company account
        return res.jsonp({
          status: "success",
          messageId: 200,
          message: constantObj.messages.SuccessRetreivingData,
          user: {
            _id: user._id
          }
        });
      }

      // if (!user.mobileVerified) {
      //   // Mobile Not Verified, Send Code to Mobile
      //   let date = new Date();
      //   date.setMinutes(date.getMinutes() + 15);
      //   const objToSave = {
      //     mobilePhone: req.body.mobilePhone,
      //     verificationCode: verificationCode(),
      //     expiryTime: date
      //   };
      //   saveMobileOTP(objToSave);
      //   return res.jsonp({
      //     status: "success",
      //     messageId: 200,
      //     message: constantObj.messages.VerificationPhone,
      //     data: {
      //       mobilePhone: req.body.mobilePhone
      //     }
      //   });
      // }

      if (user.isDeleted || !user.isActive) {
        // InActive Account
        return res.jsonp(errorHandler(constantObj.messages.ProfileApprovalPending));
      }

      if (!user.company.isActive) {
        return res.jsonp(errorHandler(constantObj.messages.ProfileApprovalPending));
      }

      const authToken = createJwtToken(user);
      let inputJson = {
        user: user._id,
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
            lastLoginEnabled: user.lastLoginEnabled,
            company: user.company._id
          }
        });
      })
    }).catch(err => {
      return res.jsonp(errorHandler(constantObj.messages.ErrorRetrievingData));
    });
};

exports.CheckUserName = (req, res) => {
  UserObj.findOne({ username: req.body.username }).then(user => {
    if (!user) {
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: 'Username is available.'
      });
    }

    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: 'Username is not available.'
    });
  }).catch(err => {
    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: constantObj.messages.ErrorRetrievingData
    });
  });
};

exports.CheckEmail = (req, res) => {
  UserObj.findOne({ email: req.body.email }).then(user => {
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
  UserObj.findOne({ mobilePhone: req.body.mobilePhone }).then(user => {
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

exports.SignUp = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase();
    const userMobile = await UserObj.findOne({ mobilePhone: req.body.mobilePhone }).lean();
    if (userMobile) {
      return res.jsonp(errorHandler(constantObj.messages.PhoneExist));
    }
    const userEmail = await UserObj.findOne({ email: req.body.email }).lean();
    if (userEmail) {
      return res.jsonp(errorHandler(constantObj.messages.EmailExist));
    }
    let encryptedPass = encryptPassword(req.body.password);
    req.body.firstName = firstLetterCapital(req.body.firstName);
    req.body.lastName = firstLetterCapital(req.body.lastName);
    let inputJson = req.body;
    inputJson.password = encryptedPass;
    inputJson.isAccountOwner = true;
    inputJson.address = {
      country: req.body.country
    }
    inputJson.role = 'director';
    inputJson.permissions = await GetUserPermissionsByRole('director');
    inputJson.awsDirectory = randomString(4);
    inputJson.timezone = constantObj.defaultTimezone;
    const userModel = new UserObj(inputJson);
    const result = await userModel.save();
    let companyJson = {
      name: req.body.companyName,
      email: req.body.email,
      timezone: constantObj.defaultTimezone,
      referralCode: req.body.referralCode,
      affiliateCode: generateReferralCode(10),
      billingAddress: {
        country: req.body.country
      },
      currency: 'USD',
      createdBy: result._id,
      updatedBy: result._id,
      machineTypes: ['64ec58182c7424c5e0934cc8']
    }
    const company = new CompanyObj(companyJson);
    company.save().then(companyData => {
      UserObj.updateOne({ _id: result._id }, { $set: { company: companyData._id } }).then(updated => {
        // Send Email To SuperAdmin & All Other Admins
        sendEmailToSuperAdmin(result, req.body.companyName);
        if (req.body.verifyUsing === "Email") {
          // Send Code to Verify Email
          saveEmailVerificationCode(result, res, 'SIGNUP');
        } else {
          // Send Code to Verify Mobile Phone
          let date = new Date();
          date.setMinutes(date.getMinutes() + 15);
          const objToSave = {
            mobilePhone: req.body.mobilePhone,
            verificationCode: verificationCode(),
            expiryTime: date
          };
          saveMobileOTP(objToSave);
          return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.VerificationPhone,
            data: {
              mobilePhone: req.body.mobilePhone
            }
          });
        }
      })
    })
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

function sendEmailToSuperAdmin(result, companyName) {
  AdminObj.find({ role: { $in: ['superadmin', 'admin'] } }, { firstName: 1, email: 1 }).lean().exec(function (err, admins) {
    if (admins.length > 0) {
      for (let idx = 0; idx < admins.length; idx++) {
        let emailTemplateData = {
          adminFirstName: admins[idx].firstName,
          companyName: companyName,
          userFullName: result.firstName + " " + result.lastName,
          superAdminPortal: process.env.SUPERADMIN_PORTAL_URL + "/company"
        };
        sendEmailUsingTemplate(admins[idx].email, process.env.VerifyCompany, emailTemplateData);
      }
    }
  })
}

exports.CompleteAccount = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase();
    const userMobile = await UserObj.findOne({ mobilePhone: req.body.mobilePhone }).lean();
    if (userMobile) {
      return res.jsonp(errorHandler(constantObj.messages.PhoneExist));
    }
    const userEmail = await UserObj.findOne({ email: req.body.email }).lean();
    if (userEmail) {
      return res.jsonp(errorHandler(constantObj.messages.EmailExist));
    }
    let encryptedPass = encryptPassword(req.body.password);
    req.body.firstName = firstLetterCapital(req.body.firstName);
    req.body.lastName = firstLetterCapital(req.body.lastName);
    let inputJson = req.body;
    inputJson.password = encryptedPass;
    inputJson.address = {
      country: req.body.country
    }
    inputJson.role = 'director';
    inputJson.permissions = await GetUserPermissionsByRole('director');
    inputJson.awsDirectory = randomString(4);
    inputJson.createdAt = new Date();
    inputJson.updatedAt = new Date();
    inputJson.isActive = true;
    inputJson.type = "COMPLETE_ACCOUNT";
    inputJson.timezone = constantObj.defaultTimezone;
    UserObj.updateOne({ _id: req.body._id }, { $set: inputJson }).then(updated => {
      let companyJson = {
        name: req.body.companyName,
        email: req.body.email,
        timezone: constantObj.defaultTimezone,
        referralCode: req.body.referralCode,
        affiliateCode: generateReferralCode(10),
        billingAddress: {
          country: req.body.country
        },
        currency: 'USD',
        isActive: true,
        createdBy: req.body._id,
        updatedBy: req.body._id,
        machineTypes: ['64ec58182c7424c5e0934cc8']
      }
      const company = new CompanyObj(companyJson);
      company.save().then(companyData => {
        UserObj.updateOne({ _id: req.body._id }, { $set: { company: companyData._id } }).then(updated => {
          // Send Email To SuperAdmin & All Other Admins
          sendEmailToSuperAdmin(inputJson, req.body.companyName);
          // if (req.body.verifyUsing === "Email") {
          //   // Send Code to Verify Email
          //   saveEmailVerificationCode(inputJson, res, 'SIGNUP');
          // } else {
          //   // Send Code to Verify Mobile Phone
          //   let date = new Date();
          //   date.setMinutes(date.getMinutes() + 15);
          //   const objToSave = {
          //     mobilePhone: req.body.mobilePhone,
          //     verificationCode: verificationCode(),
          //     expiryTime: date
          //   };
          //   saveMobileOTP(objToSave);
          //   return res.jsonp({
          //     status: "success",
          //     messageId: 200,
          //     message: constantObj.messages.VerificationPhone,
          //     data: {
          //       mobilePhone: req.body.mobilePhone
          //     }
          //   });
          // }
          const tokenData = {
            _id: req.body._id,
            email: inputJson.email,
          }
          const authToken = createJwtToken(tokenData);
          let tokenJson = {
            user: tokenData._id,
            accessToken: authToken
          }
          const accessToken = new AccessTokenObj(tokenJson);
          accessToken.save().then(result => {
            return res.jsonp({
              status: "success",
              messageId: 200,
              message: constantObj.messages.AccountCompleted,
              accessToken: authToken,
              user: {
                _id: req.body._id,
                role: 'director',
                lastLoginEnabled: false,
                company: companyData._id
              }
            });
          })
        })
      })
    })
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

exports.VerifyEmail = (req, res) => {
  req.body.email = req.body.email.toLowerCase();
  UserObj.findOne({ email: req.body.email }, { role: 1, isAccountOwner: 1 }).lean().exec(function (err, user) {
    if (err) {
      return res.jsonp(errorHandler());
    }

    AccountVerifcationObj.findOne({ email: req.body.email, verificationCode: req.body.verificationCode }).lean().exec(function (err, result) {
      if (err) {
        return res.jsonp(errorHandler());
      }
      // If we found a email and code, then check expiry time.
      if (result) {
        let d1 = new Date(result.expiryTime);
        let d2 = new Date();
        if (d1.getTime() >= d2.getTime()) {
          AccountVerifcationObj.deleteMany({ email: req.body.email }, function (err, data) {
            if (err) {
              return res.jsonp(errorHandler());
            }
            let setData = {
              emailVerified: true,
              isActive: true
            }

            if (user.isAccountOwner && !result.type) {
              setData.isActive = true;
            }

            UserObj.updateOne({ email: req.body.email }, { $set: setData }).then(result => {
              return res.jsonp({
                status: "success",
                messageId: 201,
                message: constantObj.messages.EmailVerificationSuccess
              });
            })
          });
        } else {
          return res.jsonp(errorHandler(constantObj.messages.OtpExpired));
        }
      } else {
        return res.jsonp(errorHandler(constantObj.messages.OtpMismatch));
      }
    });
  })
};

exports.VerifyMobilePhone = (req, res) => {
  AccountVerifcationObj.findOne({
    mobilePhone: req.body.mobilePhone,
    verificationCode: req.body.verificationCode
  }).lean().exec(function (err, result) {
    if (err) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData
      });
    }

    // If we found a mobilePhone and code, then check expiry time.
    if (result) {
      let d1 = new Date(result.expiryTime);
      let d2 = new Date();
      if (d1.getTime() >= d2.getTime()) {
        AccountVerifcationObj.deleteMany({ mobilePhone: req.body.mobilePhone }, function (err, data) {
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
            message: constantObj.messages.PhoneVerificationSucess
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

function saveEmailVerificationCode(user, res, type) {
  AccountVerifcationObj.findOne({ email: user.email }).lean().exec(function (err, result) {
    if (err) {
      return res.jsonp(errorHandler());
    }

    let d = new Date();
    d.setMinutes(d.getMinutes() + 30);

    if (result) {
      // If Record Already Exist. Then Update Record
      let updateData = {
        verificationCode: verificationCode(),
        expiryTime: d
      }
      AccountVerifcationObj.updateOne({ _id: result._id }, { $set: updateData }).then(updated => {
        sendVerificationEmail(user, updateData, res);
      })
    } else {
      // Create Record
      let adding = new AccountVerifcationObj({
        email: user.email,
        verificationCode: verificationCode(),
        expiryTime: d,
        type: user?.type
      });

      adding.save(function (err, post) {
        if (err) {
          return res.jsonp(errorHandler());
        } else {
          sendVerificationEmail(user, post, res, type);
        }
      });
    }
  })
}

function sendVerificationEmail(user, data, res, type) {
  if (type === "SIGNUP") {
    let emailTemplateData = {
      userFirstName: user.firstName,
      verifyCode: data.verificationCode
    };
    sendEmailUsingTemplate(user.email, process.env.SignUpWelcome, emailTemplateData);
  } else {
    let emailTemplateData = {
      userFirstName: user.firstName,
      verifyCode: data.verificationCode
    };
    sendEmailUsingTemplate(user.email, process.env.VerifyEmail, emailTemplateData);
  }
  return res.jsonp({
    status: "success",
    messageId: 200,
    message: constantObj.messages.VerificationEmail + " " + user.email,
    data: {
      email: user.email
    }
  });
}

exports.SendCodeMobilePhone = (req, res) => {
  try {
    let date = new Date();
    date.setMinutes(date.getMinutes() + 15);
    const objToSave = {
      mobilePhone: req.body.mobilePhone,
      verificationCode: verificationCode(),
      expiryTime: date
    };
    saveMobileOTP(objToSave);
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: constantObj.messages.VerificationPhone
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

function saveMobileOTP(objToSave) {
  AccountVerifcationObj.findOneAndDelete({ mobilePhone: objToSave.mobilePhone }).exec(function (errrr, data) {
    let verifyModelObj = new AccountVerifcationObj(objToSave);
    verifyModelObj.save(objToSave, function (err, response) {
      let toNumber = objToSave.mobilePhone;
      let message = 'My Machine Online: Verification code to verify your mobile phone number is: ' + objToSave.verificationCode;
      sendMobileText(toNumber, message);
    });
  })
}

exports.ForgotPassword = (req, res) => {
  UserObj.findOne({ email: req.body.email.toLowerCase() }, function (err, user) {
    if (err) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData
      });
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
    resetPasswordLink: process.env.PORTAL_URL + "/reset-password/" + token
  };
  sendEmailUsingTemplate(user.email, process.env.ForgotPassword, emailTemplateData);
}

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
      let encryptedPass = encryptPassword(req.body.password);
      let updateData = {
        password: encryptedPass
      };
      UserObj.updateOne({ email: data.email }, { $set: updateData }).then(result => {
        UserObj.findOne({ email: data.email }, function (err, data) {
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

// User Profile API's

// Change Password API
exports.ChangePassword = function (req, res) {
  UserObj.findOne({ _id: req.body._id }, { password: 1 }).lean().exec(function (err, data) {
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
        UserObj.updateOne({ _id: req.body._id }, { $set: updatePassword }, function (err, result) {
          return res.jsonp({
            'status': 'success',
            'messageId': 200,
            'message': constantObj.messages.PasswordChangedSuccess
          });
        });
      } else {
        //Old Password is Incorrect
        return res.jsonp({
          'status': 'failure',
          'messageId': 203,
          'message': constantObj.messages.OldPasswordIncorrect
        });
      }
    }
  });
}

// Get User Profile
exports.GetProfile = (req, res) => {
  UserObj.findOne({ _id: req.body._id }).populate('company', 'name currency').lean().exec(function (err, user) {
    if (!user || err) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.ErrorRetrievingData
      });
    }
    userProfileData(user, res);
  })
};

// Update User Profile
exports.UpdateProfile = async (req, res) => {
  try {
    if (req.body.lastLogin) {
      const user = await UserObj.findByIdAndUpdate(req.body._id, {
        $push: { "lastLogin": { $each: [req.body.lastLogin], $slice: -10 } }
      }, { new: true }).populate('company', 'name currency');
      userProfileData(user, res);
    } else {
      const user = await UserObj.findByIdAndUpdate(req.body._id, {
        $set: req.body
      }, { new: true }).populate('company', 'name currency');
      userProfileData(user, res);
    }
  } catch (err) {
    return res.jsonp({
      status: "failure",
      messageId: 203,
      message: constantObj.messages.ErrorRetrievingData
    });
  }
};

function userProfileData(user, res) {
  let mobilePhone = user.mobilePhone;
  let countryCodeLength = mobilePhone.length - 10;
  return res.jsonp({
    status: "success",
    messageId: 200,
    message: constantObj.messages.ProfileUpdated,
    user: {
      _id: user._id,
      company: {
        name: user.company.name,
        currency: user.company.currency
      },
      username: user.username ? user.username : null,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      profilePic: user.profilePic,
      timezone: user.timezone,
      countryCode: user.countryCode,
      mobilePhoneNumber: mobilePhone,
      mobilePhone: mobilePhone.substring(countryCodeLength, mobilePhone.length),
      mobileVerified: user.mobileVerified,
      addressLine1: user.address.line1 ? user.address.line1 : '',
      addressLine2: user.address.line2 ? user.address.line2 : '',
      city: user.address.city ? user.address.city : '',
      state: user.address.state ? user.address.state : '',
      country: user.address.country ? user.address.country : '',
      zipcode: user.address.zipcode ? user.address.zipcode : '',
      notifications: user.notifications ? user.notifications : null,
      permissions: user.permissions
    }
  });
}

exports.LoginAsUser = (req, res) => {
  UserObj.findOne({ email: req.body.email.toLowerCase() }).then(user => {
    if (!user) {
      return res.jsonp({
        status: "failure",
        messageId: 203,
        message: constantObj.messages.EmailPasswordError
      });
    }

    const authToken = createJwtToken(user);
    let inputJson = {
      user: user._id,
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
          company: user.company,
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