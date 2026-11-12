const mongoose = require('mongoose');
const User = mongoose.model('User');

const bcrypt = require("bcryptjs");

const userCreateOne = function (req, res) {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    user.validate()
        .then(() => bcrypt.hash(req.body.password, 10))
        .then(hash => {
            user.password = hash;
            return user.save();
        })
        .then(saved => {
            res
                .status(201)
                .json({ _id: saved._id, name: saved.name, email: saved.email });
        })
        .catch(err => {
            if (err.code === 11000) {
                return res
                    .status(409)
                    .json({ message: "An account with that email already exists" });
            }
            if (err.name === "ValidationError") {
                const firstError = Object.values(err.errors)[0].message;
                return res.status(400).json({ message: firstError });
            }
            res
                .status(500)
                .json({ message: "Error creating user" });
        });
};

const userReadOne = function(req, res) {
    if (!req.params || !req.params.userid) {
        return res.status(400).json({ message: "No userid in request" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.userid)) {
        return res.status(404).json({ message: "userid not found" });
    }

    User
        .findById(req.params.userid)
        .select("-password")
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "userid not found" });
            }
            
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({ message: "Error retrieving user" });
        });
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

const userLogin = function (req, res) {
    if (
        req.body &&
        req.body.email && typeof req.body.email === "string" &&
        req.body.password && typeof req.body.password === "string"
    ) {
        User
            .findOne({ email: req.body.email.toLowerCase().trim() })
            .then(user => {
                if (!user) {
                    return res
                        .status(401)
                        .json({ message: "Invalid email or password" });
                }
                return bcrypt.compare(req.body.password, user.password)
                    .then(match => {
                        if (!match) {
                            return res
                                .status(401)
                                .json({ message: "Invalid email or password" });
                        }
                        res
                            .status(200)
                            .json({ _id: user._id, name: user.name, email: user.email });
                    });
            })
            .catch(err => {
                res
                    .status(500)
                    .json({ message: "Error logging in" });
            });
    } else {
        res
            .status(400)
            .json({ message: "Email and password are required" });
    }
};

module.exports = {
    userCreateOne,
    userReadOne,
    userDeleteOne,
    userUpdateOne,
    userLogin
};