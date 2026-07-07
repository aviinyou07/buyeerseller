const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createListing,
  listListings,
  listInterestedUsers,
  getListingDetails,
  deleteListing,
  toggleFeatureListing,
  updateListing,
} = require("../controllers/listing.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

// Set up local storage for uploaded product images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const dir = path.join(process.cwd(), "uploads", "listings");
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "thumbnail", maxCount: 4 },
]);

router.use(protect);
router.use(adminOnly);

router.get("/", listListings);
router.post("/", uploadMiddleware, createListing);
router.get("/:id/interested-users", listInterestedUsers);
router.get("/:id", getListingDetails);
router.patch("/:id", uploadMiddleware, updateListing);
router.delete("/:id", deleteListing);
router.patch("/:id/feature", toggleFeatureListing);

module.exports = router;
