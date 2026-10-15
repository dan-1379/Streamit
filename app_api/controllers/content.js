const mongoose = require('mongoose');
const Content = mongoose.model('Content');

const contentCreateOne = function (req, res) { 
    res
    .status(200)
    .json({"status" : "success"});
};

const contentReadOne = function (req, res) { 
    res
    .status(200)
    .json({"status" : "success"});
};

const contentUpdateOne = function (req, res) { 
    res
    .status(200)
    .json({"status" : "success"});
};

const contentDeleteOne = function (req, res) { 
    res
    .status(200)
    .json({"status" : "success"});
};

module.exports = {
    contentCreateOne,
    contentReadOne,
    contentUpdateOne,
    contentDeleteOne
}