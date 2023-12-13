const express = require("express")
const viewController = require("../controllers/viewscontroller")
const authController = require("../controllers/authcontroller")
const bookingController = require("../controllers/bookingcontroller")
const Router = express.Router()

Router.get("/my-tours",authController.protect,bookingController.getMyTours)

Router.get("/",
// after payment we go to this route (success url) so we add this middleware here to add new booking 
bookingController.createBookingCheckout
, authController.isLoggedIn,viewController.getOverview)
Router.get("/tour/:slug",authController.isLoggedIn, viewController.getTour )
Router.get("/login",authController.isLoggedIn, viewController.getLoginForm)
Router.get("/me",authController.protect,viewController.getAccount)

Router.post("/submit-user-data",authController.protect,viewController.updateUserData)
module.exports = Router