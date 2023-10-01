const express=require('express')
const router=express.Router({mergeParams:true}) //review.js will not have access to campground id hence we are using mergeparams
const catchAsync=require('../utils/catchAsync');
const Campground=require('../models/campground')
const ExpressError = require('../utils/ErrorExpress')
const Review=require('../models/review')
const {reviewSchema}=require('../schemas')
const {validateReview, isLoggedIn, isReviewAuthor}=require('../middleware')

const reviews=require('../controllers/reviews')

router.post('/',isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports=router