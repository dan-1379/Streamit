const axios = require('axios');

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

const home = async function(req, res) { 
  let content = [];
  const url = apiOptions.server + "/api/content";

  try {
    const response = await axios.get(url);

    if (response.status === 200 && Array.isArray(response.data)) {
      content = response.data;
    } else {
      console.log('API error or non-array body:', response.data);
    }
  } catch (err) {
      console.log('Content request failed', err.message);
  }

  _renderHomepage(req, res, content);
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

const content = async function(req, res){ 
  const url = apiOptions.server + "/api/content/" + req.params.contentid;

  try {
    const response = await axios.get(url);
    _renderContentPage(req, res, response.data);
  } catch (err) {
    const status = err.response ? err.response.status : 500;

     res.status(status).render("error",  {
        title: "Error - Streamit",
        status: status,
        message: status === 404 ? "Content not found" : "Unable to connect to API server",
     })
  }
};

module.exports = { 
    home,
    content
};