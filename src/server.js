require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set and contain at least 32 characters.");
  }
  await connectDB();
  app.listen(PORT, () => console.log(`BookNook API listening on port ${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start BookNook API:", err);
    process.exit(1);
  });
}
