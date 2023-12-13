const Booking = require("../models/bookingModel");
const Tour = require("../models/tourModel");
const appError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory")
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSession = (async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId)

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        // its executed after the payment succees 
        success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
            req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'inr',
                    unit_amount: tour.price*100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                },
            },
        ],
    });

    res.status(200).json({
        status: "success",
        session
    })
})

exports.createBookingCheckout = catchAsync(async(req,res,next)=>{
    const {user,tour,price} = req.query 
    // after create booking the url delete query and in this step it go to next
    if (!user && !tour && !price) return next()

    await Booking.create({tour,user,price})
    res.redirect(req.originalUrl.split("?")[0])
})

exports.getMyTours = catchAsync(async(req,res,next)=>{
    // in this select doesnt work becouse we have pre find middlewarewich populate ("tour")
    // and after populate select work for populate method
    let bookings = await Booking.find({user: req.user._id}).select("tour")
    bookings = bookings.map(e=>e.tour)
    res.json({
        bookings
    })
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)