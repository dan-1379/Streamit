const mongoose = require('mongoose');
const Content = mongoose.model('Content');

const contentCreateOne = function (req, res) { 
     Content.create({
        _id: req.body._id,
        title: req.body.title,
        year: req.body.year,
        seasons: req.body.seasons,
        rating: req.body.rating,
        description: req.body.description,
        image: req.body.image,
        coverImage: req.body.coverImage,
        type: req.body.type,
        trailers: req.body.trailers,
        episodes: req.body.episodes,
        cast: req.body.cast
    })
    .then(content => {
        res
        .status(201)
        .json(content);
    })
    .catch(err => {
        res
        .status(400)
        .json({ message: "Error creating content", error: err });
    });
};

const contentReadOne = function (req, res) { 
    if (req.params && req.params.contentid) {
        Content
            .findById(req.params.contentid)
            .then(content => {
                if (!content) {
                    return res
                        .status(404)
                        .json({ message: "contentid not found" });
                }
                res
                .status(200)
                .json(content);
            })
            .catch(err => {
                res
                .status(500)
                .json({ message: "Error retrieving content", error: err });
            });
    } else {
        res
        .status(400)
        .json({ message: "No contentid in request" });
    }
};

const contentReadAll = function(req, res) {
    Content
    .find()
    .then(content => {
        res
            .status(200)
            .json(content)
    })
    .catch(err => {
        res
            .status(500)
            .json({ message: "Error retrieving content", error: err })
    });
};


const contentUpdateOne = function (req, res) { 
    res
    .status(200)
    .json({"status" : "success"});
};

const contentDeleteOne = function (req, res) { 
    res
    .status(200)
    .json({"status" : "success"});
};

module.exports = {
    contentCreateOne,
    contentReadOne,
    contentReadAll,
    contentUpdateOne,
    contentDeleteOne
}