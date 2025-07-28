const express = require('express');
const { 
  createAdmin, loginAdmin,deleteAdmin,getAllUsers,
  updateUser,getUserTransactions,updateUserTransaction,
  initiateUserTransaction, deleteUser
}
 = require('../controller/adminController');
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

router.delete(
  '/user/delete/:id',
  authenticate,
  deleteUser
)

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

router.get(
  '/user/:userId/transactions',
  authenticate, // admin authentication middleware
  getUserTransactions
);

router.put(
  '/transaction/:transactionId',
  authenticate, // admin authentication middleware
  updateUserTransaction
);

router.post(
  '/user/:userId/transaction',
  authenticate, // admin authentication middleware
  initiateUserTransaction
);

module.exports = router;