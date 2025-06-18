const express = require('express');
const { createAdmin, loginAdmin,deleteAdmin,getAllUsers, updateUser } = require('../controller/adminController');
const { adminValidationRules, loginValidationRules, validate } = require('../middleware/validator')
const { authenticate } = require('../middleware/userAuth');

const router = express.Router();
const upload = require('../middleware/upload');

router.post(
  '/create',
  adminValidationRules,
  validate,
  createAdmin
);
router.post(
  '/login',
  loginValidationRules,
  validate,
  loginAdmin
);

router.delete(
  '/delete/:id',
  authenticate,
  deleteAdmin
);

router.get(
       '/getAll',
       authenticate, // Ensure the user is authenticated before allowing access
       getAllUsers
)

router.put(
  "/update/:id",
  upload.single("profilePicture"),
  updateUser
);

module.exports = router;