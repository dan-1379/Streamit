const request = require('request');

const apiOptions = {
    server : 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://streamit-vcig.onrender.com';
}

/*
    POST SIGN UP
*/

const register = function(req, res) {
    const path = "/api/users/";

    const requestOptions = {
        url: apiOptions.server + path,
        method: "POST",
        json: {
            name: req.body.firstname + " " + req.body.lastname,
            email: req.body.email,
            password: req.body.password
        }
    };

    request(requestOptions, (err, response, body) => {
        if(err) {
            return res.status(500).render("error", {
                message: 'Unable to connect to API server',
                error: err
            });
        }

        if (response.statusCode === 201) {
            res.redirect("/signin");
        } else {
            console.log('Register failed:', response.statusCode, JSON.stringify(body, null, 2));

            res.status(response.statusCode).render("signup",  {
                message: 'Sign up - Streamit',
                error: body.message
            })
        }
    });
}

const signup = function(req, res){ 
    res.render('signup', { title: 'Sign up' }); 
};

/*
    POST SIGN IN
*/

const login = function(req, res) {
    const path = "/api/login/";

    const requestOptions = {
        url: apiOptions.server + path,
        method: "POST",
        json: {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }
    };

    request(requestOptions, (err, response, body) => {
        if(err) {
            return res.status(500).render("error", {
                message: 'Unable to connect to API server',
                error: err
            });
        }

        if (response.statusCode === 200) {
            res.redirect("/home");
        } else {
            res.status(response.statusCode).render("signin",  {
                message: 'Sign in - Streamit',
                error: body.message
            })
        }
    });
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