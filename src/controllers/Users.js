const fs = require("fs");
const Json2csvParser = require('json2csv').Parser;
const moment = require("moment");

const UserObj = require("../models/User");
const constantObj = require("../config/Constants");
const {
  decryptPassword,
  encryptPassword,
  errorHandler,
  firstLetterCapital,
  generatePassword,
  randomString
} = require("./../helpers/helperFunctions");
const { sendEmailUsingTemplate } = require("./../config/EmailService");
const { GetUserPermissionsByRole } = require("./UserPermissions");

// Create Users
exports.CreateUser = async (req, res) => {
  try {
    req.body.email = req.body.email.toLowerCase();
    if (req.body._id) {
      const data = await UserObj.findOne(
        { _id: req.body._id },
        { isAccountOwner: 1 }
      ).lean();
      if (data.isAccountOwner && !req.body.isSuperAdminSubmitting) {
        return res.jsonp(errorHandler(constantObj.messages.UnauthorizedAction));
      } else {
        if (req.body.role && req.body?.isRoleUpdated) {
          req.body.permissions = await GetUserPermissionsByRole(req.body.role);
        }
        await UserObj.updateOne({ _id: req.body._id }, { $set: req.body });

        return res.jsonp({
          status: "success",
          messageId: 200,
          message: "User " + constantObj.messages.RecordUpdated,
        });
      }
    } else {
      // Create New Record
      const userMobile = await UserObj.findOne({ mobilePhone: req.body.mobilePhone }).lean();
      if (userMobile) {
        return res.jsonp(errorHandler(constantObj.messages.PhoneExist));
      }
      const userEmail = await UserObj.findOne({ email: req.body.email }).lean();
      if (userEmail) {
        return res.jsonp(errorHandler(constantObj.messages.EmailExist));
      }

      let password = generatePassword(8);
      let encryptPass = encryptPassword(password);
      req.body.firstName = firstLetterCapital(req.body.firstName);
      req.body.lastName = firstLetterCapital(req.body.lastName);
      let inputJson = req.body;
      inputJson.password = encryptPass;
      inputJson.awsDirectory = randomString(4);
      inputJson.address = {
        country: req.body.country
      }
      inputJson.timezone = constantObj.defaultTimezone;
      req.body.permissions = await GetUserPermissionsByRole(inputJson.role);
      const userModel = new UserObj(inputJson);
      const result = await userModel.save();
      // Send Email To User
      let emailTemplateData = {
        userFirstName: req.body.firstName,
        email: req.body.email,
        password: password,
        websiteUrl: process.env.PORTAL_URL,
        message: "You are added as " + result.role + " on My Machine Online."
      };
      sendEmailUsingTemplate(req.body.email, process.env.AddUser, emailTemplateData);
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: "User " + constantObj.messages.RecordAdded
      });
    }
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

// Get Users
exports.GetUsers = (req, res) => {
  let inputJson = {
    company: req.params.companyId
  };
  if (req.params.status === "ACTIVE") {
    inputJson.isActive = true;
  } else if (req.params.status === "INACTIVE") {
    inputJson.isActive = false;
  }
  UserObj.find(inputJson)
    .populate("createdBy", 'firstName lastName')
    .populate("updatedBy", 'firstName lastName')
    .sort({ updatedAt: -1 })
    .lean().exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler());
      }
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data
      });
    })
};

// Get Active Users Only
exports.GetActiveUsers = (req, res) => {
  UserObj.find({ company: req.params.companyId, isDeleted: false, isActive: true }, { firstName: 1, lastName: 1, email: 1, role: 1 }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: constantObj.messages.SuccessRetreivingData,
      data: data
    });
  })
};

// Get User By Id
exports.GetUserById = (req, res) => {
  UserObj.findOne({ _id: req.params.id })
    .lean().exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler());
      }
      let mobilePhone = data.mobilePhone;
      let countryCodeLength = mobilePhone.length - 10;
      data.countryCode = data.countryCode;
      data.mobilePhone = mobilePhone.substring(countryCodeLength, mobilePhone.length);
      return res.jsonp({
        status: "success",
        messageId: 200,
        message: constantObj.messages.SuccessRetreivingData,
        data: data
      });
    })
};

// Delete User By Id
exports.DeleteUserById = (req, res) => {
  UserObj.findOne({ _id: req.params.id }, { isAccountOwner: 1 }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    if (data.isAccountOwner) {
      return res.jsonp(errorHandler(constantObj.messages.UnauthorizedAccessError));
    } else {
      UserObj.updateOne({ _id: req.params.id }, { $set: { isDeleted: true, isActive: false } }, function (err, response) {
        if (err) {
          return res.jsonp(errorHandler());
        }
        return res.jsonp({
          status: 'success',
          messageId: 200,
          message: "User " + constantObj.messages.RecordDeleted
        });
      });
    }
  })
};

// Update User By Id
exports.UpdateUserById = (req, res) => {
  UserObj.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, response) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    return res.jsonp({
      status: 'success',
      messageId: 200,
      message: "User " + constantObj.messages.RecordUpdated
    });
  });
};

// Get Users Count
exports.GetUsersCount = (req, res) => {
  UserObj.countDocuments({ company: req.params.companyId }).lean().exec(function (err, count) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: constantObj.messages.SuccessRetreivingData,
      data: count
    });
  })
};

// Download Users Data
exports.DownloadUsersByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const data = await UserObj.find({ company: companyId }, { company: 1, firstName: 1, lastName: 1, email: 1, username: 1, role: 1, mobilePhone: 1, isActive: 1, createdAt: 1, createdBy: 1, updatedAt: 1, updatedBy: 1 })
      .populate("company", 'name')
      .populate("createdBy", 'firstName lastName')
      .populate("updatedBy", 'firstName lastName')
      .sort({ updatedAt: -1 });

    if (data.length > 0) {
      let csvData = [];
      createDownloadData(data, 0, csvData, res)
    } else {
      return res.jsonp(errorHandler(constantObj.messages.NoDataToDownload));
    }
  } catch (err) {
    return res.jsonp(errorHandler(err.message));
  }
}

function createDownloadData(data, dataIdx, csvData, res) {
  if (dataIdx < data.length) {
    let userData = data[dataIdx];
    let currentUser = {
      'Name': userData.firstName + " " + userData.lastName,
      'Email': userData.email,
      'Username': userData.username,
      'Mobile Phone': userData.mobilePhone,
      'Role': firstLetterCapital(userData.role),
      'Status': userData.isActive ? 'ACTIVE' : 'INACTIVE',
      'Created At': moment(userData.createdAt).format(constantObj.dateFormat),
      'Created By': userData.createdBy ? userData.createdBy.firstName + " " + userData.createdBy.lastName : "",
      'Updated At': moment(userData.updatedAt).format(constantObj.dateFormat),
      'Updated By': userData.updatedBy ? userData.updatedBy.firstName + " " + userData.updatedBy?.lastName : ""
    }
    csvData.push(currentUser);
    dataIdx++;
    createDownloadData(data, dataIdx, csvData, res);
  } else {
    let fields = ['Name', 'Email', 'Username', 'Mobile Phone', 'Role', 'Status', 'Created At', 'Created By', 'Updated At', 'Updated By'];
    const json2csvParser = new Json2csvParser({ fields });
    const csv = json2csvParser.parse(csvData);
    let fileName = data[0].company.name + " Users.csv";
    let path = "public/files/csv/" + fileName;
    fs.writeFile(path, csv, function (err) {
      return res.jsonp({
        'message': 'Users data ' + constantObj.messages.DownloadSuccess,
        'status': 'success',
        'messageId': 200,
        'data': process.env.API_URL + "/files/csv/" + fileName
      })
    });
  }
}

// Get Permissions By User Id
exports.GetPermissionsByUserId = async (req, res) => {
  try {
    const data = await UserObj.findOne(
      { _id: req.params.userId },
      { firstName: 1, lastName: 1, permission: 1, role: 1 }
    ).lean();

    return res.jsonp({
      status: "success",
      messageId: 200,
      data: data,
      message: constantObj.messages.SuccessRetreivingData,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

// Update User Permissions By User Id
exports.UpdateUserPermissionsByUserId = async (req, res) => {
  try {
    const { action } = req.body;

    let data = null;
    switch (action) {
      case "addPermission":
        data = await updateModulePermissionsByUserId(req);
        break;

      case "removePermission":
        data = await updateModulePermissionsByUserId(req);
        break;

      case "addAllModulesPermission":
        data = await updateAllModulesPermissionsByUserId(req);
        break;

      case "removeAllModulesPermission":
        data = await updateAllModulesPermissionsByUserId(req);
        break;

      case "resetPermissions":
        data = await resetUserPermissionsByUserId(req);
        break;

      default:
        break;
    }

    return res.jsonp({
      status: "success",
      messageId: 200,
      data: data,
      message: `User permission ${constantObj.messages.RecordUpdated}`,
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

const updateModulePermissionsByUserId = async (req) => {
  const { action, userId, permission, moduleCode, updatedBy } = req.body;

  let updateJson = {};
  if (permission) {
    updateJson =
      action === "addPermission"
        ? {
          $addToSet: { "permissions.$[existing].permissions": permission },
          $set: { updatedBy },
        }
        : {
          $pull: { "permissions.$[existing].permissions": permission },
          $set: { updatedBy },
        };
  } else {
    updateJson = {
      $set: { "permissions.$[existing].permissions": [], updatedBy },
    };
  }

  const data = await UserObj.findByIdAndUpdate(userId, updateJson, {
    arrayFilters: [{ "existing.moduleCode": moduleCode }],
    projection: { firstName: 1, lastName: 1, permissions: 1, role: 1 },
    new: true,
  });
  return data;
};

const updateAllModulesPermissionsByUserId = async (req) => {
  const { action, userId, permission, updatedBy } = req.body;
  let updateJson = {};

  if (permission) {
    updateJson =
      action === "addAllModulesPermission"
        ? {
          $addToSet: { "permissions.$[].permissions": permission },
          $set: { updatedBy },
        }
        : {
          $pull: { "permissions.$[].permissions": permission },
          $set: { updatedBy },
        };
  } else {
    updateJson = { $set: { "permissions.$[].permissions": [], updatedBy } };
  }

  const data = await UserObj.findByIdAndUpdate(userId, updateJson, {
    projection: { firstName: 1, lastName: 1, permissions: 1, role: 1 },
    new: true,
  });
  return data;
};

const resetUserPermissionsByUserId = async (req) => {
  const { role, userId, updatedBy } = req.body;
  const defaultsPermissions = await GetUserPermissionsByRole(role);
  const data = await UserObj.findByIdAndUpdate(
    userId,
    { $set: { permissions: defaultsPermissions, updatedBy } },
    {
      projection: { firstName: 1, lastName: 1, permissions: 1, role: 1 },
      new: true,
    }
  );
  return data;
};

// Get Default Permissions By Role
exports.GetDefaultPermissionsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const defaultsPermissions = await GetUserPermissionsByRole(role);
    return res.jsonp({
      status: "success",
      messageId: 200,
      data: defaultsPermissions
    });
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

// SuperAdmin API's

// Get All Users
exports.GetAllUsers = (req, res) => {
  let perPage = Number(req.params.perPage) || 10;
  let page = Number(req.params.page) || 1;
  let inputJson = {};
  if (req.params.status === "ACTIVE") {
    inputJson.isActive = true;
  } else if (req.params.status === "INACTIVE") {
    inputJson.isActive = false;
  }
  UserObj.find(inputJson)
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .populate("company", "name")
    .populate("createdBy", 'firstName lastName')
    .populate("updatedBy", 'firstName lastName')
    .lean()
    .sort({ updatedAt: -1 })
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler());
      }
      let message = constantObj.messages.SuccessRetreivingData;
      getPasswordForUser(inputJson, data, 0, message, res);
    })
};

// Search Users
exports.SearchUsers = async (req, res) => {
  try {
    const perPage = Number(req.body.perPage) || 10;
    const page = Number(req.body.page) || 1;
    const searchText = req.body.searchText;
    const regex = { $regex: searchText.trim(), $options: "i" };
    let query = {
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { role: regex }
      ]
    };

    let searchMessage = constantObj.messages.SearchResult + searchText;

    if (req.body.company) {
      query.company = req.body?.company?._id;
      searchMessage = searchMessage + ' ' + req.body?.company?.name;
    }

    if (req.body.status === "ACTIVE") {
      query.isActive = true;
    } else if (req.body.status === "INACTIVE") {
      query.isActive = false;
    }

    const data = await UserObj.find(query)
      .populate("company", "name")
      .populate("createdBy", 'firstName lastName')
      .populate("updatedBy", 'firstName lastName')
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .sort({ updatedAt: -1 });

    let message = data?.length ? searchMessage : constantObj.messages.NoRecordFound;
    getPasswordForUser(query, data, 0, message, res);
  } catch (error) {
    return res.jsonp(errorHandler(error.message));
  }
};

function getPasswordForUser(inputJson, data, idx, message, res) {
  if (idx < data.length) {
    if (data[idx].password) {
      let password = decryptPassword(data[idx].password);
      data[idx].password = password;
    }
    idx++;
    getPasswordForUser(inputJson, data, idx, message, res);
  } else {
    UserObj.countDocuments(inputJson).exec(function (err, totalRecords) {
      return res.jsonp({
        'status': 'success',
        'messageId': 200,
        'message': message,
        'data': data,
        'totalRecords': totalRecords
      });
    })
  }
}

// Get All Users Count
exports.GetAllUsersCount = (req, res) => {
  UserObj.countDocuments().lean().exec(function (err, count) {
    if (err) {
      return res.jsonp(errorHandler());
    }
    return res.jsonp({
      status: "success",
      messageId: 200,
      message: constantObj.messages.SuccessRetreivingData,
      data: count
    });
  })
};