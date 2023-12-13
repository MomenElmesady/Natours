const express = require('express');
const morgan = require('morgan');
const appError = require('./utils/appError')
const globalErrorHandler = require("./controllers/errorControler")
const tourRouter = require('./routes/tourrouter.js');
const userRouter = require('./routes/userrouter.js');
const bookingRouter = require('./routes/bookingrouter');
const reviewRouter = require("./routes/reviewrouter")
const viewRouter = require("./routes/viewRouter.js")
const RateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")
const cookieParser = require("cookie-parser")
const cors = require('cors');

const app = express();

app.set("view engine", "pug")
app.set("views", "./views")
// to add headers to http 
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],

      baseUri: ["'self'"],

      fontSrc: ["'self'", 'https:', 'data:'],

      scriptSrc: ["'self'", 'https://*.cloudflare.com'],

      scriptSrc: ["'self'", 'https://*.stripe.com'],

      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],

      frameSrc: ["'self'", 'https://*.stripe.com'],

      objectSrc: ["'none'"],

      styleSrc: ["'self'", 'https:', 'unsafe-inline'],

      workerSrc: ["'self'", 'data:', 'blob:'],

      childSrc: ["'self'", 'blob:'],

      imgSrc: ["'self'", 'data:', 'blob:'],

      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],

      upgradeInsecureRequests: [],
    },
  })
);

/*in real applications sometomes you want to use limit and sometimes not , 
in this case you should use limit as middlware finction in the route folder*/

// to use as global middlware  
app.use("/api", RateLimit.rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "many requests!, try again later"
}))

// to make the req has method body
app.use(cors())
app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// data sanitization against noSql query injection 
app.use(mongoSanitize())

// to sanitization against XSS(insert data canbe work in browser(html data))
app.use(xss())

// too prevent parameter pollution
app.use(hpp({
  whitelist: ["duration"] /*to allow dublcate value for theese*/
}))

app.use(express.static('./public'));

app.use("/", viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);




app.all("*", (req, res, next) => {
  next(new appError(`cant find ${req.originalUrl} route`, 404));
})

app.use(globalErrorHandler)

module.exports = app;

