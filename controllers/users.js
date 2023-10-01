const User=require('../models/user')

module.exports.renderRegister=(req,res) => {
    res.render('users/register')
}

module.exports.register=async(req,res)=> {
    try{
    const {email, username, password}=req.body;
    const user=new User({email, username})
    const registeredUser=await User.register(user,password)
    req.login(registeredUser, err => {
        if(err) return next(err)
        req.flash('success','Welcome to Yelp-Camp')
        res.redirect('/campgrounds')
    })
    // console.log(req.body)
    }
    catch(e)
    {
        req.flash('error',e.message)
        res.redirect('register')
    }
}

module.exports.renderLogin=async(req, res)=> {
    res.render('users/login')
}

module.exports.login=(req,res)=>{
    req.flash('success','Welcome to Campgrounds')
    const redirectUrl= res.locals.returnTo || '/campgrounds';
    // console.log('redirected : ',redirectUrl)
    // delete res.locals.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout=(req,res)=>{
    req.logOut(function (err){
        if(err){
            return next(err);
        }
        req.flash('success','You are signed out')
    res.redirect('/campgrounds')
    })
    
}