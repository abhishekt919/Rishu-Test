const lodash = require("lodash");

const constantObj = require("../config/Constants");
const { errorHandler, firstLetterCapital } = require("../helpers/helperFunctions");
const UserPermissionObj = require("../models/UserPermissions");

// CREATE UPDATE USER PERMISSION
exports.CreateUpdateUserPermission = async (req, res) => {
    try {
        req.body.moduleName = firstLetterCapital(req.body.moduleName);
        const { _id, moduleCode } = req.body;

        if (_id) {
            const result = await UserPermissionObj.findByIdAndUpdate(_id, req.body);
            return res.jsonp({
                status: "success",
                messageId: 200,
                message: `User Permission ${constantObj.messages.RecordUpdated}`,
                data: result,
            });
        } else {
            const isExists = await UserPermissionObj.exists({ moduleCode });
            if (isExists) {
                return res.jsonp(
                    errorHandler(`Record ${constantObj.messages.AlreadyExisted}`)
                );
            }
            const userPermissionModel = new UserPermissionObj(req.body);
            const result = await userPermissionModel.save();
            return res.jsonp({
                status: "success",
                messageId: 200,
                message: `User Permission ${constantObj.messages.RecordAdded}`,
                data: result,
            });
        }
    } catch (error) {
        return res.jsonp(errorHandler(error.message));
    }
};

// GET ALL USER PERMISSIONS
exports.GetUserPermissions = async (req, res) => {
    try {
        const { searchText } = req.body;
        const perPage = Number(req.body.perPage) || 10;
        const page = Number(req.body.page) || 1;

        const query = { isDeleted: false };
        if (searchText) {
            const regex = { $regex: searchText.trim(), $options: "i" };
            query.$or = [
                { moduleName: regex },
                { moduleCode: regex }
            ]
        }

        const result = await UserPermissionObj.find(query)
            .populate("createdBy", "firstName lastName")
            .populate("updatedBy", "firstName lastName")
            .skip(perPage * page - perPage)
            .limit(perPage)
            .sort({ updatedAt: -1 });

        const totalRecords = await UserPermissionObj.countDocuments(query);

        return res.jsonp({
            status: "success",
            messageId: 200,
            message: searchText
                ? `Search results for query: ${searchText}`
                : constantObj.messages.SuccessRetreivingData,
            data: result,
            totalRecords
        });
    } catch (error) {
        return res.jsonp(errorHandler(error.message));
    }
};

// GET USER PERMISSION BY ID
exports.GetUserPermissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserPermissionObj.findById(id);

        return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.SuccessRetreivingData,
            data: result,
        });
    } catch (error) {
        return res.jsonp(errorHandler(error.message));
    }
};

// DELETE USER PERMISSION BY ID
exports.DeleteUserPermissionById = async (req, res) => {
    try {
        const { id } = req.params;
        await UserPermissionObj.updateOne({ _id: id }, { isDeleted: true });

        return res.jsonp({
            status: "success",
            messageId: 200,
            message: `User Permission ${constantObj.messages.RecordDeleted}`,
        });
    } catch (error) {
        return res.jsonp(errorHandler(error.message));
    }
};

exports.GetUserPermissionsByRole = async (role) => {
    const filteredPermissionsByRole = [];
    const userPermissions = await UserPermissionObj.find({
        isDeleted: false,
    }).lean();
    for (let index = 0; index < userPermissions.length; index++) {
        const element = userPermissions[index];
        const permission = lodash.find(element.roles, { name: role });
        if (permission) filteredPermissionsByRole.push(permission);
    }
    return filteredPermissionsByRole;
};
