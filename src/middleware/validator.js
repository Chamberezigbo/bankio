const { body, validationResult } = require("express-validator");

const userValidationRules = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("accountType").notEmpty().withMessage("Account type is required"),
  body("dateOfBirth").notEmpty().withMessage("Valid date of birth is required"),
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("address").notEmpty().withMessage("Address is required"),
];

const loginValidationRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const transferValidationRules = [
  body("accountName").notEmpty().withMessage("Account Name is required"),
  body("accountNumber").notEmpty().withMessage("Account Number is required"),
  body("bankName").notEmpty().withMessage("Bank Name is required"),
  body("bankAddress").notEmpty().withMessage("Bank Address is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("currency").notEmpty().withMessage("Currency is required"),
  body("swiftCode").notEmpty().withMessage("SWIFT Code is required"),
  body("ibanNumber").notEmpty().withMessage("IBAN Number is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
  body("transferType").notEmpty().withMessage("Transfer Type is required"),
  body("description").optional().isString(),
];

const adminValidationRules = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => err.msg) });
  }
  next();
};

module.exports = {
  userValidationRules,
  loginValidationRules,
  transferValidationRules,
  adminValidationRules,
  validate,
};