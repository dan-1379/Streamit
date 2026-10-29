const express = require('express');
const router = express.Router();
const ctrlUsers = require('../controllers/auth');
const ctrlContent = require('../controllers/content');

// users
router
  .route("/login")
  .post(ctrlUsers.userLogin)

router
  .route('/users')
  .post(ctrlUsers.userCreateOne);

router
  .route('/users/:userid')
  .get(ctrlUsers.userReadOne)
  .put(ctrlUsers.userUpdateOne)
  .delete(ctrlUsers.userDeleteOne);

// content
router
  .route('/content')
  .get(ctrlContent.contentReadAll)
  .post(ctrlContent.contentCreateOne);

router
  .route('/content/:contentid')
  .get(ctrlContent.contentReadOne)
  .put(ctrlContent.contentUpdateOne)
  .delete(ctrlContent.contentDeleteOne);

module.exports = router;