const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const campground = require('./models/campground');
const morgan = require('morgan');

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
    res.render('landing')
})

app.get('/campgrounds', async(req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new')
})

app.post('/campgrounds/', async(req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

app.get('/campgrounds/:id', async(req, res) => {
    Campground.findById(req.params.id)
    .then ((campground)=> {
        console.log(campground);
         res.render('campgrounds/show',{campground})
    })
    .catch(err => {
        console.log('we got a problem here....')
        console.log(err)
        res.redirect('/campgrounds')
    });
})

app.get('/campgrounds/:id/edit', async(req,res)=>{
    Campground.findById(req.params.id)
    .then ((campground)=> {
        console.log(campground);
         res.render('campgrounds/edit',{campground})
    })
    .catch(err => {
        console.log('we got a problem here....')
        console.log(err)
        res.redirect('/campgrounds')
    });
});

app.put('/campgrounds/:id', async(req, res)=> {
    Campground.findByIdAndUpdate(req.params.id,{...req.body.campground})
    .then((campground) =>{
        console.log(campground.title + " successsfully updated");
        res.redirect(`/campgrounds/${campground._id}`)
    })
    .catch(err =>{
        console.log("update failed");
        console.log(err)
    })

})

app.delete('/campgrounds/:id', async(req, res)=>{
    const{id} = req.params;
    Campground.findByIdAndDelete(id)
    .then((campground) =>{
        console.log(campground.title + " succesfully deleted");
        res.redirect('/campgrounds')
    })
    .catch(err =>{
        console.log('delete failed');
        console.log(err)
    })
})

app.use((req, res)=>{
    res.status(404).send('file not found')
})

app.listen(3000)