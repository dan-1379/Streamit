const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('User');

const { validateRegistration, validateLogin } = require('../utils/validation');

const signup = function(req, res){ 
    res.render('signup', { title: 'Sign up - Streamit' }); 
};

const signin = function(req, res){ 
    res.render('signin', { title: 'Sign in - Streamit' }); 
};

/*
    POST SIGN UP
*/

const register = async function(req, res) {
    const firstname = (req.body.firstname || "").trim();
    const lastname = (req.body.lastname || "").trim();
    const email = (req.body.email || '').trim();
    const password = req.body.password || "";
    const values = { firstname, lastname, email };

    const errors = validateRegistration({ firstname, lastname, email, password });

    if (errors.length > 0) {
        return res.status(400).render('signup', {
            title: 'Sign up - Streamit',
            error: 'Please fix the following:',
            errorsList: errors,
            values
        });
    }

    const newUser = new User({ name: firstname + " " + lastname, email });

    User.register(newUser, password, function(err, user) {
        if (err) {
            return res.status(400).render('signup', {
                title: 'Sign up - Streamit',
                error: err.message || 'Could not create account',
                values
            });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/home');
        });
    });
}

/*
    POST SIGN IN
*/

const login = async function(req, res, next) {
    const email = (req.body.email || "").trim();
    const password = req.body.password || "";
    const values = { email };

    const errors = validateLogin({ email, password });

    if (errors.length > 0) {
        return res.status(400).render("signin", {
            title: "Sign in - Streamit",
            error: "Please fix the following:",
            errorsList: errors,
            values
        });
    }

    req.body.email = email;

    passport.authenticate('local', function (err, user, info) {
        if (err) { 
            return next(err); 
        }

        if (!user) {
            return res.status(401).render('signin', {
                title: 'Sign in - Streamit',
                error: 'Invalid email or password',
                values
            });
        }

        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.redirect('/home');
        });
    })(req, res, next);
}

const logout = function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/signin');
    });
};

module.exports = { 
    signin,
    signup,
    login,
    register,
    logout
};