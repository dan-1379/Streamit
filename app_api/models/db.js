const mongoose = require('mongoose');
const dbURI = process.env.MONGO_DB_URI;

try {  
    mongoose.connect(
        dbURI,
        { }).then(
        () => {console.log(" Mongoose is connected")},
        err=> {console.log(err)}
        );
}
    catch (e) {
    console.log("could not connect");
}

require('./content');
require('./user');