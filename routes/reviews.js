const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviews');
const Campground = require('../models/campground');
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Thanks for your review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req, res)=> {
    const {id, reviewId} = req.params;
    //Delete review reference from campground record
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

    // Delete review record
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'That review is gone')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;