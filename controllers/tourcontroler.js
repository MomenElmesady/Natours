const Tour = require("../models/tourModel")
const APIFeatures = require("../utils/apiFeaturs");
const catchAsync = require("./../utils/catchAsync");
const appError = require(".././utils/appError")
const factory = require("./handlerFactory")
const multer = require("multer")


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

// now i will do this in my own // 
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.middleware = (req,res,next) => {
//   if (!req.body.name) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     })
//   }
//   else 
//   {
//     next()
//   }
// }


exports.createTour = factory.createOne(Tour)

exports.getAllTours = catchAsync(async (req, res) => {
  // execute 
  const feature = new APIFeatures(Tour.find(), req.query)
  feature.filter().sort().limit().paginate()
  const allTours = await feature.query
  // response 
  res.status(200).json({
    statues: "succeed",
    length: allTours.length,
    allTours
  })
});


exports.getTour = factory.getOne(Tour, { path: "reviews" })



exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)



exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty"
  next()
}

// find longest duration
exports.topDuration = (req, res, next) => {
  req.query.sort = "-duration,price"
  req.query.fields = "name,price,ratingAverage,summary,difficulty,duration"
  next()
}

// find top rated 
exports.topRated = (req, res, next) => {
  req.query.sort = "-ratingAverage"
  req.query.fields = "name,price,ratingAverage,summary,difficulty,duration"
  // another way to select number of tours by params 
  req.query.limit = req.params.tours * 1 // but it diffirent route and should have number
  next()
}

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { duration: { $gte: 1 } }
    },
    {
      $group: {
        _id: null, // put the property you want to group by 
        _id: "$difficulty", // put the property you want to group by 
        numTours: { $sum: 1 }, // sum 1 in every document
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        maxPrice: { $max: "$price" },
        minPrice: { $min: "$price" },
        bestOne: { $max: "$ratingAverage" },
        maxDuration: { $max: "$duration" }
      },
    },
    {
      $sort: { maxDuration: -1 }
    },
    {
      $match: { _id: "easy" }
    }
    // you can add more matches
  ])
  res.status(200).json({
    data: stats
  })
})




exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numberOfTours: { $sum: 1 },
        tours: { $push: "$name" }
      }
    },
    {
      $addFields: { month: "$_id" }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numberOfTours: -1 }
    },
    {
      $limit: 1
    }

  ])
  res.status(200).json({
    plan: plan
  })
})

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new appError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new appError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    },

  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
