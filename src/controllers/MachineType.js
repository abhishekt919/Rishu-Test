const CompanyObj = require("../models/Company");
const MachineTypeObj = require("../models/MachineType");
const constantObj = require("../config/Constants");

const { errorHandler } = require("../helpers/helperFunctions");

/* Create MachineType */
exports.CreateMachineType = async (req, res) => {
  try {
    if (req.body._id) {
      MachineTypeObj.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, response) {
        if (err) {
          return res.jsonp(errorHandler(err.message));
        }
        return res.jsonp({
          status: 'success',
          messageId: 200,
          message: "Machine type " + constantObj.messages.RecordUpdated
        });
      });
    } else {
      const MachineTypeModel = new MachineTypeObj(req.body);
      MachineTypeModel.save().then(result => {
        return res.jsonp({
          status: 'success',
          messageId: 200,
          message: "Machine Type " + constantObj.messages.RecordAdded
        });
      }).catch(err => {
        return res.jsonp(errorHandler(err.message));
      })
    }
  } catch (err) {
    return res.jsonp(errorHandler(err.message));
  }
}

/* Get MachineType By Id */
exports.GetMachineType = (req, res) => {
  MachineTypeObj.findOne({ _id: req.params.id }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(errorHandler(err.message));
    }
    return res.jsonp({
      status: 'success',
      messageId: 200,
      data: data
    });
  });
}

/* Delete MachineType By Id */
exports.DeleteMachineTypeById = (req, res) => {
  MachineTypeObj.updateOne({ _id: req.params.id }, { $set: { isDeleted: true } }, function (err, response) {
    if (err) {
      return res.jsonp(errorHandler(err.message));
    }
    return res.jsonp({
      status: 'success',
      messageId: 200,
      message: "Machine type " + constantObj.messages.RecordDeleted
    });
  });
};

/* Get MachineType List */
exports.GetMachineTypeList = (req, res) => {
  MachineTypeObj.find()
    .sort({ name: 1 })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }

      return res.jsonp({
        'status': 'success',
        'message': constantObj.messages.SuccessRetreivingData,
        'messageId': 200,
        'data': data
      });
    });
}

/* Get Active MachineType */
exports.GetActiveMachineType = (req, res) => {
  MachineTypeObj.find({ isDeleted: false }, { name: 1 })
    .sort({ name: 1 })
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }

      return res.jsonp({
        'status': 'success',
        'message': constantObj.messages.SuccessRetreivingData,
        'messageId': 200,
        'data': data
      });
    });
}

exports.GetAffiliatesMachineType = (req, res) => {
  CompanyObj.findOne({ _id: req.params.companyId }, { machineType: 1 })
    .populate('machineTypes', 'name')
    .lean()
    .exec(function (err, data) {
      if (err) {
        return res.jsonp(errorHandler(err.message));
      }

      return res.jsonp({
        'status': 'success',
        'message': constantObj.messages.SuccessRetreivingData,
        'messageId': 200,
        'data': data.machineTypes ? data.machineTypes : []
      });
    });
}