const request = require('request');

const apiOptions = {
    server : 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://streamit-vcig.onrender.com';
}

/* GET home page */
const landing = function(req, res){ 
    res.render('landing', { title: 'Welcome' }); 
};

module.exports = { 
    landing 
};
