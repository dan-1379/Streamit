const express = require('express');
const router = express.Router();
const ctrlContent = require('../controllers/content');

const ensureApiAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); 
  }
  
  res.status(401).json({ message: "Not authorised" });
}

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
  .post(ensureApiAuth, ctrlContent.contentCreateOne);

router
  .route('/content/:contentid')
  .get(ctrlContent.contentReadOne)
  .put(ensureApiAuth, ctrlContent.contentUpdateOne)
  .delete(ensureApiAuth, ctrlContent.contentDeleteOne);

module.exports = router;