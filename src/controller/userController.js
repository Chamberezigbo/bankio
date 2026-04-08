const processImage = require("../config/compress");
const prisma = require("../utils/prismaClient");
const { sendEmail } = require("../service/emailTransporter");
const { loginOtpTemplate } = require("../template/emailTemp");

const jwt = require("jsonwebtoken");

// Set your JWT secret in .env as JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;

const welcomeEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
    <h2>Welcome to America First Credit, ${name}!</h2>
    <p>Thank you for creating an account with us. We're excited to have you on board.</p>
    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
    <p>Best regards,<br/>The America First Credit Team</p>
  </div>
`;

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
        balance: accountBalance
      },
    });

    // Send welcome email after user creation
    sendEmail(
      email,
      "Welcome to America First Credit",
      welcomeEmailTemplate(firstName)
    );

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (err) {
    next(err);
  }
};

// Login controller
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and check password
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // 2. Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Save OTP to DB — upsert means "create or replace if already exists"
    await prisma.otp.upsert({
      where: { email },
      update: { code, expiresAt },   // overwrite old OTP if one exists
      create: { email, code, expiresAt },
    });

    // 5. Send OTP email
    await sendEmail(email, "Your America First Credit Login OTP", loginOtpTemplate(user.firstName, code));

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    next(err);
  }
};

const verifyLoginOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // 1. Find the OTP record for this email
    const record = await prisma.otp.findUnique({ where: { email } });
    if (!record) {
      return res.status(400).json({ success: false, error: "No OTP found for this email" });
    }

    // 2. Check if OTP has expired
    if (new Date() > record.expiresAt) {
      await prisma.otp.delete({ where: { email } }); // clean up expired OTP
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    // 3. Check if OTP code matches
    if (record.code !== otp) {
      return res.status(400).json({ success: false, error: "Incorrect OTP" });
    }

    // 4. OTP is valid — delete it so it can't be reused
    await prisma.otp.delete({ where: { email } });

    // 5. Fetch user and return JWT token
    const user = await prisma.user.findUnique({ where: { email } });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

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

const resendLoginOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    // 1. Make sure the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // 2. Generate a fresh OTP and overwrite the old one
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.upsert({
      where: { email },
      update: { code, expiresAt },
      create: { email, code, expiresAt },
    });

    // 3. Resend email
    await sendEmail(email, "Your New Login OTP - America First Credit", loginOtpTemplate(user.firstName, code));

    res.status(200).json({ success: true, message: "OTP resent to your email" });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  createUser,
  loginUser,
  verifyLoginOtp,
  resendLoginOtp,
};