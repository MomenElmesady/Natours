// this is used by user while theuserController used by admin 
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { promisify } = require('util')
const appError = require("../utils/appError")
const sendEmail = require("../utils/email")


const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    cookieOptions = {
        expire: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100),
        httpOnly: true
    }
    if (process.env.NODE_ENV === "production") {
        cookieOptions.security = ture
    }

    // to send cookie 
    res.cookie("jwt", token, cookieOptions)
    user.password = undefined
    res.status(statusCode).json({
        status: "succeed",
        token,
        data: {
            user
        }
    })
}
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body)
    createSendToken(newUser, 200, res)
})


exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body
    if (!email || !password) {
        next(new appError("Enter email and password", 400))
    }

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        return next(new appError("There is no user in this name", 201))
    }
    const isPassMatch = await user.correctPassword(password, user.password)
    if (!isPassMatch) {
        return next(new appError("Wrong password", 201))
    }
    else {
        createSendToken(user, 200, res)
    }
})

exports.logout = (req,res)=>{
    res.cookie("jwt", "EmptyOne",{
        expired: new Date(Date.now()+10*1000),
        httpOnly: true 
    })
    res.status(200).json({
        status: "success"
    })
}

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }
    else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        return next(new appError("Must be logged in!", 404))
    }
    // 2) Verification token
    // if error in verfication it will pass error else verfiation executed successfully
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); /*extract data*/
    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id)
    if (!freshUser) {
        return next(new appError("This user dosent longer exists", 400))
    }
    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError("user change the password", 401))
    }
    // if success
    req.user = freshUser
    res.locals.user = freshUser;
    next()
})

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError("you dont have permisson to perform this action", 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ "email": req.body.email })
    if (!user) {
        return next(new appError("this user not found", 403))
    }
    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        console.log(resetToken)
        await sendEmail({ email: user.email, subject: `your Password reset token (for 10 minutes)`, resetToken })
        res.status(200).json({
            status: `success`,
            message: `token send to email`
        })

    } catch (err) {
        user.paswordResetToken = undefined
        user.paswordResetExpires = undefined
        await user.save({ validateBeforeSave: false })
        return next(new appError("there was an errro sending the email , try again", 500))
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) get the user based on the token 
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
    const user = await User.findOne({ passwordResetToken: hashedToken,/*paswordResetExpires: {$gt: Date.now()}*/ })
    // 2) if token has expired and thereis no user 
    if (!user) {
        return next(new appError("Token has invalid or expired", 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 3) Update changedPasswordAt property for the user
    // 4) log the user in send jwt 
    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    // 2) Check if POSTed current password is correct
    if (!await user.correctPassword(req.body.passwordCurrent, user.password)) {
        return next(new appError("Invalid password !!", 401))
    }
    // 3) If so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    // here we dont use update becouse we want validators to execute and thay are executed in saveand create only  

    await user.save()

    // 4) Log user in, send JWT
    createSendToken(user, 200, res)
})


