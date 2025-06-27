const processImage = require("../config/compress");
const prisma = require("../utils/prismaClient");

const jwt = require("jsonwebtoken");

// Set your JWT secret in .env as JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

// Controller function to create a new user with profile picture
const createUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      accountType,
      dateOfBirth,
      phoneNumber,
      country,
      address,
    } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // generate account number (e.g., 10-digit)
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const accountBalance = 0; // Initialize account balance

    // Handle profile picture
    let profileImageUrl = null;
    if (req.file) {
      const filename = `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
      profileImageUrl = await processImage(
        req.file.buffer,
        "profile-image",
        filename
      );
    }

    // Convert dateOfBirth string to Date object and validate
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date of birth format" });
    }

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
        accountType,
        profileImageUrl,
        accountNumber,
        dateOfBirth: date, // <-- use the Date object here
        phoneNumber,
        country,
        address,
        balance:accountBalance
      },
    });

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

// Login controller
const loginUser = async (req, res, next) => {
       try {
         const { email, password } = req.body;
     
         // Find user by email
         const user = await prisma.user.findUnique({
           where: { email },
         });
         if (!user || user.password !== password) {
           return res.status(401).json({success:false, error: "Invalid email or password" });
         }
     
         // Generate JWT token
         const token = jwt.sign(
           { userId: user.id, email: user.email },
           JWT_SECRET,
           { expiresIn: "7d" }
         );
     
         res.status(200).json({
           success: true,
           message: "Login successful",
           token,
           user: {
             id: user.id,
             firstName: user.firstName,
             lastName: user.lastName,
             email: user.email,
             accountNumber: user.accountNumber,
             accountType: user.accountType,
             profileImageUrl: user.profileImageUrl,
           },
         });
       } catch (err) {
         next(err);
       }
};

module.exports = {
  createUser,
  loginUser
};