const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const campground = require('./models/campground');
const morgan = require('morgan');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.engine('ejs', ejsMate);

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
    res.redirect('campgrounds')
})

app.get('/campgrounds', catchAsync(async(req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new')
})

app.post('/campgrounds/', catchAsync(async(req, res, next)=>{
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required(),
        }).required()
    })
    const {error} = campgroundSchema.validate(req.body);
    console.log(error)
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req, res)=>{
    campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})
}))

app.put('/campgrounds/:id', catchAsync(async(req, res)=> {
    const campground = await Campground.findByIdAndUpdate(req.params.id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async(req, res)=>{
    const{id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.all('*', (req, res, next)=>{
  //  res.status(404).render('./404')
  next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next)=>{
    const {statusCode=500} = err
    res.status(statusCode).render('error',{err})
})



app.listen(3000)