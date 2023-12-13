const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" })
const app = require("./app2.js")

/* Well, all errors, or let's also call them bugs,

that occur in our synchronous code

but are not handled anywhere are called uncaught exceptions.*/


const DB = process.env.DATABASE


mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('DB connection successful!')); 


const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})

// handle any rejected promise or async error

; 



