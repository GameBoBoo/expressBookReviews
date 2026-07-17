const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.filter((user) => user.username === username).length > 0;
}

const authenticatedUser = (username, password) => {
  return users.filter((user) => user.username === username && user.password === password).length > 0;
}

// งานที่ 8 - Login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// งานที่ 9 - Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({
      message: `The review for the book with ISBN ${isbn} has been added/updated.`,
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// งานที่ 10 - Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn] && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: `Review for the ISBN ${isbn} posted by user ${username} deleted.`,
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;