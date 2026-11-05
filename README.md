# BookNote — Backend API

The BookNote backend is a RESTful API built with Node.js, Express, and MongoDB. It manages the library's book collection, user borrowing records, and book availability.

The API includes JWT-based authentication for protected operations and is designed to work with the BookNote Next.js frontend.

## Live API

**Backend URL:** [https://booknote-server-9nphgx8sp-ah-fuhad.vercel.app](https://booknote-serverside.vercel.app/)

**Books endpoint:** [https://booknote-server-9nphgx8sp-ah-fuhad.vercel.app/books](https://booknote-serverside.vercel.app/books)

## Repository

[https://github.com/ahFuhad/booknote-server](https://github.com/ahFuhad/booknote-server)

## Features

- **Book Management:** Create, retrieve, update, and delete books.
- **Book Listing:** Retrieve the available books from MongoDB.
- **Book Details:** Retrieve an individual book by its ID.
- **Borrowing System:** Allow authenticated users to borrow books.
- **Return System:** Return borrowed books and update availability.
- **Availability Tracking:** Maintain total copies and available copies.
- **JWT Authentication:** Protect routes using JSON Web Tokens.
- **Request Validation:** Validate incoming data using Zod.
- **MongoDB Integration:** Store books and borrowing records in MongoDB.
- **Error Handling:** Centralized API error handling.
- **Security:** Helmet and CORS configuration.
- **Deployment Support:** Configured for deployment on Vercel.

## Technology Stack

- Node.js
- Express.js
- MongoDB
- MongoDB Native Driver
- JSON Web Token (JWT)
- Zod
- Helmet
- CORS
- dotenv
- Vercel

## API Endpoints

### Books API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Get all books |
| GET | `/books/:id` | Get a single book |
| POST | `/books` | Add a new book |
| PATCH | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

### Borrowing API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/borrows` | Borrow a book |
| GET | `/borrows` | Get borrowing records |
| DELETE | `/borrows/:id` | Return a borrowed book |

### Authentication

Protected endpoints require a valid JWT.

Include the token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database

BookNote uses MongoDB to store its application data.

The database name is:

```text
booknook
```

The backend manages book records and borrowing records.

## Borrowing Logic

The borrowing system maintains book availability.

- A user cannot borrow a book when no copies are available.
- Borrowing a book decreases the available copy count.
- Returning a book increases the available copy count.
- A user cannot have duplicate active borrowing records for the same book.

## Deployment

The backend is deployed on Vercel.

**Production API:** [https://booknote-server-9nphgx8sp-ah-fuhad.vercel.app](https://booknote-serverside.vercel.app/)

Configure the required environment variables in Vercel project settings before deployment.

## Author

Developed as part of the Programming Hero B14 Assignment 8.

**Project:** BookNote — Online Library Platform
