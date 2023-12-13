const Booking = require("../models/bookingModel")
const Review = require("../models/reviewModel")
const appError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handlerFactory")

exports.getAllReviews = factory.getAll(Review)

// we add it to set user and tour that have the review 
exports.setTourUserIds = catchAsync(async(req,res,next)=>{
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user.id 
    next()
})

exports.checkRestrict = catchAsync(async(req,res,next)=>{
    const {user,tour} = req.body 
    const booking = await Booking.findOne({user,tour})
    if (!booking){
        return next(new appError("you should buy this course to review it",404))
    }
    next()
})

exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)
