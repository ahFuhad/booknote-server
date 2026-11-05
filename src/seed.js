require("dotenv").config();
const { connectDB } = require("./config/db");

const books = [
  {
    title: "The Silent Library",
    author: "Maya Rahman",
    category: "Fiction",
    image: "https://placehold.co/600x800/e9e3d5/26352d?text=The+Silent+Library",
    description: "A thoughtful story about a quiet library, forgotten letters, and the people whose lives meet between its shelves.",
    totalCopies: 5
  },
  {
    title: "A Brief Guide to the Cosmos",
    author: "Arif Hasan",
    category: "Science",
    image: "https://placehold.co/600x800/dce8ed/18364a?text=The+Cosmos",
    description: "An accessible introduction to stars, galaxies, black holes, and the questions that continue to shape modern astronomy.",
    totalCopies: 4
  },
  {
    title: "Stories from Bengal",
    author: "Nadia Karim",
    category: "History",
    image: "https://placehold.co/600x800/eadccf/593b2d?text=Stories+from+Bengal",
    description: "A collection of historical stories exploring the people, places, and cultural moments that shaped Bengal.",
    totalCopies: 3
  },
  {
    title: "The Little Paper Boat",
    author: "Samira Noor",
    category: "Kids",
    image: "https://placehold.co/600x800/e6e8d5/3c563d?text=Paper+Boat",
    description: "A warm illustrated adventure about curiosity, friendship, and a paper boat that travels farther than expected.",
    totalCopies: 6
  },
  {
    title: "The Art of Small Habits",
    author: "Daniel Brooks",
    category: "Others",
    image: "https://placehold.co/600x800/e5dfd4/443d32?text=Small+Habits",
    description: "Practical reflections on building meaningful routines through small, repeatable actions and patient progress.",
    totalCopies: 5
  },
  {
    title: "Beyond the Blue Planet",
    author: "Tariq Mahmud",
    category: "Science",
    image: "https://placehold.co/600x800/d8e5e9/264d59?text=Blue+Planet",
    description: "Explore Earth's ecosystems, climate systems, and the delicate connections that sustain life on our planet.",
    totalCopies: 2
  },
  {
    title: "The Garden of Lost Maps",
    author: "Elena Morris",
    category: "Fiction",
    image: "https://placehold.co/600x800/e8dfd4/544538?text=Lost+Maps",
    description: "A mystery begins when a young archivist discovers a map that seems to redraw itself every morning.",
    totalCopies: 4
  },
  {
    title: "Little Inventors",
    author: "Farhan Ahmed",
    category: "Kids",
    image: "https://placehold.co/600x800/e8e6d2/4b5739?text=Little+Inventors",
    description: "Fun projects and simple explanations encourage young readers to experiment, build, and ask big questions.",
    totalCopies: 7
  }
];

async function seed() {
  const db = await connectDB();
  const collection = db.collection("books");
  const now = new Date();

  for (const item of books) {
    const existing = await collection.findOne({ title: item.title, author: item.author });
    if (!existing) {
      await collection.insertOne({
        ...item,
        availableCopies: item.totalCopies,
        addedByName: "BookNook Library",
        addedByEmail: "library@booknook.local",
        addedById: "system-seed",
        createdAt: now,
        updatedAt: now,
        isSeed: true
      });
    }
  }

  console.log(`Seed complete. ${books.length} sample books checked.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
