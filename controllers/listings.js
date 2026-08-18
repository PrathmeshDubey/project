const Listing = require("../models/listing");
const axios = require("axios");
const mbxGeocoding = {}; // dummy to keep same variable name
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = {
  forwardGeocode: async ({ query, limit = 1 }) => {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${mapToken}&limit=${limit}`;
    const response = await axios.get(url, { timeout: 5000 });
    return { body: response.data };
  },
};

// module.exports.index = async (req, res) => {
//     const allListings = await Listing.find({}); 
//     console.log("Total listings:", allListings.length);
//     res.render("listings/index.ejs", {allListings});
// };


// module.exports.renderNewForm = (req, res) => {
//     res.render("listings/new.ejs");
// };

// module.exports.showListing = async (req, res) => {
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate({ path: "reviews", populate: {
//         path: "author",
//     },
// }).populate("owner");
//     if(!listing) {
//         req.flash("error", "listing you requested for does not exit!");
//         res.redirect("/listings");
//     }
//     console.log("listing");
//     res.render("listings/show.ejs", { listing });
// };


// module.exports.createListing = async (req, res, next) => {
//         let response = await geocodingClient.forwardGeocode({
//     query: req.body.listing.location,
//     limit: 1,
// });

   

//     let url = req.file.path;
//     let filename = req.file.filename;

//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url, filename};

//     newListing.geometry = response.body.features[0].geometry;

//     let savedListing = await newListing.save();
//     console.log(savedListing);
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
//     };


//     module.exports.renderEditForm= async (req, res) => {
//         let {id} = req.params;
//         const listing = await Listing.findById(id);
//         if(!listing) {
//             req.flash("error", "listing you requested for does not exit!");
//             res.redirect("/listings");
//         }

//         let originalImageUrl = listing.image.url;
//         originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
//         res.render("listings/edit.ejs", {listing, originalImageUrl});
//     };


//     module.exports.updateListing = async (req, res) => {
     
//          let {id} = req.params;
//         //  let listing = await Listing.findById(id);
//          let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
          
//          if (typeof req.file !== "undefined") {
//          let url = req.file.path;
//          let filename = req.file.filename;
//         listing.image = { url, filename };
//         await listing.save();
//          }
//          req.flash("success", " Listing Updated!");
//          res.redirect(`/listings/${id}`);
//     };


//     module.exports.destroyListing = async (req, res) => {
//       const { id } = req.params;
//       const deletedListing = await Listing.findByIdAndDelete(id);
//       console.log(deletedListing);
//       req.flash("success", " Listing Deleted!");
//       res.redirect("/listings");
//     };






module.exports.index = async (req, res) => {

    const allListings = await Listing.find({});

    console.log("TOTAL LISTINGS:", allListings.length);

    res.render("listings/index.ejs", {
        allListings
    });
};


// =========================
// NEW LISTING FORM
// =========================

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// =========================
// SHOW ONE LISTING
// =========================

module.exports.showListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {

        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {
        listing
    });
};


// =========================
// CREATE LISTING
// =========================

module.exports.createListing = async (req, res) => {

    const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    });

    const newListing = new Listing(req.body.listing);

    // IMPORTANT:
    // Save the logged-in user as owner
    newListing.owner = req.user._id;

    // Save uploaded image
    if (req.file) {

        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // Save map location
    if (
        response.body.features &&
        response.body.features.length > 0
    ) {

        newListing.geometry =
            response.body.features[0].geometry;
    }

    const savedListing = await newListing.save();

    console.log("NEW LISTING:", savedListing);

    req.flash(
        "success",
        "New Listing Created!"
    );

    res.redirect("/listings");
};


// =========================
// EDIT FORM
// =========================

module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "Listing you requested for does not exist!"
        );

        return res.redirect("/listings");
    }

    let originalImageUrl = "";

    if (listing.image && listing.image.url) {

        originalImageUrl =
            listing.image.url.replace(
                "/upload",
                "/upload/w_250"
            );
    }

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl
    });
};


// =========================
// UPDATE LISTING
// =========================

module.exports.updateListing = async (req, res) => {

    const { id } = req.params;

    const listing =
        await Listing.findByIdAndUpdate(
            id,
            {
                ...req.body.listing
            },
            {
                new: true
            }
        );

    if (!listing) {

        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect("/listings");
    }

    if (req.file) {

        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        await listing.save();
    }

    req.flash(
        "success",
        "Listing Updated!"
    );

    res.redirect(`/listings/${id}`);
};


// =========================
// DELETE LISTING
// =========================

module.exports.destroyListing = async (req, res) => {

    const { id } = req.params;

    const deletedListing =
        await Listing.findByIdAndDelete(id);

    if (!deletedListing) {

        req.flash(
            "error",
            "Listing not found!"
        );

        return res.redirect("/listings");
    }

    console.log("DELETED:", deletedListing);

    req.flash(
        "success",
        "Listing Deleted!"
    );

    res.redirect("/listings");
};







