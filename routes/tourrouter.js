const express = require('express');
const tourcontroller = require('./../controllers/tourcontroler.js');
const authcontroller = require("../controllers/authcontroller.js")
const reviewRouter = require("./reviewrouter.js")

const Router = express.Router();

Router.use("/:tourId/reviews",reviewRouter)

Router.route("/monthly-plan/:year").get(authcontroller.protect,authcontroller.restrictTo("admin","guide","lead-guide"),tourcontroller.getMonthlyPlan)

// test aggregiation
Router.route("/tour-stats").get(tourcontroller.getTourStats)

// cheapest 5 
Router.route("/top-5-cheap").get(tourcontroller.aliasTopTours, tourcontroller.getAllTours)

// find longest duration
Router.route("/longest-tours").get(tourcontroller.topDuration,tourcontroller.getAllTours)

Router.route("/best-tours/:tours").get(tourcontroller.topRated,tourcontroller.getAllTours)

Router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(tourcontroller.getToursWithin)
Router.route('/distances/:latlng/unit/:unit').get(tourcontroller.getDistances);

Router.route(`/`)
  .get(authcontroller.protect,tourcontroller.getAllTours)
  .post(authcontroller.protect,authcontroller.restrictTo("admin","lead-guide"), tourcontroller.createTour);

Router.route(`/:id`).get(tourcontroller.getTour)
.patch(authcontroller.protect,authcontroller.restrictTo("admin","lead-guide"),tourcontroller.uploadTourImages,tourcontroller.resizeTourImages,tourcontroller.updateTour)
.delete(authcontroller.protect,authcontroller.restrictTo("admin","lead-guide"),tourcontroller.deleteTour);

module.exports = Router;
