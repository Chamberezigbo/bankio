const prisma = require("../utils/prismaClient");
const { sendEmail } = require("../service/emailTransporter");
const transferNotificationTemplate = require("../template/emailTemp");

const initiateTransfer = async (req, res, next) => {
  try {
    const {
      accountName,
      accountNumber,
      bankName,
      bankAddress,
      country,
      currency,
      swiftCode,
      ibanNumber,
      amount,
      transferType,
      description,
    } = req.body;

    const userId = req.user.userId; // Set by authentication middleware

    // Fetch user and check balance
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Check if transfers are enabled for this user
    if (user.isSuspicious) {
    return res.status(403).json({ success:false, error: "Transfers are currently disabled for your account. Please contact support." });
    }

    if (parseFloat(amount) > user.balance) {
      return res.status(400).json({success:false, error: "Insufficient account balance" });
    }

    // Deduct amount from user balance
    const newBalance = user.balance - parseFloat(amount);
    await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // Create transfer record
    const transfer = await prisma.transfer.create({
      data: {
        accountName,
        accountNumber,
        bankName,
        bankAddress,
        country,
        currency,
        swiftCode,
        ibanNumber,
        amount: parseFloat(amount),
        transferType,
        description,
        status: "pending", // or "success" if you want to mark it as successful immediately
        userId,
      },
    });

    // Create a Transaction record and link to the transfer
    await prisma.transaction.create({
      data: {
        type: "transfer",
        amount: parseFloat(amount),
        status: "success",
        userId,
        // Optionally add a reference to the transfer (if you add transferId to Transaction model)
        // transferId: transfer.id,
        description: `Transfer to ${accountName} (${accountNumber}) at ${bankName}`,
      },
    });

    // Fetch user details for email
    const userDetails = await prisma.user.findUnique({ where: { id: userId } });

    // Prepare transfer details HTML
    const transferDetailsHtml = `
      <b>Account Name:</b> ${accountName}<br>
      <b>Account Number:</b> ${accountNumber}<br>
      <b>Bank Name:</b> ${bankName}<br>
      <b>Bank Address:</b> ${bankAddress}<br>
      <b>Country:</b> ${country}<br>
      <b>Currency:</b> ${currency}<br>
      <b>SWIFT Code:</b> ${swiftCode}<br>
      <b>IBAN Number:</b> ${ibanNumber}<br>
      <b>Amount:</b> ${amount}<br>
      <b>Transfer Type:</b> ${transferType}<br>
      <b>Description:</b> ${description || "N/A"}<br>
    `;

    // Generate email HTML
    const html = transferNotificationTemplate(
      userDetails.firstName,
      transferDetailsHtml,
      "Your transfer was successful!"
    );

    // Send email
    await sendEmail(userDetails.email, "Transfer Notification", html);

    res.status(201).json({
      success: true,
      message: "Transfer successful",
      transfer,
      newBalance,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { initiateTransfer };