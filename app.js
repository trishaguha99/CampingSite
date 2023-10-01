if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
require('dotenv').config();
const helmet=require('helmet')


const express=require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const methodOverride=require('method-override')
const session=require('express-session')
const catchAsync=require('./utils/catchAsync');
const joi=require('joi')
const flash=require('connect-flash')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')

const ejsMate=require('ejs-mate')
const ExpressError = require('./utils/ErrorExpress')

const campgroundsRoutes=require('./routes/campground')
const reviewsRoutes=require('./routes/reviews')
const userRoutes=require('./routes/users')
const mongoSanitize=require('express-mongo-sanitize')

const { Strategy } = require('passport-local');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
const dbUrl=process.env.DB_URL||'mongodb://127.0.0.1:27017/yelp-camp';
//mongodb://127.0.0.1:27017/yelp-camp
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
    console.log("MONGO CONNECTION OPEN!!")
})

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))
// app.use(ExpressMongoSanitize())
app.use(mongoSanitize({
    replaceWith:'_'
}))


app.engine('ejs',ejsMate)
app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))

app.get('/',(req,res) => {
    res.render('home')
})

const secret=process.env.SECRET||'ThisisaSecret'

const store=MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24*3600,
    crypto:{
        secret:secret
    }
})

store.on("error",function(e){
    console.log("Session error",e)
})

const sessionConfig = {
    store,
    name: 'LDW',
    secret:secret,
    resave: false,
    saveUninitialized:true,
    cookie : {
        httpOnly: true,
        expires: Date.now()+1000*60*60*24*7,
        // secure: true,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet({contentSecurityPolicy:false}))

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/djrslldtu/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next) => {
    // console.log(req.session)
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next();
})

app.get('/fakeUser', async(req,res)=>{
    const user=new User({email:'Bakwass@g.com', username:'BakwasAadmi'})
    const newUser=await User.register(user,'ghatiyaaadmi')
    res.send(newUser)
})

app.use('/',userRoutes)
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes)


app.get('/makeCampground',catchAsync( async (req,res) => {
    const camp=new Campground({title : 'My Backyard', description: 'Its quite messy'})
    await camp.save();
    res.send(camp)
}))


app.all('*',(req,res,next) => {
    next(new ExpressError('Page not found',404))
})

app.use((err, req, res, next)=>{
    const {statusCode=500}=err;
    if(!err.message) err.message='Something went wrong'
    res.status(statusCode).render('error',{err})
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})
