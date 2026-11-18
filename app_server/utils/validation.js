const validator = require("validator");

const getPasswordErrors = (password) => {
    const passwordErrors = [];

    if (!password || password.length < 8) {
        passwordErrors.push("at least 8 characters");
    }

    if (!/[a-z]/.test(password)) {
        passwordErrors.push('a lowercase letter'); 
    }

    if (!/[A-Z]/.test(password)) {
        passwordErrors.push('an uppercase letter'); 
    }

    if (!/[0-9]/.test(password)) {
        passwordErrors.push('a number'); 
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        passwordErrors.push('a symbol'); 
    }

    return passwordErrors;
}

const validateRegistration = ({ firstname, lastname, email, password }) => {
     const errors = [];

    if (!firstname) {
        errors.push('First name is required'); 
    }

    if (!lastname) {
        errors.push('Last name is required'); 
    }

    if (!email) {
        errors.push('Email is required');
    } else if (!validator.isEmail(email)) {
        errors.push('Email is not valid');
    }

    if (!password) {
        errors.push('Password is required');
    } else {
        getPasswordErrors(password).forEach(e => errors.push('Password needs ' + e));
    }

    return errors;
}

const validateLogin = ({ email, password }) => {
    const errors = [];

    if (!email) {
        errors.push('Email is required'); 
    }
    
    if (!password) {
        errors.push('Password is required'); 
    }

    return errors;
}

module.exports = { 
    getPasswordErrors, 
    validateRegistration, 
    validateLogin 
};