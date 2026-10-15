const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    image: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    time: {type: String, required: true}
}, { _id: false });

const castSchema = new mongoose.Schema({
    image: {type: String, required: true},
    name: {type: String, required: true},
    character: {type: String, required: true},
}, { _id: false });

const contentSchema = new mongoose.Schema({ 
    _id: {type: String, required: true},
    title: {type: String, required: true},
    year: {type: String, required: true},
    seasons: {type: String, required: true},
    rating: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    coverImage: {type: String, required: false},
    type: {type: String, enum: ['series', 'film'], required: true},
    episodes: [episodeSchema],
    trailers: String,
    cast: [castSchema]
}, { collection: 'Content' });

mongoose.model('Content', contentSchema);