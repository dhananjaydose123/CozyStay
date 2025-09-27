const Listing = require("../models/listing");
const Review = require("../models/review");

// create review
module.exports.createReview = async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id);
    let newReview = new Review(req.body.review)
    newReview.author = req.user._id;
    list.reviews.push(newReview);
    await newReview.save();
    await list.save();
    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${id}#reviews`);
}

// delete Review
module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}#reviews`);
}