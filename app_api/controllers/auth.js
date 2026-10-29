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
        // MongoDB Duplicate Key Check
        if (err.code === 11000) {
            return res
            .status(409) // Request cannot be processed as it clashes with the current state of the target resource
            .json({ message: "An account with that email already exists", error: err });
        }

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

const userLogin = function(req, res) {
    if (req.body && req.body.email && req.body.password) {
        User
        .findOne({ email: req.body.email })
        .then(user => {
            if (!user || user.password !== req.body.password) {
                return res
                    .status(401
                    .json({ message: "Invalid email or password" })
                )
            }
            res
            .status(200)
            .json({ _id: user._id, name: user.name, email: user.email })
        })
        .catch(err => {
                res
                .status(500)
                .json({ message: "Error logging in", error: err });
        })
    } else {
        res
        .status(400)
        .json({ message: "Email and password are required" });
    }
}

module.exports = {
    userCreateOne,
    userReadOne,
    userDeleteOne,
    userUpdateOne,
    userLogin
};