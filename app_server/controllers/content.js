const catalog = {
  "stranger-things": {
    id: "stranger-things",
    title: "Stranger Things",
    year: "2025",
    seasons: "5 Seasons",
    rating: "15",
    description: "Welcome to Hawkins, Indiana, a small town with big secrets, strange sightings, government cover-ups... and a dark force that turns everything upside down.",
    image: "/images/st.jpg",
    coverImage: "/images/st-cover.jpg",
    type: "series",
    cast: [
        {image: "/images/st-cast/mbb.webp", name: "Millie Bobby Brown", character: "Eleven"},
        {image: "/images/st-cast/fw.webp", name: "Finn Wolfhard", character: "Mike Wheeler"},
        {image: "/images/st-cast/cm.webp", name: "Caleb McLaughlin", character: "Lucas Sinclair"},
        {image: "/images/st-cast/gm.webp", name: "Gaten Matarazzo", character: "Dustin Henderson"},
    ]
  },
  "twilight": {
    id: "twilight",
    title: "Twilight",
    year: "2008",
    seasons: "Film",
    rating: "12",
    description: "A teenage girl risks everything when she falls in love with a vampire.",
    image: "/images/t.jpg",
    type: "film"
  },
  "heroes": {
    id: "heroes",
    title: "Heroes",
    year: "2006",
    seasons: "4 Seasons",
    rating: "15",
    description: "Ordinary people discover extraordinary abilities.",
    image: "/images/heroes.jpg",
    type: "series"
  },
  "the-gentlemen": {
    id: "the-gentlemen",
    title: "The Gentlemen",
    year: "2024",
    seasons: "1 Season",
    rating: "18",
    description: "An aristocrat inherits the family estate, only to discover it's home to a huge weed empire.",
    image: "/images/tg.jpg",
    type: "series"
  },
  "dark": {
    id: "dark",
    title: "Dark",
    year: "2017",
    seasons: "3 Seasons",
    rating: "15",
    description: "A missing child sets four families on a frantic hunt for answers across generations.",
    image: "/images/d.jpg",
    type: "series"
  },
  "smallville": {
    id: "smallville",
    title: "Smallville",
    year: "2001",
    seasons: "10 Seasons",
    rating: "12",
    description: "A young Clark Kent struggles to find his place in the world as he learns to harness his powers.",
    image: "/images/s.jpg",
    type: "series"
  },
  "interstellar": {
    id: "interstellar",
    title: "Interstellar",
    year: "2014",
    seasons: "Film",
    rating: "12",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    image: "/images/i.jpg",
    type: "film"
  },
  "hunger-games": {
    id: "hunger-games",
    title: "The Hunger Games",
    year: "2012",
    seasons: "Film",
    rating: "12",
    description: "Katniss Everdeen voluntarily takes her younger sister's place in the Hunger Games.",
    image: "/images/thg.jpg",
    type: "film"
  },
  "the-matrix": {
    id: "the-matrix",
    title: "The Matrix",
    year: "1999",
    seasons: "Film",
    rating: "15",
    description: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
    image: "/images/tm.jpg",
    type: "film"
  }
};

const home = function(req, res){ 
    const hero = catalog["stranger-things"];

    const savedList = [
        catalog["twilight"],
        catalog["heroes"],
        catalog["the-gentlemen"],
        catalog["stranger-things"]
    ];

    const savedSeries = [
        catalog["stranger-things"],
        catalog["heroes"],
        catalog["dark"],
        catalog["smallville"]
    ];

    const savedFilms = [
        catalog["interstellar"],
        catalog["hunger-games"],
        catalog["the-matrix"],
        catalog["twilight"]
    ];

    res.render('home', { 
        title: 'Home',
        hero: hero,
        saved: savedList,
        series: savedSeries,
        films: savedFilms
    }); 
};

const content = function(req, res){ 
    const contentId = req.params.id;
    const item = catalog[contentId];

    console.log("Requested ID:", contentId);
    console.log("Found Item:", item);

    res.render('content', { 
        title: item.title,
        item: item
    }); 
};

module.exports = { 
    home,
    content
};