const mongoose = require('mongoose');
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 10000
})
    .then(() => {
        console.log("Mongoose is connected")
    })
    .catch((err) => {
        console.error('\n-------------------------------------------------------------');
        console.error('\nCould not connect to MongoDB Atlas.');
        console.error('The server is running, but the database is unavailable.');

        if (err.message && err.message.includes('whitelist')) {
            console.error('Likely cause: current IP is not whitelisted (R200 error)');
        } else {
            console.error('Reason:', err.message);
        }

        console.error('\n-------------------------------------------------------------');
        console.error('');
        process.exit(1);
    });

require('./content');
require('./user');