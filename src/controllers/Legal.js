const LegalObj = require("../models/Legal");
const constantObj = require("../config/Constants");

const ErrorJSON = {
  status: 'failure',
  messageId: 203,
  message: constantObj.messages.ErrorRetrievingData
}

exports.UpdateLegal = (req, res) => {
  if (req.body._id) {
    LegalObj.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, response) {
      if (err) {
        return res.jsonp(ErrorJSON);
      }
      return res.jsonp({
        status: 'success',
        messageId: 200,
        message: (req.body.type === 'terms' ? 'Terms' : 'Privacy policy') + " " + constantObj.messages.RecordUpdated
      });
    });
  } else {
    LegalObj(req.body).save(req.body, function (err, response) {
      if (err) {
        return res.jsonp(ErrorJSON);
      }
      return res.jsonp({
        status: 'success',
        messageId: 200,
        message: (req.body.type === 'terms' ? 'Terms' : 'Privacy policy') + " " + constantObj.messages.RecordAdded
      });
    });
  }
};

exports.GetLegal = (req, res) => {
  LegalObj.findOne({ type: req.body.type }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(ErrorJSON);
    }
    if (data) {
      return res.jsonp({
        status: 'success',
        messageId: 200,
        data: data
      });
    }
    return res.jsonp(ErrorJSON);
  });
};

exports.GetLegalCompany = (req, res) => {
  LegalObj.findOne({ type: req.body.type }).lean().exec(function (err, data) {
    if (err) {
      return res.jsonp(ErrorJSON);
    }
    if (data) {
      return res.jsonp({
        status: 'success',
        messageId: 200,
        data: data
      });
    }
    return res.jsonp(ErrorJSON);
  });
};
