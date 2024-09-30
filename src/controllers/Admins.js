const fs = require("fs");
const lodash = require("lodash");

const AdminObj = require("../models/Admin");
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

const AdminPermissionFile = './src/config/AdminPermission.json';

// Create Admin
exports.CreateAdmin = (req, res) => {
    AdminObj.findOne({ mobilePhone: req.body.mobilePhone }).lean().exec(function (err, userData) {
        if (err) {
            return res.jsonp(errorHandler());
        }
        if (userData) {
            return res.jsonp(errorHandler(constantObj.messages.PhoneExist));
        }
        req.body.email = req.body.email.toLowerCase();
        // Create New Record
        AdminObj.findOne({ email: req.body.email }).lean().exec(function (err, user) {
            if (err) {
                return res.jsonp(errorHandler());
            }
            if (user) {
                return res.jsonp(errorHandler(constantObj.messages.EmailExist));
            }
            let password = generatePassword(8);
            let encryptPass = encryptPassword(password);
            req.body.firstName = firstLetterCapital(req.body.firstName);
            req.body.lastName = firstLetterCapital(req.body.lastName);
            let inputJson = req.body;
            inputJson.password = encryptPass;
            inputJson.isActive = true;
            inputJson.awsDirectory = randomString(4);
            inputJson.timezone = constantObj.defaultTimezone;
            fs.readFile(AdminPermissionFile, function (err, defaultPermissions) {
                if (err) {
                    return res.jsonp(errorHandler());
                }
                let permissions = JSON.parse(defaultPermissions);
                const filteredPermissionsByRole = lodash.filter(permissions.roles, { name: inputJson.role });
                inputJson.permissions = filteredPermissionsByRole[0].permissions;
                const adminModel = new AdminObj(inputJson);
                adminModel.save().then(result => {
                    // Send Email To User
                    let emailTemplateData = {
                        userFirstName: req.body.firstName,
                        email: req.body.email,
                        password: password,
                        websiteUrl: process.env.SUPERADMIN_PORTAL_URL,
                        message: "You are added as " + req.body.role + " on My Machine Online."
                    };
                    sendEmailUsingTemplate(req.body.email, process.env.AddUser, emailTemplateData);
                    return res.jsonp({
                        status: "success",
                        messageId: 200,
                        message: "User " + constantObj.messages.RecordAdded
                    });
                }).catch(err => {
                    return res.jsonp({
                        status: "failure",
                        messageId: 203,
                        message: err.message
                    });
                });
            })
        });
    })
};

// Get Admin By Id
exports.GetAdminById = (req, res) => {
    AdminObj.findOne({ _id: req.params.id })
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

// Delete Admin By Id
exports.DeleteAdminById = (req, res) => {
    AdminObj.findOne({ _id: req.params.id }).lean().exec(function (err, data) {
        if (err) {
            return res.jsonp(errorHandler());
        }
        AdminObj.updateOne({ _id: req.params.id }, { $set: { isDeleted: true, isActive: false } }, function (err, response) {
            if (err) {
                return res.jsonp(errorHandler());
            }
            return res.jsonp({
                status: 'success',
                messageId: 200,
                message: "User " + constantObj.messages.RecordDeleted
            });
        });
    })
};

// Update Admin By Id
exports.UpdateAdminById = (req, res) => {
    AdminObj.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, response) {
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

// Get All Admins
exports.GetAllAdmins = (req, res) => {
    let perPage = Number(req.params.perPage) || 10;
    let page = Number(req.params.page) || 1;
    let inputJson = {
        _id: {
            $ne: req.params.id
        }
    };
    if (req.params.status === "ACTIVE") {
        inputJson.isActive = true;
    } else if (req.params.status === "INACTIVE") {
        inputJson.isActive = false;
    }
    AdminObj.find(inputJson)
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate("createdBy", 'firstName lastName')
        .populate("updatedBy", 'firstName lastName')
        .lean()
        .sort({ updatedAt: -1 })
        .exec(function (err, data) {
            if (err) {
                return res.jsonp(errorhandler());
            }
            let message = constantObj.messages.SuccessRetreivingData;
            getPasswordForAdmin(inputJson, data, 0, message, res);
        })
};

// Search Admins
exports.SearchAdmins = async (req, res) => {
    try {
        const perPage = Number(req.body.perPage) || 10;
        const page = Number(req.body.page) || 1;
        const searchText = req.body.searchText;
        const regex = { $regex: searchText.trim(), $options: "i" };
        let query = {
            _id: {
                $ne: req.body._id
            },
            $or: [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { role: regex }
            ]
        };

        let searchMessage = constantObj.messages.SearchResult + searchText;

        if (req.body.status === "ACTIVE") {
            query.isActive = true;
        } else if (req.body.status === "INACTIVE") {
            query.isActive = false;
        }

        const data = await AdminObj.find(query)
            .populate("createdBy", 'firstName lastName')
            .populate("updatedBy", 'firstName lastName')
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({ updatedAt: -1 });

        let message = data?.length ? searchMessage : constantObj.messages.NoRecordFound;
        getPasswordForAdmin(query, data, 0, message, res);
    } catch (error) {
        return res.jsonp(errorHandler(error.message));
    }
};

function getPasswordForAdmin(inputJson, data, idx, message, res) {
    if (idx < data.length) {
        if (data[idx].password) {
            let password = decryptPassword(data[idx].password);
            data[idx].password = password;
        }
        idx++;
        getPasswordForAdmin(inputJson, data, idx, message, res);
    } else {
        AdminObj.countDocuments(inputJson).exec(function (err, totalRecords) {
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