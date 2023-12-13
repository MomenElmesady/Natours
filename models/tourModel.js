const mongoose = require("mongoose")
const slugify = require("slugify")
const validator = require("validator");
const User = require("./userModel");

const tourSchema = mongoose.Schema({
    name: {
        type : String ,
        required : [true , "should have name"],
        unique : true,
        trim: true,
        maxlength: [40,"shouldnt be more than 40 charachters"],
        minlength: [10,"shouldnt be less than 10 charachters"],
        // here we use the validator we have just installed 
        // validate: [validator.isAlpha , "invalid name , should be alphapitical"]
    },
    slug: String,
    duration: {
        type: Number,
        required: [true,"A tour must have duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true,"A tour must have Size"]
    },
    difficulty: {
        type: String,
        // enum: {
        //     values: ["easy","difficult","mideam"],
        //     message: "invalid difficulty"
        // },
        required: [true,"A tour must have difficulty"]
    },
    ratingAverage : {
        type : Number , 
        min: [1,"rating must be more than 1 "],
        max: [5,"rating must be less than 5"],
        default : 4.5
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required : [true , "should have price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            message: "invalid disCount",
            validator: function(value){
                return value < this.price ;
            }
        }
    } ,
    summary: {
        type: String,
        trim: true,
        required: [true,"a tour must have a summery"]
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        reqquired: [true,"a tour must have a coverImage"]
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    startDates: [Date] ,
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type:{
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            discription: String
        }
    ],
    guides: [
    {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }]
},
{
toJSON: { virtuals: true },
toObject: { virtuals: true }
})

tourSchema.index({price: 1})
tourSchema.index({startLocation: "2dsphere"})

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});


// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// the document middleware executed in save , create 
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// to connect user to tours using embedded 
// tourSchema.pre("save",async function(next){
//     const guides = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guides)
//     next()
// })

tourSchema.pre(/^find/,function(next){
    this.populate({
        path: "guides",
        select: "-__v -passwordChangedAt"
    })
    next()
})

tourSchema.pre('save', function(next) {
    next();
});
    
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    
    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});

// tourSchema.pre("aggregate",function(next){
//     this.pipeline().unshift({$match: {secretTour : {$ne: true }}})
//     next()
// })

const Tour = mongoose.model("Tour",tourSchema)

module.exports = Tour



