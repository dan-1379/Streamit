const express = require('express');
const router = express.Router();

const ctrlOthers = require('../controllers/others'); 
const ctrlAuth = require('../controllers/auth'); 
const ctrlContent = require('../controllers/content'); 

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); 
    }

    res.redirect('/signin');
}

router.get('/', ctrlOthers.landing);
router.get('/home', ensureAuthenticated, ctrlContent.home);
router.get('/title/:contentid', ensureAuthenticated, ctrlContent.content);
router.get('/logout', ctrlAuth.logout);

router
    .route("/signup")
    .get(ctrlAuth.signup)
    .post(ctrlAuth.register);

router
    .route("/signin")
    .get(ctrlAuth.signin)
    .post(ctrlAuth.login);

module.exports = router;