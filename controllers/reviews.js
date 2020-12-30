const Campground = require('../models/campgrounds');
const Review = require('../models/reviews');

module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Thanks for your review!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async(req, res)=> {
    const {id, reviewId} = req.params;
    //Delete review reference from campground record
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

    // Delete review record
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'That review is gone')
    res.redirect(`/campgrounds/${id}`);
}