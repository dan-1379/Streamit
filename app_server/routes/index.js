const express = require('express');
const router = express.Router();

const ctrlOthers = require('../controllers/others'); 
const ctrlAuth = require('../controllers/auth'); 
const ctrlContent = require('../controllers/content'); 

router.get('/', ctrlOthers.landing);
router.get('/home', ctrlContent.home);
router.get('/title/:contentid', ctrlContent.content);

router
    .route("/signup")
    .get(ctrlAuth.signup)
    .post(ctrlAuth.register);

router
    .route("/signin")
    .get(ctrlAuth.signin)
    .post(ctrlAuth.login);

module.exports = router;