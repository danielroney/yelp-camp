const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const methodOverride = require('method-override');

const morgan = require('morgan');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');
const { required } = require('joi');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname,'public')));

const sessionConfig = {
    secret: 'thisshouldbebetter',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

//flash middleware
app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    console.log(req.flash('error'));
    next();
})

//configure routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

mongoose.connect('mongodb://localhost/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
    .then (()=> { 
        console.log("Mongo connection open")
    })
    .catch(err => {
        console.log('oh no mongo connection failed')
        console.log(err)
    });

app.get('/', (req,res)=>{
    //res.redirect('campgrounds')
})

app.all('*', (req, res, next)=>{
  //  res.status(404).render('./404')
  next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next)=>{
    const {statusCode=500} = err
    res.status(statusCode).render('error',{err})
})

app.listen(3000)