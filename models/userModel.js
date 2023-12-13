const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const userschema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "should have name"]
    },
    email: {
        type: String,
        required: [true, "should have email"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "inValid Email"]
    },
    photo: {
        type: String,
        default: "default.jpg"
    },
    password: {
        type: String,
        required: [true, "Please Enter password"],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please Enter password confirm"],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            mesaage: "doesnt match the password"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: {
        type: String,
        enum: ["user", "admin", "guide", "lead-guide"],
        default: "user"
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    nofTries: {
        type: Number,
        default: 0
    }
})

userschema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) { 
    
    return  await bcrypt.compare(candidatePassword, userPassword);
}; 



userschema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimeStamp
    }

    return false
}

userschema.pre(`save`, async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    // becouse it is required   
    this.passwordConfirm = undefined;

    next()
})

userschema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userschema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}



userschema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    
    this.start = Date.now();
    next();
});


const User = mongoose.model("User", userschema)
module.exports = User