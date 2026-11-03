const { z } = require("zod");

const categorySchema = z.enum(["Fiction", "Science", "History", "Kids", "Others"]);

const bookSchema = z.object({
  title: z.string().trim().min(1).max(140),
  author: z.string().trim().min(1).max(100),
  category: categorySchema,
  image: z.string().trim().url(),
  description: z.string().trim().min(10).max(2000),
  totalCopies: z.coerce.number().int().min(1).max(10000),
  addedByName: z.string().trim().min(1).max(100),
  addedByEmail: z.string().trim().email().transform((v) => v.toLowerCase())
});

const bookUpdateSchema = bookSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required."
);

module.exports = { bookSchema, bookUpdateSchema };
