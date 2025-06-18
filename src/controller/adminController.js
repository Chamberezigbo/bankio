const prisma = require("../utils/prismaClient");
const jwt = require("jsonwebtoken");
const processImage = require("../config/compress");
const {deleteOldProfileImage} = require("../service/deleteOldProImg");

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

module.exports = {
  createAdmin,
  deleteAdmin,
  loginAdmin,
  getAllUsers,
  updateUser,
};