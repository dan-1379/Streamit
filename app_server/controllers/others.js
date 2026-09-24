/* GET home page */
const landing = function(req, res){ 
    res.render('landing', { title: 'Welcome' }); 
};

module.exports = { 
    landing 
};
