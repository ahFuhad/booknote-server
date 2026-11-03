const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const booksRouter = require("./routes/books");
const borrowsRouter = require("./routes/borrows");
const { notFound, errorHandler } = require("./middleware/errors");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("This origin is not allowed by CORS."));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "BookNook API is running.", endpoints: ["/books", "/books/:id", "/borrows", "/borrows/:id"] });
});
app.get("/health", (req, res) => res.json({ success: true, status: "healthy" }));

app.use("/books", booksRouter);
app.use("/borrows", borrowsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
