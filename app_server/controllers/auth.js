const axios = require("axios");
const { validateRegistration, validateLogin } = require('../utils/validation');

const apiOptions = {
    server : 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://streamit-vcig.onrender.com';
}

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

    const url = apiOptions.server + "/api/users/";

    const postData = {
        name: firstname + " " + lastname,
        email,
        password
    };

    try {
        await axios.post(url, postData, { timeout: 5000 });
        res.redirect("/signin");
    } catch (err) {
        const status = err.response ? err.response.status : 500;
        
        const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : "Unable to connect to the server";

        res.status(status).render("signup", {
            title: "Sign up - Streamit",
            error: message,
            values
        })
    }
}

const signup = function(req, res){ 
    res.render('signup', { title: 'Sign up - Streamit' }); 
};

/*
    POST SIGN IN
*/

const login = async function(req, res) {
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

    const url = apiOptions.server + "/api/login/";
    const postData = { email, password };
    
    try {
        await axios.post(url, postData, { timeout: 5000 });
        res.redirect("/home");
    } catch (err) {
        const status = err.response ? err.response.status : 500;
       
        const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : "Unable to connect to the server";

        res.status(status).render("signin", {
            title: "Sign in - Streamit",
            error: message,
            values
        })
    }
}


const signin = function(req, res){ 
    res.render('signin', { title: 'Sign in - Streamit' }); 
};

module.exports = { 
    signin,
    signup,
    login,
    register
};