const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const path = require("path");

// Load environment variables from .env file
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/Wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "6a0ef7375ad327851c54154b",
    geometry: {
      type: "Point",
      coordinates: [77.2089, 28.6139],
    },
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
  // Close connection so the process exits cleanly
  mongoose.connection.close();
};
