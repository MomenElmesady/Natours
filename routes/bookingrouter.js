const express = require("express")
const bookingController = require('../controllers/bookingcontroller')
const authcontroller = require("../controllers/authcontroller")

const Router = express.Router()

Router.use(authcontroller.protect)

Router.get("/checkout-session/:tourId",bookingController.getCheckoutSession)

// Router.use(authcontroller.restrictTo("admin","lead-guide"))
Router.route("/").get(bookingController.getAllBookings).post(bookingController.createBooking)
Router.route("/:bookingId").get(bookingController.getBooking).patch(bookingController.updateBooking).delete(bookingController.deleteBooking)

module.exports = Router     