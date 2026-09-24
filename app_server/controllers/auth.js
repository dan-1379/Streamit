const signin = function(req, res){ 
    res.render('signin', { title: 'Sign in' }); 
};

const signup = function(req, res){ 
    res.render('signup', { title: 'Sign up' }); 
};

module.exports = { 
    signin,
    signup
};