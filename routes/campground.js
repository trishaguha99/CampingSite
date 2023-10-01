const express=require('express')
const router=express.Router()
const catchAsync=require('../utils/catchAsync');
const ExpressError = require('../utils/ErrorExpress')
const Campground=require('../models/campground')
const {CampgroundSchema}=require('../schemas')
const passport=require('passport')
const {isLoggedIn, isAuthor, validateCampground}=require('../middleware')

const campgrounds=require('../controllers/campgrounds')

const multer=require('multer')
const {storage}=require('../cloudinary')
const upload=multer({storage})

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedIn, upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground))

// .post(upload.single('image'),(req,res)=>{
//     console.log(req.body, req.file)
//     res.send('It worked')
// })

// for uploading multiple files change upload.single to upload.multiple and req.file to req.files
router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn,isAuthor,upload.array('image'),validateCampground, catchAsync(campgrounds.updateCampground))
.delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm))

module.exports=router