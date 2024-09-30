const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccessTokenSchema = new mongoose.Schema({
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    accessToken: {
        type: String,
        required: true
    },
});

const AccessTokenObj = mongoose.model('AccessToken', AccessTokenSchema);
module.exports = AccessTokenObj;