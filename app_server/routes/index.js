const express = require('express');
const router = express.Router();

const ctrlOthers = require('../controllers/others'); 
const ctrlAuth = require('../controllers/auth'); 
const ctrlContent = require('../controllers/content'); 

router.get('/', ctrlOthers.landing);

router.get('/signin', ctrlAuth.signin);
router.get('/signup', ctrlAuth.signup);

router.get('/home', ctrlContent.home);
// router.get('/content', ctrlContent.contentInfo);

module.exports = router;