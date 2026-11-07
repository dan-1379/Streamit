const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, "Name is required"],
        maxlength: [100, "Name must not be longer than 100 characters"],
        trim: true,
        match: [/^[\p{L}' -]+$/u, "Name can only contain letters, spaces, apostrophes, and hyphens"]
    },
    email: {
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email address"]
    },
    password: {
        type: String, 
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"]
    }
});

mongoose.model('User', userSchema);