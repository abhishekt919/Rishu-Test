const stripe = require('stripe')(process.env.StripeSecretKey);

const CompanyObj = require("../models/Company");
const UserObj = require("../models/User");
const AdminObj = require("../models/Admin");
const AccessTokenObj = require("../models/AccessToken");

const constantObj = require("../config/Constants");
const {
  createJwtToken,
  decryptPassword,
  encryptPassword,
  errorHandler
} = require("./../helpers/helperFunctions");
const { sendEmailUsingTemplate } = require("./../config/EmailService");

// Get Company By Id
exports.GetCompanyById = (req, res) => {
  let message = constantObj.messages.SuccessRetreivingData;
  getCompanyData(req.params.companyId, res, message);
}

function getCompanyData(companyId, res, message) {
  CompanyObj.findOne({ _id: companyId }).populate('createdBy', 'firstName lastName email mobilePhone').lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    if (data.phone) {
      let phone = data.phone;
      let countryCodeLength = phone.length - 10;
      data.countryCode = data.countryCode;
      data.phone = phone.substring(countryCodeLength, phone.length);
    }
    // Billing Address
    data.addressLine1 = data.billingAddress?.line1 ? data.billingAddress.line1 : '';
    data.addressLine2 = data.billingAddress?.line2 ? data.billingAddress.line2 : '';
    data.city = data.billingAddress?.city ? data.billingAddress.city : '';
    data.state = data.billingAddress?.state ? data.billingAddress.state : '';
    data.country = data.billingAddress?.country ? data.billingAddress.country : '';
    data.zipcode = data.billingAddress?.zipcode ? data.billingAddress.zipcode : '';

    // Shipping Address
    data.shippingAddressLine1 = data.shippingAddress?.line1 ? data.shippingAddress.line1 : '';
    data.shippingAddressLine2 = data.shippingAddress?.line2 ? data.shippingAddress.line2 : '';
    data.shippingCity = data.shippingAddress?.city ? data.shippingAddress.city : '';
    data.shippingState = data.shippingAddress?.state ? data.shippingAddress.state : '';
    data.shippingCountry = data.shippingAddress?.country ? data.shippingAddress.country : '';
    data.shippingZipcode = data.shippingAddress?.zipcode ? data.shippingAddress.zipcode : '';

    return res.jsonp({
      status: 'success',
      messageId: 200,
      data: data,
      message: message
    });
  });
}

// Update Company
exports.UpdateCompanyById = async (req, res) => {
  if (req.body.customerId) {
    // Update Stripe customer
    stripe.customers.update(req.body.customer, req.body.stripeCustomerObj, function (err, Updated) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }
      updateCompany(req.body, res);
    })
  } else {
    // Create Stripe customer
    stripe.customers.create(req.body.stripeCustomerObj)
      .then(customer => {
        req.body.customerId = customer.id;
        updateCompany(req.body, res);
      })
      .catch(err => {
        return res.jsonp(errorHandler(err.message));
      });
  }
}

const updateCompany = async (body, res) => {
  try {
    const updatedJson = body;
    await CompanyObj.findByIdAndUpdate(body._id, { $set: updatedJson });
    let message = "Company " + constantObj.messages.RecordUpdated;
    getCompanyData(body._id, res, message);
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
}

// Delete Company By Id
exports.DeleteCompanyById = (req, res) => {
  CompanyObj.updateOne({ _id: req.body._id }, { $set: { isDeleted: true, isActive: false } }, function (err, response) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    return res.jsonp({
      status: 'success',
      messageId: 200,
      message: constantObj.messages.RecordAdded
    });
  });
};

//  Get Affiliated Company List DropDown
exports.GetAffiliatedCompanyList = (req, res) => {
  CompanyObj.findOne({ _id: req.params.companyId }, { affiliateCode: 1 }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    CompanyObj.find({ referralCode: data.affiliateCode }, { _id: 1, name: 1 })
      .sort({ name: 1 })
      .lean()
      .exec(function (err, data) {
        if (err) {
          return res.jsonp(errorHandler());
        }
        return res.jsonp({
          'status': 'success',
          'messageId': 200,
          'message': constantObj.messages.SuccessRetreivingData,
          'data': data
        });
      })
  })
}

//  Get Affiliated Company And My
exports.GetAffiliatedCompanyAndMy = (req, res) => {
  CompanyObj.findOne({ _id: req.params.companyId }, { affiliateCode: 1, _id: 1, name: 1 }).lean().exec(function (err, result) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    CompanyObj.find({ referralCode: result.affiliateCode }, { _id: 1, name: 1 })
      .sort({ name: 1 })
      .lean()
      .exec(function (err, data) {
        if (err) {
          return res.jsonp(errorHandler());
        }

        let finalResult = data ? data : [];
        finalResult.push({
          _id: result._id,
          name: result.name
        })

        return res.jsonp({
          'status': 'success',
          'messageId': 200,
          'message': constantObj.messages.SuccessRetreivingData,
          'data': finalResult
        });
      })
  })
}

//  Get Affiliated Company
exports.GetAffiliatedCompanies = (req, res) => {
  let perPage = Number(req.params.perPage) || 10;
  let page = Number(req.params.page) || 1;
  CompanyObj.findOne({ _id: req.params.companyId }, { affiliateCode: 1 }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    const query = {
      referralCode: data.affiliateCode
    };
    CompanyObj.find(query)
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .populate('createdBy', 'firstName lastName email mobilePhone')
      .sort({ name: 1 })
      .lean()
      .exec(function (err, data) {
        if (err) {
          return res.jsonp(errorHandler());
        }
        CompanyObj.countDocuments(query).exec(function (err, totalRecords) {
          return res.jsonp({
            'status': 'success',
            'messageId': 200,
            'messageId': constantObj.messages.SuccessRetreivingData,
            'data': data,
            'totalRecords': totalRecords
          });
        })
      })
  })
}

/* SuperAdmin API's Start Here */

// Get Company List
exports.GetCompanyList = (req, res) => {
  let perPage = Number(req.params.perPage) || 10;
  let page = Number(req.params.page) || 1;
  CompanyObj.find()
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .populate('verifiedBy', 'firstName lastName')
    .populate('createdBy', 'firstName lastName email mobilePhone password')
    .sort({ createdAt: -1 })
    .lean().exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler());
      }
      getPasswordForUser(data, 0, res);
    })
}

function getPasswordForUser(data, idx, res) {
  if (idx < data.length) {
    let password = decryptPassword(data[idx].createdBy.password);
    data[idx].createdBy.password = password;
    idx++;
    getPasswordForUser(data, idx, res);
  } else {
    CompanyObj.countDocuments().exec(function (err, totalRecords) {
      return res.jsonp({
        'status': 'success',
        'messageId': 200,
         'message': constantObj.messages.SuccessRetreivingData,
        'data': data,
        'totalRecords': totalRecords
      });
    })
  }
}

// Get Company Count
exports.GetCompanyCount = (req, res) => {
  CompanyObj.countDocuments().exec(function (err, data) {
    return res.jsonp({
      'status': 'success',
      'messageId': 200,
      'message': constantObj.messages.SuccessRetreivingData,
      'data': data
    });
  })
};

// Activate/Deactivate Company
exports.ApproveCompany = (req, res) => {
  CompanyObj.updateOne({ _id: req.body.companyId }, { $set: { isActive: req.body.isActive, verifiedBy: req.body.verifiedBy } }, function (err, response) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    UserObj.updateMany({ company: req.body.companyId }, { $set: { isActive: req.body.isActive } }, function (err, response) {
      UserObj.find({ company: req.body.companyId }, { firstName: 1, email: 1 }).lean().exec(function (err, result) {
        if (result.length > 0) {
          for (let idx = 0; idx < result.length; idx++) {
            let emailTemplateData = {
              userFirstName: result[idx].firstName
            };
            if (req.body.isActive) {
              // Send Activation Email
              sendEmailUsingTemplate(result[idx].email, process.env.AccountActivated, emailTemplateData);
            } else {
              // Send Deactivation Email
              sendEmailUsingTemplate(result[idx].email, process.env.AccountDeactivated, emailTemplateData);
            }
          }
        }
        return res.jsonp({
          status: 'success',
          messageId: 200,
          message: req.body.isActive ? (req.body.companyName + " " + constantObj.messages.CompanyActivated) : (req.body.companyName + " " + constantObj.messages.CompanyDeactivated)
        });
      })
    })
  });
};

exports.GetAllCompanyList = (req, res) => {
  CompanyObj.find({}, { _id: 1, name: 1 })
    .sort({ name: 1 })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler());
      }
      return res.jsonp({
        'status': 'success',
        'messageId': 200,
        'message': constantObj.messages.SuccessRetreivingData,
        'data': data
      });
    })
}

// Get Company Details
exports.GetCompanyDetails = (req, res) => {
  CompanyObj.findOne({ _id: req.body._id }, { name: 1, machineTypes: 1 })
    .populate('machineTypes', 'name')
    .lean().exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler());
      }

      return res.jsonp({
        'status': 'success',
        'messageId': 200,
        'message': constantObj.messages.SuccessRetreivingData,
        'data': data
      });
    })
}

// Update Company Settings
exports.UpdateCompanySettings = (req, res) => {
  CompanyObj.updateOne({ _id: req.body._id }, { $set: { machineTypes: req.body.machineTypes } }, function (err, response) {
    CompanyObj.findOne({ _id: req.body._id }, { name: 1, machineTypes: 1 })
      .populate('machineTypes', 'name')
      .lean().exec(function (err, data) {
        if (err) {
          return res.jsonp(errorHandler());
        }

        return res.jsonp({
          'status': 'success',
          'messageId': 200,
          'message': "Company settings " + constantObj.messages.RecordUpdated,
          'data': data
        });
      })
  })
}

// Super Admin Login to company account
exports.SuperAdminLogin = (req, res) => {
  UserObj.findOne(
    { email: req.body.email.toLowerCase() },
    { _id: 1, company: 1 }
  ).populate("company", "name isActive")
    .then((user) => {
      if (!user) {
        return res.jsonp(errorHandler(constantObj.messages.EmailPasswordError));
      }

      if (!user.company.isActive) {
        return res.jsonp(errorHandler(user.company.name + " " + constantObj.messages.CompanyNotApproved));
      }

      const authToken = createJwtToken(user);
      let inputJson = {
        user: user._id,
        accessToken: authToken,
      };
      const accessToken = new AccessTokenObj(inputJson);
      accessToken.save().then((result) => {
        return res.jsonp({
          status: "success",
          messageId: 200,
          message: constantObj.messages.SuccessRetreivingData,
          accessToken: authToken,
          redirectUrl: process.env.PORTAL_URL + "/dashboard",
          superAdminLogin: encryptPassword(req.body.superAdminLogin)
        });
      });
    })
    .catch((err) => {
      return res.jsonp(errorHandler());
    });
};

// SwitchTo Super Admin Account
exports.SwitchToSuperAdmin = (req, res) => {
  let email = decryptPassword(req.body.email);
  AdminObj.findOne({ email: email.toLowerCase() }, { _id: 1 }).then((user) => {
    if (!user) {
      return res.jsonp(errorHandler(constantObj.messages.EmailPasswordError));
    }

    const authToken = createJwtToken(user);
    let inputJson = {
      admin: user._id,
      accessToken: authToken
    }
    const accessToken = new AccessTokenObj(inputJson);
    accessToken.save().then((result) => {
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        accessToken: authToken,
        redirectUrl: process.env.SUPERADMIN_PORTAL_URL + "/dashboard"
      });
    });
  }).catch((err) => {
    return res.jsonp(errorHandler());
  });
};
