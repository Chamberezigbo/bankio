const express = require("express");
const { initiateTransfer, verifyTransferOtp, resendTransferOtp } = require("../controller/transactionsController");
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

router.post(
  "/transfer/verify-otp",
  authenticate,
  verifyTransferOtp
);

router.post(
  "/transfer/resend-otp",
  authenticate,
  resendTransferOtp
);

module.exports = router;