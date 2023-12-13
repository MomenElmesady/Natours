const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const apiFeaturs = require("../utils/apiFeaturs");
const Review = require('../models/reviewModel');
exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new appError('No document found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    });

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true/* this block return the modefied object not the original one */, runValidators: true })
    if (!doc) {
        return next(new appError("there is no tour with this id", 404))
    }
    // i do this to execute document middleware after update 
    if (Model === Review){
        const fake = await Model.findById(req.params.id)
        fake.save()
    }
    res.status(200).json({
        statues: "Updated",
        data: doc
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
        status: 'succeed',
        data: {
            tour: doc
        }
    })
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) {
        query = query.populate(popOptions)
    }
    const doc = await query
    if (!doc) {
        return next(new appError("there is no tour with this id", 404))
    }
    res.status(200).json({
        statues: "succeed",
        data: doc
    })
});

exports.getAll = Model => catchAsync(async (req, res) => {
    let filter = {}
    if (req.params.tourId) filter = {tour: req.params.tourId}
    // execute 
    const feature = new apiFeaturs(Model.find(filter), req.query)
    feature.filter().sort().limit().paginate()
    const doc = await feature.query
    // response 
    res.status(200).json({
        statues: "succeed",
        length: doc.length,
        data: doc
    })
});