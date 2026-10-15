const mongoose = require('mongoose');
const Location = mongoose.model('Location');

const locationsCreate = function (req, res) {
    res
    .status(200)
    .json({"status" : "success"});
};

const locationsListByDistance = function (req, res) {
    res
    .status(200)
    .json({"status" : "success"});
};

const locationsReadOne = function (req, res) {
    res
    .status(200)
    .json({"status" : "success"});
};

const locationsUpdateOne = function (req, res) {
    res
    .status(200)
    .json({"status" : "success"});
};

const locationsDeleteOne = function (req, res) {
    res
    .status(200)
    .json({"status" : "success"});
};

module.exports = {
  locationsListByDistance,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne,
  locationsDeleteOne
};
