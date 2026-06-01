const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let { category, q } = req.query;
  let allListings;

  if (q) {
    const categories = ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"];
    const matchedCategory = categories.find(cat => cat.toLowerCase() === q.trim().toLowerCase());
    
    if (matchedCategory) {
      category = matchedCategory;
    }
  }

  if (category) {
    allListings = await Listing.find({ category });
  } else if (q) {
    allListings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } }
      ]
    });
  } else {
    allListings = await Listing.find({});
  }
  
  res.render("listings/index.ejs", { allListings, category, q });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = req.file.path;
  }

  if (response.body.features && response.body.features.length > 0) {
    newListing.geometry = response.body.features[0].geometry;
  } else {
    newListing.geometry = {
      type: "Point",
      coordinates: [77.2089, 28.6139],
    };
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let originalImageurl = typeof listing.image === "string" ? listing.image : "";
  if (originalImageurl) {
    originalImageurl = originalImageurl.replace("/upload", "/upload/w_250");
  }

  res.render("listings/edit.ejs", { listing, originalImageurl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true },
  );

  if (response.body.features && response.body.features.length > 0) {
    listing.geometry = response.body.features[0].geometry;
  }

  if (req.file) {
    listing.image = req.file.path;
  }

  await listing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
