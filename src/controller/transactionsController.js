const prisma = require("../utils/prismaClient");
const { sendEmail } = require("../service/emailTransporter");
const { transferNotificationTemplate, transferOtpTemplate } = require("../template/emailTemp");


const initiateTransfer = async (req, res, next) => {
  try {
    const {
      accountName, accountNumber, bankName, bankAddress,
      country, currency, swiftCode, ibanNumber,
      amount, transferType, description,
    } = req.body;

    const userId = req.user.userId;

    // 1. Fetch user and run checks
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isSuspicious) {
      return res.status(403).json({ success: false, error: "Transfers are currently disabled for your account." });
    }

    if (parseFloat(amount) > user.balance) {
      return res.status(400).json({ success: false, error: "Insufficient account balance" });
    }

    // 2. Save transfer as "pending" — no balance deduction yet
    const transfer = await prisma.transfer.create({
      data: {
        accountName, accountNumber, bankName, bankAddress,
        country, currency, swiftCode, ibanNumber,
        amount: parseFloat(amount),
        transferType,
        description,
        status: "pending",
        userId,
      },
    });

    // 3. Generate OTP and save it
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.upsert({
      where: { email: user.email },
      update: { code, expiresAt },
      create: { email: user.email, code, expiresAt },
    });

    // 4. Send OTP email
    await sendEmail(user.email,
      "Confirm Your Transfer - America First Credit OTP",
      transferOtpTemplate(user.firstName, code, `$${parseFloat(amount).toLocaleString()}`)
    );

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Confirm to complete transfer.",
      transferId: transfer.id, // frontend needs this for the verify step
    });
  } catch (err) {
    next(err);
  }
};

const verifyTransferOtp = async (req, res, next) => {
  try {
    const { otp, transferId } = req.body;
    const userId = req.user.userId;

    // 1. Fetch the pending transfer
    const transfer = await prisma.transfer.findUnique({ where: { id: transferId } });
    if (!transfer || transfer.userId !== userId || transfer.status !== "pending") {
      return res.status(404).json({ success: false, error: "Pending transfer not found" });
    }

    // 2. Fetch user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 3. Check OTP
    const record = await prisma.otp.findUnique({ where: { email: user.email } });
    if (!record) {
      return res.status(400).json({ success: false, error: "No OTP found. Please initiate transfer again." });
    }

    if (new Date() > record.expiresAt) {
      await prisma.otp.delete({ where: { email: user.email } });
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    if (record.code !== otp) {
      return res.status(400).json({ success: false, error: "Incorrect OTP" });
    }

    // 4. OTP valid — delete it
    await prisma.otp.delete({ where: { email: user.email } });

    // 5. Deduct balance now
    const newBalance = user.balance - transfer.amount;
    await prisma.user.update({ where: { id: userId }, data: { balance: newBalance } });

    // 6. Mark transfer as success
    await prisma.transfer.update({ where: { id: transferId }, data: { status: "success" } });

    // 7. Create transaction record
    await prisma.transaction.create({
      data: {
        type: "transfer",
        amount: transfer.amount,
        status: "success",
        userId,
        description: `Transfer to ${transfer.accountName} (${transfer.accountNumber}) at ${transfer.bankName}`,
      },
    });

    // 8. Send confirmation email
    const transferDetailsHtml = `
      <b>Account Name:</b> ${transfer.accountName}<br>
      <b>Account Number:</b> ${transfer.accountNumber}<br>
      <b>Bank Name:</b> ${transfer.bankName}<br>
      <b>Amount:</b> ${transfer.amount}<br>
      <b>New Balance:</b> ${newBalance}<br>
    `;
    const html = transferNotificationTemplate(user.firstName, transferDetailsHtml, "Your transfer was successful!");
    await sendEmail(user.email, "Transfer Successful - America First Credit", html);

    res.status(200).json({ success: true, message: "Transfer successful", newBalance });
  } catch (err) {
    next(err);
  }
};

const resendTransferOtp = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { transferId } = req.body;

    // 1. Make sure the pending transfer exists and belongs to this user
    const transfer = await prisma.transfer.findUnique({ where: { id: transferId } });
    if (!transfer || transfer.userId !== userId || transfer.status !== "pending") {
      return res.status(404).json({ success: false, error: "Pending transfer not found" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 2. Generate a fresh OTP and overwrite the old one
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.upsert({
      where: { email: user.email },
      update: { code, expiresAt },
      create: { email: user.email, code, expiresAt },
    });

    await sendEmail(user.email, "Your New Transfer OTP - America First Credit", transferOtpTemplate(user.firstName, code, transfer.amount));

    res.status(200).json({ success: true, message: "OTP resent to your email" });
  } catch (err) {
    next(err);
  }
};



module.exports = { initiateTransfer, verifyTransferOtp, resendTransferOtp };