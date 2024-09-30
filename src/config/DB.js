const mongoose = require("mongoose");
const chalk = require("chalk");

const DBURL = process.env.DATABASE;

mongoose.set('strictQuery', false);
mongoose.connect(DBURL).then(
    () => { /** ready to use*/
        console.log('%s MongoDB Connected Successfully.', chalk.green('✓'));
    },
    err => {
        console.error(err);
        console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    }
);
