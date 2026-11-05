const axios = require("axios");

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
    const url = apiOptions.server + "/api/users/";

    const postData = {
        name: req.body.firstname + " " + req.body.lastname,
        email: req.body.email,
        password: req.body.password
    };

    try {
        const response = await axios.post(url, postData);

        if (response.status === 201) {
            res.redirect("/signin");
        } else {
            res.status(response.status).render("signup", {
                title: "Sign up - Streamit",
                error: "Something went wrong, please try again"
            })
        }
    } catch (err) {
        const status = err.response ? error.response.status : 500;

        res.status(status).render("signup", {
            title: "Sign up - Streamit",
            error: "Unable to connect to the server"
        })
    }
}

const signup = function(req, res){ 
    res.render('signup', { title: 'Sign up' }); 
};

/*
    POST SIGN IN
*/

const login = async function(req, res) {
    const url = apiOptions.server + "/api/login/";

    const postData = {
        email: req.body.email,
        password: req.body.password
    };
    
    try {
        const response = await axios.post(url, postData);

        if (response.status === 200) {
            res.redirect("/home");
        } else {
            res.status(response.statusCode).render("signin",  {
                message: 'Sign in - Streamit',
                error: "Something went wrong, please try again"
            })
        }
    } catch (err) {
       const status = err.response ? error.response.status : 500;

        res.status(status).render("signup", {
            title: "Sign up - Streamit",
            error: "Unable to connect to the server"
        })
    }
}


const signin = function(req, res){ 
    res.render('signin', { title: 'Sign in' }); 
};

module.exports = { 
    signin,
    signup,
    login,
    register
};