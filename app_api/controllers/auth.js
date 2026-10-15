const mongoose = require('mongoose');
const User = mongoose.model('User');

const userCreateOne = function(req, res) {
    User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    .then(user => {
        res
        .status(201)
        .json(user);
    })
    .catch(err => {
        res
        .status(400)
        .json({ message: "Error creating user", error: err });
    });
};

const userReadOne = function(req, res) {
    if (req.params && req.params.userid) {
        User
            .findById(req.params.userid)
            .then(user => {
                if (!user) {
                    return res
                        .status(404)
                        .json({ message: "userid not found" });
                }
                res
                .status(200)
                .json(user);
            })
            .catch(err => {
                res
                .status(500)
                .json({ message: "Error retrieving user", error: err });
            });
    } else {
        res
        .status(400)
        .json({ message: "No userid in request" });
    }
}

const userUpdateOne = function(req, res) {
    res
    .status(200)
    .json({"status" : "success"});
}

const userDeleteOne = function(req, res) {
    res
    .status(200)
    .json({"status" : "success"});
}

module.exports = {
    userCreateOne,
    userReadOne,
    userDeleteOne,
    userUpdateOne
};