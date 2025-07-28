const prisma = require("../utils/prismaClient");
const jwt = require("jsonwebtoken");
const processImage = require("../config/compress");
const {deleteOldProfileImage} = require("../service/deleteOldProImg");
const { sendEmail } = require("../service/emailTransporter");
const transferNotificationTemplate = require("../template/emailTemp");

// Set your JWT secret in .env as JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

// Create a new admin
const createAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ error: "Admin with this email already exists" });
    }

    const admin = await prisma.admin.create({
      data: { firstName, lastName, email, password },
    });

    res.status(201).json({ success: true, admin });
  } catch (err) {
    next(err);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    if (!admin || admin.password !== password) {
      return res.status(401).json({success:false, error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete an admin by ID
const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    await prisma.admin.delete({ where: { id } });

    res.status(200).json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete related records and the user in a single transaction
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId: id } }),
      prisma.deposit.deleteMany({ where: { userId: id } }),
      prisma.transfer.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    res.status(200).json({ success: true, message: "User and all related records deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get all users (for admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        profileImageUrl: true,
        isSuspicious: true,
        dateOfBirth: true,
        phoneNumber: true,
        country: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// Update a user (for admin)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      password,
      accountNumber,
      accountType,
      balance,
      isSuspicious,
      dateOfBirth,
      phoneNumber,
      country,
      address,
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build update data object with only provided fields
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber;
    if (accountType !== undefined) updateData.accountType = accountType;
    if (balance !== undefined) updateData.balance = balance;
    if (isSuspicious !== undefined) updateData.isSuspicious = isSuspicious;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (country !== undefined) updateData.country = country;
    if (address !== undefined) updateData.address = address;

    // Handle profile picture update if file is provided
    if (req.file) {
      // Delete old image if exists
      await deleteOldProfileImage(user.profileImageUrl);

      const filename = `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
      updateData.profileImageUrl = await processImage(
        req.file.buffer,
        "profile-image",
        filename
      );
    }

    // Update user with only provided fields
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// Get all transactions for a particular user (for admin)
const getUserTransactions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
};

// Edit/update a user's transaction details (for admin)
const updateUserTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const {
      type,
      amount,
      status,
      description,
    } = req.body;

    // Find transaction
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Build update data object with only provided fields
    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (amount !== undefined) updateData.amount = amount;
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    res.status(200).json({ success: true, transaction: updatedTransaction });
  } catch (err) {
    next(err);
  }
};


const initiateUserTransaction = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, amount, description, status } = req.body; // type: 'credit' or 'debit'

    // Find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let newBalance = user.balance;
    let transactionType = type.toLowerCase();
    const numericAmount = parseFloat(amount);

    // Debit: subtract, Credit: add
    if (transactionType === "debit") {
      if (numericAmount > user.balance) {
        return res.status(400).json({ error: "Insufficient balance for debit transaction" });
      }
      newBalance -= numericAmount;
    } else if (transactionType === "credit") {
      newBalance += numericAmount;
    } else {
      return res.status(400).json({ error: "Transaction type must be 'credit' or 'debit'" });
    }

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        type: transactionType,
        amount:numericAmount,
        status: status || "success",
        description,
        userId,
      },
    });

    // Prepare email details
    const transactionDetailsHtml = `
      <b>Transaction Type:</b> ${transactionType}<br>
      <b>Amount:</b> ${amount}<br>
      <b>Description:</b> ${description || "N/A"}<br>
      <b>Status:</b> ${transaction.status}<br>
      <b>New Balance:</b> ${newBalance}<br>
    `;
    const emailMessage =
      transactionType === "credit"
        ? "Your account has been credited!"
        : "Your account has been debited!";

    // Send email notification
    const html = transferNotificationTemplate(
      user.firstName,
      transactionDetailsHtml,
      emailMessage
    );
    await sendEmail(user.email, `Account ${transactionType === "credit" ? "Credit" : "Debit"} Notification`, html);

    res.status(201).json({
      success: true,
      message: `Transaction (${transactionType}) successful`,
      transaction,
      newBalance,
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  createAdmin,
  deleteAdmin,
  deleteUser,
  loginAdmin,
  getAllUsers,
  updateUser,
  getUserTransactions,
  updateUserTransaction,
  initiateUserTransaction,
};