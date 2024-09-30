const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserPermissionSchema = new Schema(
    {
        moduleName: String,
        moduleCode: {
            type: String,
            uppercase: true,
        },
        description: String,
        roles: Array,
        isDeleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
        },
    },
    { timestamps: true }
);

const UserPermissionObj = mongoose.model(
    "UserPermission",
    UserPermissionSchema
);
module.exports = UserPermissionObj;
