const express = require('express');
const usercontroller = require("../controllers/usercontroler")
const authController = require("../controllers/authcontroller")
const rateLimit = require("../utils/rateLimit")
const router = express.Router();


router.get("/me",usercontroller.getMe,usercontroller.getUser)
router.post("/signup",authController.signup)
router.post("/login",rateLimit(100,60*60*1000,"many requests!, try again later"),authController.login)
router.get("/logout",authController.logout)
router.post("/forgotPassword",authController.forgotPassword)
router.patch("/resetPassword/:token",authController.resetPassword)

router.use(authController.protect)

router.patch("/updateMe",usercontroller.uploadUserPhoto,usercontroller.updateMe)
router.patch("/updateMyPassword",authController.updatePassword)
router.delete("/deleteMe",usercontroller.deleteMe)

// protect all routes after this middleware 
router
  .route('/')
  .get(usercontroller.getAllUsers)
  .post(usercontroller.createUser);

router
  .route('/:id')
  .get(usercontroller.getUser)
  .patch(usercontroller.updateUser)
  .delete(usercontroller.deleteUser);

module.exports = router;
