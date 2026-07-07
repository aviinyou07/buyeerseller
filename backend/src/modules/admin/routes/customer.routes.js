const express = require("express");
const router = express.Router();
const {
  createCustomer,
  listCustomers,
  getCustomerProfile,
  updateCustomerStatus,
  deleteCustomer,
  verifySeller,
} = require("../controllers/customer.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.use(protect);
router.use(adminOnly);

router.get("/", listCustomers);
router.get("/:id", getCustomerProfile);
router.post("/", createCustomer);
router.patch("/:id/status", updateCustomerStatus);
router.delete("/:id", deleteCustomer);
router.patch("/sellers/:sellerProfileId/verify", verifySeller);

module.exports = router;
