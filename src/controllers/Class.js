const mongoose = require("mongoose");
const Class = require('../models/Class');  // Adjust path according to your project structure

exports.addClass = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Ensure that the name field is provided
        if (!name) {
            return res.status(400).json({
                status: "error",
                messageId: 400,
                message: "Class name is required",
            });
        }

        const newClass = new Class({ name, description });
        const savedClass = await newClass.save();

        return res.status(200).json({
            status: "success",
            messageId: 200,
            message: "Class added successfully",
            data: savedClass,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: "error",
                messageId: 400,
                message: "Class name already exists",
            });
        }

        return res.status(500).json({
            status: "error",
            messageId: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


exports.getClassList = async (req, res) => {
    try {
        const classList = await Class.find().sort({ className: 1 });

        return res.status(200).json({
            status: "success",
            messageId: 200,
            message: "Class list fetched successfully",
            data: classList,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            messageId: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

