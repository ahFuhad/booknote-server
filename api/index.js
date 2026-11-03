require("dotenv").config();
const app = require("../src/app");
const { connectDB } = require("../src/config/db");

let ready;
module.exports = async (req, res) => {
  try {
    if (!ready) ready = connectDB();
    await ready;
    return app(req, res);
  } catch (error) {
    console.error("API initialization failed:", error);
    return res.status(500).json({ success: false, message: "API initialization failed." });
  }
};
