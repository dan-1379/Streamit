const request = require('request');

const apiOptions = {
    server : 'http://localhost:3000'
};

if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'https://streamit-vcig.onrender.com';
}

/*
  Homepage - List all content
*/

const _renderHomepage = function(req, res, content) {
  const hero = content.find(item => item._id === 'stranger-things') || content[0];
  const savedList = content.slice(0, 5);
  const savedSeries = content.filter(item => item.type === 'series');
  const savedFilms = content.filter(item => item.type === 'film');

  res.render('home', { 
    title: 'Home',
    hero: hero,
    saved: savedList,
    series: savedSeries,
    films: savedFilms
  }); 
}

const home = function(req, res){ 
  const path = "/api/content";

  const requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {}
  };

  request(requestOptions, (err, response, body) => {
    let content = [];

    if (!err && response.statusCode === 200 && Array.isArray(body)) {
      content = body;
    } else {
      console.log('API error or non-array body:', body);
    }

    _renderHomepage(req, res, content);
  });
};

/*
  Content page - Singular show/film
*/

const _renderContentPage = function(req, res, item) {
  res.render('content', { 
    title: item.title + " - Streamit",
    item: item
  }); 
}

const content = function(req, res){ 
  const path = "/api/content/" + req.params.contentid;

  const requestOptions = {
    url: apiOptions.server + path,
    method: "GET",
    json: {}
  };

  request(requestOptions, (err, response, body) => {
    if(err) {
      return res.status(500).render("error", {
        message: 'Unable to connect to API server',
        error: err
      });
    }

    if (response.statusCode === 200) {
      _renderContentPage(req, res, body);
    } else {
      res.status(response.statusCode).render("error",  {
        message: 'Content not found',
        error: body
      })
    }
  });
};

module.exports = { 
    home,
    content
};