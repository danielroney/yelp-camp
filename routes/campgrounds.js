const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const methodOverride = require('method-override');
const {isLoggedIn, isOwner, validateCampground} = require('../middleware');

router.get('/', catchAsync(async(req, res)=> {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', isLoggedIn, (req, res)=>{
    res.render('campgrounds/new')
})

router.post('/', isLoggedIn, isOwner, validateCampground, catchAsync(async(req, res, next)=>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`campgrounds/${campground._id}`);
}))

router.get('/:id', catchAsync(async(req, res) => {
    const campground = await (await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate : {
            path: 'author'
        }
    }).populate('author'));
    if(!campground){
        req.flash('error','cannont find that campground');
        return res.redirect('/campgrounds');
    } 
    res.render('campgrounds/show',{campground})
}))

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error','cannont find that campground');
        return res.redirect('/campgrounds');
    } 
    res.render('campgrounds/edit',{campground})
}))

router.put('/:id', isLoggedIn, isOwner, validateCampground, catchAsync(async(req, res)=> {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit that campground')
        return res.redirect(`/campgrounds/${id}`);
    }
    await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success', 'Campground was successfully updated')
    res.redirect(`${campground._id}`)
}))

router.delete('/:id', isLoggedIn, isOwner, catchAsync(async(req, res)=>{
    const{id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/')
}))

module.exports = router;