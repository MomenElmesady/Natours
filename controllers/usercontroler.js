const User = require("../models/userModel")
const appError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factory = require("./handlerFactory")
const multer = require("multer")

const multerStorage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,"public/img/users")
  },
  filename: (req,file,cb)=>{
    const ext = file.mimetype.split("/")[1]
    cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
  }
})
const multerFilter = (req,file,cb)=>{
  if (file.mimetype.startsWith("image")){
    cb(null,true)
  }
  else {
    cb(new appError("this is not photo",400),false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single("photo")

const filterObj = (obj, ...WantedFields) => {
  const newObj = {}
  WantedFields.forEach(e => {
    newObj[e] = obj[e]
  })
  return newObj
}

exports.getMe = (req,res,next)=>{
  req.params.id = req.user.id 
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {

  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError("You cant update password here, go to updatePassword route... ", 400))
  } 

  // we filter object to take the fields we wnat to update only 
  const filterdUser = filterObj(req.body, "name","photo")
  if (req.file){
    filterdUser.photo = req.file.filename
  }
  // we dont use save becouse we wont pass password or confirm 
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdUser, { new: true, runValidators: true })

  res.status(200).json({
    message: "success",
    data: updatedUser
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id,{active: false})
  res.status(200).json({
      status: "succeed",
      data: null
  })
})

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)