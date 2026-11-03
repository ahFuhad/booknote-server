const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { bookId, returnDate } = req.body || {};
    if (!bookId || !ObjectId.isValid(bookId) || String(new ObjectId(bookId)) !== bookId) {
      return res.status(400).json({ success: false, message: "A valid book ID is required." });
    }

    const db = getDB();
    const books = db.collection("books");
    const borrows = db.collection("borrows");
    const bookObjectId = new ObjectId(bookId);

    const book = await books.findOneAndUpdate(
      { _id: bookObjectId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!book) {
      const exists = await books.findOne({ _id: bookObjectId }, { projection: { _id: 1 } });
      return res.status(exists ? 409 : 404).json({
        success: false,
        message: exists ? "Not Available: no copies are left." : "Book not found."
      });
    }

    const borrowedAt = new Date();
    const requestedReturnDate = returnDate ? new Date(returnDate) : new Date(borrowedAt.getTime() + 7 * 86400000);
    if (Number.isNaN(requestedReturnDate.getTime()) || requestedReturnDate <= borrowedAt) {
      await books.updateOne({ _id: bookObjectId }, { $inc: { availableCopies: 1 } });
      return res.status(400).json({ success: false, message: "Return date must be in the future." });
    }

    const borrow = {
      bookId,
      bookTitle: book.title,
      bookImage: book.image,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      borrowedAt,
      returnDate: requestedReturnDate
    };

    try {
      const inserted = await borrows.insertOne(borrow);
      return res.status(201).json({ success: true, message: "Book borrowed successfully.", data: { ...borrow, _id: inserted.insertedId } });
    } catch (insertError) {
      await books.updateOne({ _id: bookObjectId }, { $inc: { availableCopies: 1 } });
      if (insertError.code === 11000) {
        return res.status(409).json({ success: false, message: "You have already borrowed this book." });
      }
      throw insertError;
    }
  } catch (err) { next(err); }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const borrows = await getDB().collection("borrows")
      .find({ userEmail: req.user.email })
      .sort({ borrowedAt: -1 })
      .toArray();
    res.json({ success: true, data: borrows });
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id) || String(new ObjectId(req.params.id)) !== req.params.id) {
      return res.status(400).json({ success: false, message: "Invalid borrow ID." });
    }

    const db = getDB();
    const borrows = db.collection("borrows");
    const borrowId = new ObjectId(req.params.id);

    const borrow = await borrows.findOneAndDelete({ _id: borrowId, userEmail: req.user.email });
    if (!borrow) return res.status(404).json({ success: false, message: "Borrow record not found." });

    await db.collection("books").updateOne(
      { _id: new ObjectId(borrow.bookId) },
      { $inc: { availableCopies: 1 }, $set: { updatedAt: new Date() } }
    );

    res.json({ success: true, message: "Book returned successfully." });
  } catch (err) { next(err); }
});

module.exports = router;
