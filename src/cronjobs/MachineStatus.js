const cron = require('node-cron');
const axios = require('axios');

const MachineObj = require("./../models/Machine");

exports.CheckMachineStatus = async () => {
    // */20 * * * * * Every Second
    cron.schedule("*/5 * * * *", function () {
        try {
            MachineObj.find({}).lean().exec(function (err, allMachines) {
                if (allMachines.length > 0) {
                    loopEachMachine(allMachines, 0);
                }
            })
        } catch (err) {
            console.log("Error in cron ", err.message);
        }
    })
};

function loopEachMachine(allMachines, idx) {
    if (idx < allMachines.length) {
        // Set the proxy configuration
        const proxyConfig = {
            host: 'home.webtraining.net',
            port: 80
        };
        let machineIP = allMachines[idx].machineIP;
        let apiUrl = 'http://' + machineIP + ':8081/stats'
        // Make the HTTP request with the proxy configuration
        axios.get(apiUrl, {
            proxy: proxyConfig,
            timeout: 5000
        })
            .then(response => {
                updateMachine(allMachines[idx]._id, 1);
                idx++;
                loopEachMachine(allMachines, idx);
            })
            .catch(error => {
                updateMachine(allMachines[idx]._id, 0);
                idx++;
                loopEachMachine(allMachines, idx);
            });
    }
}

function updateMachine(machineId, status) {
    MachineObj.updateOne({ _id: machineId }, { $set: { machineStatus: status } }).exec();
}