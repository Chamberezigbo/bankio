const express = require("express");
const { initiateTransfer } = require("../controller/transactionsController");
const { transferValidationRules, validate } = require("../middleware/validator");
const { authenticate } = require("../middleware/userAuth");

const router = express.Router();

router.post(
  "/transfer",
  transferValidationRules,
  validate,
  authenticate, // Ensure the user is authenticated before allowing transfer
  initiateTransfer,
);

module.exports = router;