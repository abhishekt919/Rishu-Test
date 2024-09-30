const fs = require("fs");
const Json2csvParser = require('json2csv').Parser;
const moment = require("moment");
const axios = require('axios');
const cheerio = require('cheerio');

const MachineObj = require("../models/Machine");
const CompanyObj = require("../models/Company");
const constantObj = require("../config/Constants");

const { errorHandler, generateMachineIP, getAddressFromGeocoder } = require("../helpers/helperFunctions");
const { sendEmailUsingTemplate } = require("./../config/EmailService");

/* Add Machine */
exports.AddMachine = async (req, res) => {
    try {
        if (req.body.locationAddress) {
            const { line1, line2, city, state, country, zipcode } = req.body.locationAddress;
            const address = await getAddressFromGeocoder(`${line1 || ''} ${line2 || ''} ${city || ''} ${state || ''} ${country || ''}  ${zipcode || ''}`);
            if (address?.latitude && address?.longitude) {
                req.body.locationAddress.latitude = address.latitude;
                req.body.locationAddress.longitude = address.longitude;
            }
        }

        req.body.machineIP = generateMachineIP(req.body.programSerialNumber);

        if (req.body._id) {
            MachineObj.updateOne({ _id: req.body._id }, { $set: req.body }, function (err, response) {
                if (err) {
                    return res.jsonp(errorHandler(err.message));
                }
                return res.jsonp({
                    status: 'success',
                    messageId: 200,
                    message: "Machine " + constantObj.messages.RecordUpdated
                });
            });
        } else {
            MachineObj.findOne({ programSerialNumber: req.body.programSerialNumber, isDeleted: false }).lean().exec(function (err, data) {
                if (data) {
                    return res.jsonp(errorHandler(constantObj.messages.MachineAlreadyExists));
                }
                const CompanyMachineModel = new MachineObj(req.body);
                CompanyMachineModel.save().then(result => {
                    return res.jsonp({
                        status: 'success',
                        messageId: 200,
                        message: constantObj.messages.MachineAdded
                    });
                }).catch(error => {
                    return res.jsonp(errorHandler(error.message));
                })
            })
        }
    } catch (err) {
        return res.jsonp(errorHandler(err.message));
    }
}

/* Get Machine By Id */
exports.GetMachineById = (req, res) => {
    MachineObj.findOne({ _id: req.params.id }).lean().exec(function (err, data) {
        if (err) {
            return res.jsonp(errorHandler(err.message));
        }
        data.addressLine1 = data.locationAddress.line1 ? data.locationAddress.line1 : "";
        data.addressLine2 = data.locationAddress.line2 ? data.locationAddress.line2 : "";
        data.city = data.locationAddress.city ? data.locationAddress.city : "";
        data.state = data.locationAddress.state ? data.locationAddress.state : "";
        data.country = data.locationAddress.country ? data.locationAddress.country : "";
        data.zipcode = data.locationAddress.zipcode ? data.locationAddress.zipcode : "";

        data.managerName = data.locationManager.name ? data.locationManager.name : "";
        data.email = data.locationManager.email ? data.locationManager.email : "";
        data.countryCode = data.countryCode;
        if (data.locationManager.mobilePhone) {
            let mobilePhone = data.locationManager.mobilePhone;
            let countryCodeLength = mobilePhone.length - 10;
            data.mobilePhone = mobilePhone.substring(countryCodeLength, mobilePhone.length);
        }

        return res.jsonp({
            status: 'success',
            messageId: 200,
            data: data
        });
    });
}

/* Delete Machine By Id */
exports.DeleteMachineById = (req, res) => {
    MachineObj.updateOne({ _id: req.params.id }, { $set: { isDeleted: true } }, function (err, response) {
        if (err) {
            return res.jsonp(errorHandler(err.message));
        }
        return res.jsonp({
            status: 'success',
            messageId: 200,
            message: "Machine " + constantObj.messages.RecordDeleted
        });
    });
};

// Update Machine
exports.UpdateMachine = async (req, res) => {
    MachineObj.updateOne({ _id: req.body._id }, { $set: { isDeleted: false } }, function (err, response) {
        if (err) {
            return res.jsonp(errorHandler(err.message));
        }
        return res.jsonp({
            status: 'success',
            messageId: 200,
            message: "Machine " + constantObj.messages.RecordRestored
        });
    });
}

/* Get Machine For Company */
exports.GetMachineByCompany = async (req, res) => {
    try {
        const { companyId, status } = req.params;
        CompanyObj.findOne({ _id: companyId }, { affiliateCode: 1 }).lean().exec(function (err, data) {
            if (err) {
                return res.jsonp(errorHandler());
            }
            MachineObj.find({ referralCode: data.affiliateCode }, { _id: 1 }).lean().exec(function (err, companyList) {
                if (err) {
                    return res.jsonp(errorHandler());
                }
                let allCompany = [companyId];
                for (let i = 0; i < companyList.length; i++) {
                    allCompany.push(companyList[i]._id);
                }
                let perPage = Number(req.params.perPage) || 10;
                let page = Number(req.params.page) || 1;

                let query = {
                    company: {
                        $in: allCompany
                    },
                    isDeleted: false
                }
                if (status == 0) {
                    query.machineStatus = 0;
                } else if (status == 1) {
                    query.machineStatus = 1;
                }
                getAllMachinesData(query, perPage, page, res);
            })
        })
    } catch (err) {
        return res.jsonp(errorHandler(err.message));
    }
}

async function getAllMachinesData(query, perPage, page, res) {
    const data = await MachineObj.find(query)
        .populate('machineType', 'name')
        .populate('company', 'name')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName')
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort({ updatedAt: -1 });

    const totalRecords = await MachineObj.countDocuments(query);

    return res.jsonp({
        'status': 'success',
        'messageId': 200,
        'message': constantObj.messages.SuccessRetreivingData,
        'data': data,
        'totalRecords': totalRecords
    })
}

// Get Machines Count
exports.GetMachinesCountByCompany = (req, res) => {
    const { companyId } = req.params;
    CompanyObj.findOne({ _id: companyId }, { affiliateCode: 1 }).lean().exec(function (err, data) {
        if (err) {
            return res.jsonp(errorHandler());
        }
        CompanyObj.find({ referralCode: data.affiliateCode }, { _id: 1 }).lean().exec(function (err, companyList) {
            if (err) {
                return res.jsonp(errorHandler());
            }
            let allCompany = [companyId];
            for (let i = 0; i < companyList.length; i++) {
                allCompany.push(companyList[i]._id);
            }
            let query = {
                company: {
                    $in: allCompany
                },
                isDeleted: false
            }
            MachineObj.countDocuments(query).lean().exec(function (err, count) {
                if (err) {
                    return res.jsonp(errorHandler(constantObj.messages.ErrorRetrievingData));
                }
                return res.jsonp({
                    status: "success",
                    messageId: 200,
                    message: constantObj.messages.SuccessRetreivingData,
                    data: count
                });
            })
        })
    })
};

// Download Machine Data
exports.DownloadMachineByCompany = async (req, res) => {
    try {
        const { companyId } = req.body;
        CompanyObj.findOne({ _id: companyId }, { affiliateCode: 1 }).lean().exec(function (err, data) {
            if (err) {
                return res.jsonp(errorHandler());
            }
            CompanyObj.find({ referralCode: data.affiliateCode }, { _id: 1 }).lean().exec(function (err, companyList) {
                if (err) {
                    return res.jsonp(errorHandler());
                }
                let allCompany = [companyId];
                for (let i = 0; i < companyList.length; i++) {
                    allCompany.push(companyList[i]._id);
                }
                let perPage = Number(req.body.perPage) || 10;
                let page = Number(req.body.page) || 1;

                let query = {
                    company: {
                        $in: allCompany
                    }
                }
                downloadMachinesData(query, perPage, page, res);
            })
        })
    } catch (err) {
        return res.jsonp(errorHandler(err.message));
    }
}

async function downloadMachinesData(query, perPage, page, res) {
    const data = await MachineObj.find(query, { company: 1, machineType: 1, programSerialNumber: 1, cabinetSerialNumber: 1, isVerified: 1, sentry: 1, tito: 1, atm: 1, locationName: 1, locationAddress: 1, locationManager: 1, createdAt: 1, createdBy: 1, updatedAt: 1, updatedBy: 1 })
        .populate('machineType', 'name')
        .populate('company', 'name')
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .sort({ updatedAt: -1 });

    if (data.length > 0) {
        let csvData = [];
        createDownloadData(data, 0, csvData, res)
    } else {
        return res.jsonp(errorHandler(constantObj.messages.NoDataToDownload));
    }
}

function createDownloadData(data, dataIdx, csvData, res) {
    if (dataIdx < data.length) {
        let machineData = data[dataIdx];
        let currentMachineData = {
            'Compnay Name': machineData.company.name,
            'Machine Type': machineData.machineType.name,
            'Program Serial Number': machineData.programSerialNumber,
            'Cabinet Serial Number': machineData.cabinetSerialNumber ? machineData.cabinetSerialNumber : '',
            'Status': machineData.isVerified ? 'VERIFIED' : 'UNVERIFIED',
            'Sentry': machineData.sentry ? 'YES' : 'NO',
            'ATM': machineData.atm ? 'YES' : 'NO',
            'Tito': machineData.tito ? 'YES' : 'NO',
            'Location Name': machineData.locationName ? machineData.locationName : '',
            'Address Line 1': machineData.locationAddress?.line1 ? machineData.locationAddress?.line1 : '',
            'Address Line 2': machineData.locationAddress?.line2 ? machineData.locationAddress?.line2 : '',
            'City': machineData.locationAddress?.city ? machineData.locationAddress?.city : '',
            'State': machineData.locationAddress?.state ? machineData.locationAddress?.state : '',
            'Zipcode': machineData.locationAddress?.zipcode ? machineData.locationAddress?.zipcode : '',
            'Country': machineData.locationAddress?.country ? machineData.locationAddress?.country : '',
            'Location Manager Name': machineData.locationManager?.name ? machineData.locationManager?.name : '',
            'Location Manager Email': machineData.locationManager?.email ? machineData.locationManager?.email : '',
            'Location Manager Mobile Phone': machineData.locationManager?.mobilePhone ? machineData.locationManager?.mobilePhone : '',
            'Created At': moment(machineData.createdAt).format(constantObj.dateFormat),
            'Created By': machineData.createdBy.firstName + " " + machineData.createdBy.lastName,
            'Updated At': moment(machineData.updatedAt).format(constantObj.dateFormat),
            'Updated By': machineData.updatedBy.firstName + " " + machineData.updatedBy.lastName,
        }
        csvData.push(currentMachineData);
        dataIdx++;
        createDownloadData(data, dataIdx, csvData, res);
    } else {
        let fields = ['Compnay Name', 'Machine Type', 'Program Serial Number', 'Cabinet Serial Number', 'Status', 'Sentry', 'ATM', 'Tito', 'Location Name', 'Address Line 1', 'Address Line 2', 'City', 'State', 'Zipcode', 'Country', 'Location Manager Name', 'Location Manager Email', 'Location Manager Mobile Phone', 'Created At', 'Created By', 'Updated At', 'Updated By'];
        const json2csvParser = new Json2csvParser({ fields });
        const csv = json2csvParser.parse(csvData);
        let fileName = data[0].company.name + " Machines.csv";
        let path = "public/files/csv/" + fileName;
        fs.writeFile(path, csv, function (err) {
            return res.jsonp({
                'status': 'success',
                'messageId': 200,
                'message': 'Machine data ' + constantObj.messages.DownloadSuccess,
                'dta': process.env.API_URL + "/files/csv/" + fileName
            })
        });
    }
}

// Super Admin API's

/* Get All Machine */
exports.GetAllMachine = async (req, res) => {
    try {
        let perPage = Number(req.params.perPage) || 10;
        let page = Number(req.params.page) || 1;
        let query = {};
        const { status } = req.params;
        if (status == 0) {
            query.machineStatus = 0;
        } else if (status == 1) {
            query.machineStatus = 1;
        }

        const data = await MachineObj.find(query)
            .populate('machineType', 'name')
            .populate('company', 'name')
            .populate('verifiedBy.user', 'firstName lastName')
            .populate('verifiedBy.admin', 'firstName lastName')
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName')
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({ createdAt: -1 });

        const totalRecords = await MachineObj.countDocuments(query);

        return res.jsonp({
            'status': 'success',
            'messageId': 200,
            'message': constantObj.messages.SuccessRetreivingData,
            'data': data,
            'totalRecords': totalRecords
        })
    } catch (err) {
        return res.jsonp(errorHandler(err.message));
    }
}

// Search Machine By Company
exports.SearchMachines = async (req, res) => {
    try {
        const perPage = Number(req.body.perPage) || 10;
        const page = Number(req.body.page) || 1;
        const { searchText, status, isDeleted } = req.body;
        const regex = { $regex: searchText.trim(), $options: "i" };
        let query = {
            $or: [
                { cabinetSerialNumber: regex },
                { programSerialNumber: regex }
            ]
        };

        if(isDeleted){
            query.isDeleted = isDeleted;
        }

        if (status == 0) {
            query.machineStatus = 0;
        } else if (status == 1) {
            query.machineStatus = 1;
        }

        let searchMessage = constantObj.messages.SearchResult + searchText;

        if (req.body.company) {
            query.company = req.body?.company?._id;
            searchMessage = searchMessage + ' ' + req.body?.company?.name;
        }

        const data = await MachineObj.find(query)
            .populate('machineType', 'name')
            .populate('company', 'name')
            .populate('verifiedBy', 'firstName lastName')
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName')
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({ updatedAt: -1 });

        const totalRecords = await MachineObj.countDocuments(query);

        return res.jsonp({
            status: "success",
            messageId: 200,
            message: data?.length ? searchMessage : constantObj.messages.NoRecordFound,
            data,
            totalRecords
        });
    } catch (error) {
        return res.jsonp(errorHandler(error.message));
    }
};

// Get All Machines Count
exports.GetAllMachinesCount = (req, res) => {
    MachineObj.countDocuments().lean().exec(function (err, count) {
        if (err) {
            return res.jsonp(errorHandler(constantObj.messages.ErrorRetrievingData));
        }
        return res.jsonp({
            status: "success",
            messageId: 200,
            message: constantObj.messages.SuccessRetreivingData,
            data: count
        });
    })
};

// Verify Machine
exports.VerifyMachine = async (req, res) => {
    try {
        MachineObj.updateOne({ _id: req.body._id }, { $set: { isVerified: req.body.isVerified, verifiedBy: req.body.verifiedBy } }, function (err, response) {
            if (err) {
                return res.jsonp(errorHandler(err.message));
            }
            let emailTemplateData = {
                userFirstName: req.body.firstName,
                machineNo: req.body.machineNo
            };
            // Send Email To Company User who has added machine
            if (req.body.isVerified) {
                // Send Activation Email
                sendEmailUsingTemplate(req.body.email, process.env.MachineVerified, emailTemplateData);
            } else {
                // Send Deactivation Email
                sendEmailUsingTemplate(req.body.email, process.env.MachineUnverified, emailTemplateData);
            }
            return res.jsonp({
                status: 'success',
                messageId: 200,
                message: "Machine " + constantObj.messages.MachineVerified
            });
        });
    } catch (err) {
        return res.jsonp(errorHandler(err.message));
    }
}

// Get  Machine Statistics
exports.GetMachineStatistics = async (req, res) => {
    try {
        // Set the proxy configuration
        const proxyConfig = {
            host: 'home.webtraining.net',
            port: 80
        };
        let machineIP = req.body.machineIP;
        let apiUrl = 'http://' + machineIP + ':8081/stats'
        // Make the HTTP request with the proxy configuration
        axios.get(apiUrl, {
            proxy: proxyConfig,
            timeout: 5000
        })
            .then(response => {
                MachineObj.updateOne({ machineIP: req.body.machineIP }, { $set: { machineStatus: 1 } }).exec();
                const htmlString = response.data;
                const $ = cheerio.load(htmlString);
                // Convert the entire HTML document to JSON
                const jsonOutput = htmlToJson($('html')[0]);
                return res.jsonp({
                    status: 'success',
                    messageId: 200,
                    message: constantObj.messages.SuccessRetreivingData,
                    data: jsonOutput
                });
            })
            .catch(error => {
                let message = error.message;
                if(error?.response?.status == 404){
                    message = constantObj.messages.MachineError404;
                }

                if(error?.response?.status == 403){
                    message = constantObj.messages.MachineErrorTimeout;
                }

                return res.jsonp({
                    status: "failure",
                    messageId: 203,
                    message: message
                });
            });
    } catch (err) {
        return res.jsonp(errorHandler(err.message));
    }
}

// Convert HTML elements to JSON
function htmlToJson(element) {
    const result = {};
    result[element.name] = {};

    // Add attributes
    if (element.attribs) {
        result[element.name]["attributes"] = element.attribs;
    }

    // Add children
    const children = element.children.filter(child => child.type === 'tag');
    if (children.length > 0) {
        result[element.name]["children"] = children.map(child => htmlToJson(child));
    }
    // Add text content
    if (element.children && element.children.length === 1 && element.children[0].type === 'text') {
        result[element.name]["text"] = element.children[0].data.trim();
    }

    return result;
}

// Get  Machine Events
exports.GetMachineEvents = async (req, res) => {
    try {
        // Set the proxy configuration
        const proxyConfig = {
            host: 'home.webtraining.net',
            port: 80
        };
        let machineIP = req.body.machineIP;
        let apiUrl = 'http://' + machineIP + ':8081/events/' + req.body.startTime + '/' + req.body.endTime;
        // Make the HTTP request with the proxy configuration
        axios.get(apiUrl, {
            proxy: proxyConfig,
            timeout: 5000
        })
            .then(response => {
                MachineObj.updateOne({ machineIP: req.body.machineIP }, { $set: { machineStatus: 1 } }).exec();
                let jsonString = response.data;

                // Remove newline characters from the JSON string
                let cleanedJsonString = jsonString.replace(/\n/g, '');

                // Output the cleaned JSON object
                let finalJsonString = cleanedJsonString.replace(/},    ]/g, '}]');
                return res.jsonp({
                    status: 'success',
                    messageId: 200,
                    message: constantObj.messages.SuccessRetreivingData,
                    data: JSON.parse(finalJsonString)
                });
            })
            .catch(error => {
                let message = error.message;
                if(error?.response?.status == 404){
                    message = constantObj.messages.MachineError404;
                }

                if(error?.response?.status == 403){
                    message = constantObj.messages.MachineErrorTimeout;
                }

                return res.jsonp({
                    status: "failure",
                    messageId: 203,
                    message: message
                });
            });
    } catch (err) {
        return res.jsonp(errorHandler(err.message));
    }
}