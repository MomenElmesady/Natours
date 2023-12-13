const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Tour = require("../../models/tourModel")
const User = require("../../models/userModel")
const Review = require("../../models/reviewModel")
dotenv.config({ path: "../../config.env" })
const DB = process.env.DATABASE

mongoose.connect(DB,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('DB connection successful!'));
    
const tours = JSON.parse(fs.readFileSync("tours.json","utf-8"))
const users = JSON.parse(fs.readFileSync("users.json","utf-8"))
const reviews = JSON.parse(fs.readFileSync("reviews.json","utf-8"))

const importData = async()=>{
    try{
        await User.create(users, {validateBeforeSave: false})
        await Review.create(reviews)
        await Tour.create(tours)
        console.log("Data loaded successfuly")
        process.exit()

    }catch(err){
        console.log(err.message)
        process.exit()

    }
}

const deleteData = async ()=>{
    try{
        await Tour.deleteMany()
        await Review.deleteMany()
        await User.deleteMany()
        console.log("deleted successfully")
        process.exit()

    }catch(err){
        console.log(err)
        process.exit()

    }
}


if (process.argv[2] === "--import")
{
    importData()
}

else if (process.argv[2] === "--delete")
{ 
    deleteData()
}









