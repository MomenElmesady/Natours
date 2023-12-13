const rateLimit =require("express-rate-limit")
module.exports = (nofTries,time,message) => {
    return rateLimit.rateLimit({
        max: nofTries,
        windowMs: time,
        message: message
    })
}