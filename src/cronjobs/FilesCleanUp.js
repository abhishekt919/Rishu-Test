const cron = require('node-cron');
const fs = require("fs");
const path = require("path");

exports.FolderCleanUp = async () => {
    // */20 * * * * * Every Second
    cron.schedule("0 8 * * *", function () {
        try {
            const directories = [
                "../../../public/files/csv",
            ];

            for (let index = 0; index < directories.length; index++) {
                const element = directories[index];
                const directory = path.join(__dirname + element);
                fs.readdir(directory, (err, files) => {
                    if (files?.length) {
                        for (const file of files) {
                            fs.unlink(path.join(directory, file), (err) => { });
                        }
                    }
                });
            }
        } catch (error) {
            console.log("error while deleting local files", error.message);
        }
    })
};