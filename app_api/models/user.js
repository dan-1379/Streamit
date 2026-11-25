const mongoose = require('mongoose');
const validator = require('validator');

// `.default ||` resolves the plugin's ESM/CommonJS export for this version
const passportLocalMongoose = require('passport-local-mongoose').default || require('passport-local-mongoose');

// Mongoose field validators (required / maxlength / match / unique): https://mongoosejs.com/docs/validation.html
const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, "Name is required"],
        maxlength: [100, "Name must not be longer than 100 characters"],
        trim: true,
        // Mongoose match validator: https://mongoosejs.com/docs/schematypes.html#string-validators
        // Unicode regex \p{L} + u flag: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape
        match: [/^[\p{L}' -]+$/u, "Name can only contain letters, spaces, apostrophes, and hyphens"]
    },
    email: {
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        trim: true,
        lowercase: true,
        // Email validation with validator.js: https://github.com/validatorjs/validator.js
        validate: [validator.isEmail, "Please enter a valid email address"]
    }
});

// passport-local-mongoose options (usernameField, usernameLowerCase, errorMessages): https://github.com/saintedlama/passport-local-mongoose
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameLowerCase: true,
    errorMessages: {
        UserExistsError: 'An account with that email already exists'
    }
});


mongoose.model('User', userSchema);