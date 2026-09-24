const home = function(req, res){ 
    res.render('home', { title: 'Home' }); 
};

const content = function(req, res){ 
    res.render('content', { title: 'Content' }); 
};

module.exports = { 
    home,
    content
};