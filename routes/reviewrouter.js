const express = require("express")
const reviewcontroller = require('../controllers/reviewcontroller')
const authcontroller = require("../controllers/authcontroller")

const Router = express.Router({mergeParams: true})

Router.use(authcontroller.protect)

Router.route("/").get(reviewcontroller.getAllReviews)
.post(reviewcontroller.setTourUserIds,reviewcontroller.checkRestrict, reviewcontroller.createReview)

Router.route("/:id").get(reviewcontroller.getReview)
.patch(reviewcontroller.updateReview)
.delete(reviewcontroller.deleteReview)

module.exports = Router 