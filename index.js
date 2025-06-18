require("dotenv").config();

const app = require('./src/app');
const prisma = require("./src/utils/prismaClient");


async function startServer() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Database connected successfully!");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1); // Stop the server if DB connection fails
  }
}

// Start the server
startServer();