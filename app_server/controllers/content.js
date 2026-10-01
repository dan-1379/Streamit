const home = function(req, res){ 
    const hero = {
        title: "Stranger Things",
        year: "2025",
        seasons: "5 Seasons",
        rating: "15",
        description: "Welcome to Hawkins, Indiana, a small town with big secrets, strange sightings, government cover-ups... and a dark force that turns everything upside down.",
        logo: "/images/streamit_logo_s.png"
    };

    const savedList = [
        { image: "https://www.themoviedb.org/t/p/w600_and_h900_face/3Gkb6jm6962ADUPaCBqzz9CTbn9.jpg", title: "Twilight" },
        { image: "https://image.tmdb.org/t/p/original/lf0TcOkheYUZKpeh7c8lqJHNk5O.jpg", title: "Heroes" },
        { image: "https://www.themoviedb.org/t/p/w600_and_h900_face/tw3tzfXaSpmUZIB8ZNqNEGzMBCy.jpg", title: "The Gentlemen" },
        { image: "https://image.tmdb.org/t/p/original/uKYUR8GPkKRCksczYDJb3pwZauo.jpg", title: "Stranger Things" },
    ]

    const savedSeries = [
        { image: "https://image.tmdb.org/t/p/original/uKYUR8GPkKRCksczYDJb3pwZauo.jpg", title: "Stranger Things" },
        { image: "https://image.tmdb.org/t/p/original/lf0TcOkheYUZKpeh7c8lqJHNk5O.jpg", title: "Heroes" },
        { image: "https://image.tmdb.org/t/p/original/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", title: "Dark" },
        { image: "https://image.tmdb.org/t/p/original/pUhJGETy2sec4vEkiqJ9eGeIywc.jpg", title: "Smallville" },
    ]

   const savedFilms = [
        { image: "https://www.themoviedb.org/t/p/w600_and_h900_face/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg", title: "Interstellar" },
        { image: "https://www.themoviedb.org/t/p/w600_and_h900_face/apa5G43Hha7kH7wJG0gkkHT7FA9.jpg", title: "The Hunger Games" },
        { image: "https://www.themoviedb.org/t/p/w600_and_h900_face/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg", title: "The Matrix" },
        { image: "https://www.themoviedb.org/t/p/w600_and_h900_face/3Gkb6jm6962ADUPaCBqzz9CTbn9.jpg", title: "Twilight" },
    ]

    res.render('home', { 
        title: 'Home',
        hero: hero,
        saved: savedList,
        series: savedSeries,
        films: savedFilms
    }); 
};

const content = function(req, res){ 
    res.render('content', { title: 'Content' }); 
};

module.exports = { 
    home,
    content
};