const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { bookSchema, bookUpdateSchema } = require("../utils/validation");

const router = express.Router();

function validId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

router.get("/", (req, res, next) => {
  if (req.query.mine === "true") return requireAuth(req, res, next);
  next();
}, async (req, res, next) => {
  try {
    const db = getDB();
    const { category, search, sort = "newest" } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 100);

    const filter = {};
    if (req.query.mine === "true") filter.addedByEmail = req.user.email;
    if (category && category !== "All") filter.category = category;
    if (search) {
      const safeSearch = String(search).trim().slice(0, 100);
      filter.$or = [
        { title: { $regex: safeSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { author: { $regex: safeSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
      ];
    }

    const direction = sort === "oldest" ? 1 : -1;
    const [books, total] = await Promise.all([
      db.collection("books").find(filter).sort({ createdAt: direction }).skip((page - 1) * limit).limit(limit).toArray(),
      db.collection("books").countDocuments(filter)
    ]);

    res.json({ success: true, data: books, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid book ID." });
    const book = await getDB().collection("books").findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ success: false, message: "Book not found." });
    res.json({ success: true, data: book });
  } catch (err) { next(err); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const input = bookSchema.parse(req.body);
    if (input.addedByEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: "You can only add a book under your own account." });
    }

    const now = new Date();
    const book = {
      ...input,
      addedByName: req.user.name || input.addedByName,
      addedByEmail: req.user.email,
      addedById: req.user.id,
      totalCopies: input.totalCopies,
      availableCopies: input.totalCopies,
      createdAt: now,
      updatedAt: now
    };
    const result = await getDB().collection("books").insertOne(book);
    res.status(201).json({ success: true, message: "Book added successfully.", data: { ...book, _id: result.insertedId } });
  } catch (err) { next(err); }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid book ID." });
    const updates = bookUpdateSchema.parse(req.body);
    if (updates.addedByEmail && updates.addedByEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: "You cannot change book ownership." });
    }
    delete updates.addedByEmail;
    delete updates.addedByName;

    const db = getDB();
    const current = await db.collection("books").findOne({ _id: new ObjectId(req.params.id) });
    if (!current) return res.status(404).json({ success: false, message: "Book not found." });
    if (current.addedByEmail !== req.user.email) return res.status(403).json({ success: false, message: "You can only edit books you added." });

    if (updates.totalCopies !== undefined) {
      const borrowedCount = current.totalCopies - current.availableCopies;
      if (updates.totalCopies < borrowedCount) {
        return res.status(400).json({ success: false, message: `At least ${borrowedCount} total copies are currently borrowed.` });
      }
      updates.availableCopies = updates.totalCopies - borrowedCount;
    }

    updates.updatedAt = new Date();
    const result = await db.collection("books").findOneAndUpdate(
      { _id: current._id, addedByEmail: req.user.email },
      { $set: updates },
      { returnDocument: "after" }
    );
    res.json({ success: true, message: "Book updated successfully.", data: result });
  } catch (err) { next(err); }
});


router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid book ID." });
    const db = getDB();
    const bookId = new ObjectId(req.params.id);
    const book = await db.collection("books").findOne({ _id: bookId });
    if (!book) return res.status(404).json({ success: false, message: "Book not found." });
    if (book.addedByEmail !== req.user.email) return res.status(403).json({ success: false, message: "You can only delete books you added." });

    const activeBorrow = await db.collection("borrows").findOne({ bookId: req.params.id });
    if (activeBorrow) return res.status(409).json({ success: false, message: "This book cannot be deleted while it is borrowed." });

    await db.collection("books").deleteOne({ _id: bookId, addedByEmail: req.user.email });
    res.json({ success: true, message: "Book deleted successfully." });
  } catch (err) { next(err); }
});

module.exports = router;
