const {CampgroundSchema, reviewSchema}=require('./schemas')
const ExpressError = require('./utils/ErrorExpress')
const Campground=require('./models/campground')
const User=require('./models/user')
const Review = require('./models/review')

module.exports.isLoggedIn = (req,res,next) => {
    console.log(req.isAuthenticated());
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        console.log('HI')
        req.flash('error', 'You should be signed in')
        return res.redirect('/login')
    }
    next()
}


module.exports.storeReturnTo=(req,res,next)=> {
    if(req.session.returnTo){
        res.locals.returnTo=req.session.returnTo
        console.log(res.locals.returnTo)
    }
    next()
}

module.exports.validateCampground = (req,res,next) => {
    const {error}=CampgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    } 
}

module.exports.isAuthor = async (req,res,next)=>{
    const{id}=req.params;
    const campground=await Campground.findById(id)
    console.log('Hello')
    if(!campground.author[0].equals(req.user._id))
    {
        req.flash('error','You are not authorized to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next()
}

module.exports.validateReview = (req,res,next) => {
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    } 
}

module.exports.isReviewAuthor = async (req,res,next)=>{
    const{id, reviewId}=req.params;
    const review=await Review.findById(reviewId)
    console.log('Hello')
    if(!review.author.equals(req.user._id))
    {
        req.flash('error','You are not authorized to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next()
}