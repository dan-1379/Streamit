const mongoose = require('mongoose');
const Content = mongoose.model('Content');

const contentCreateOne = function (req, res) { 
    res
    .status(200)
    .json({"status" : "success"});
};

const contentReadOne = function (req, res) { 
    if (req.params && req.params.contentid) {
        Content
            .findById(req.params.contentid)
            .then(content => {
                if (!content) {
                    return res
                        .status(404)
                        .json({ message: "contentid not found" });
                }
                res
                .status(200)
                .json(content);
            })
            .catch(err => {
                res
                .status(500)
                .json({ message: "Error retrieving content", error: err });
            });
    } else {
        res
        .status(400)
        .json({ message: "No contentid in request" });
    }
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