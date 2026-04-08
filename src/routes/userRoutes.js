const express = require("express");
const upload = require("../middleware/upload");
const { createUser,loginUser,verifyLoginOtp, resendLoginOtp } = require("../controller/userController");
const { userValidationRules,loginValidationRules, validate } = require("../middleware/validator");

const router = express.Router();

router.post(
  "/create",
  upload.single("profilePicture"),
  userValidationRules,
  validate,
  createUser
);

router.post(
  "/login",
  loginValidationRules, // Assuming login also requires some validation
  validate,
  loginUser
);

router.post("/resend-otp", resendLoginOtp);

router.post("/verify-otp", verifyLoginOtp);


module.exports = router;