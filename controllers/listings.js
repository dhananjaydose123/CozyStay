const Listing = require("../models/listing");

// Index Route
module.exports.index = async (req, res) => {
    let allLists = await Listing.find({});
    res.render("listings/index.ejs", { allLists });
}

// New Route
module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs");
}

// Create Route
module.exports.createListing = async (req, res, next) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Enter valid data for listing");
    // }
    // let { title, description, price, image, location, country } = req.body;
    let url = req.file.path;
    let filename = req.file.filename;
    let newList = new Listing(req.body.listing);
    newList.owner = req.user._id;
    newList.image = { url, filename };
    await newList.save();
    req.flash("success", "Successfully created a new listing");
    res.redirect("/listings");
}

// Show Route
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author", }, }).populate("owner");
    if (!list) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { list });
}

// Edit Route
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if (!list) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { list });
}

// Update Route
module.exports.updateListing = async (req, res) => {
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Enter valid data for listing");
    // }

    let { id } = req.params;
    let { title, description, price, image, location, country } = req.body;

    let updateList = await Listing.findByIdAndUpdate(
        id,
        { ...req.body },
        {
            new: true,
            runValidators: true,
        }
    );
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        updateList.image = { url, filename };
        await updateList.save();
    }
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
}

// Delete Route
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted listing");
    res.redirect("/listings");
}