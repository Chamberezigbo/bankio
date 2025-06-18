const fs = require("fs").promises;
const path = require("path");

// Helper to delete old image file
exports.deleteOldProfileImage = async (profileImageUrl) => {
       if (!profileImageUrl) return;
       try {
         const filePath = path.join(__dirname, "..", "uploads", profileImageUrl.replace(/^\/?uploads\//, ""));
         await fs.unlink(filePath);
       } catch (err) {
         // Ignore error if file does not exist
       }
     };