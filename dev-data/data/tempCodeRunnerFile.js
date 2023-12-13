mongoose.connect(DB,{
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => console.log('DB connection successful!'));