const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// งานที่ 7 - Register new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// ---- Internal endpoints (แหล่งข้อมูลจริง) ----

// ดึงหนังสือทั้งหมด (ข้อมูลดิบ)
public_users.get('/books', (req, res) => {
  res.send(JSON.stringify(books, null, 4));
});

// ดึงตาม ISBN (ข้อมูลดิบ)
public_users.get('/books/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  books[isbn] ? res.send(books[isbn]) : res.status(404).json({ message: "Book not found" });
});

// ดึงตาม author (ข้อมูลดิบ)
public_users.get('/books/author/:author', (req, res) => {
  const author = req.params.author;
  const result = Object.keys(books)
    .filter((k) => books[k].author === author)
    .map((k) => ({ isbn: k, ...books[k] }));
  res.send(result);
});

// ดึงตาม title (ข้อมูลดิบ)
public_users.get('/books/title/:title', (req, res) => {
  const title = req.params.title;
  const result = Object.keys(books)
    .filter((k) => books[k].title === title)
    .map((k) => ({ isbn: k, ...books[k] }));
  res.send(result);
});

// ---- Public routes (ใช้ Axios + async/await ดึงจาก endpoint ข้างบน) ----

// งานที่ 2 - Get all books (Axios + async/await)
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

// งานที่ 3 - Get book by ISBN (Axios + async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books/isbn/${req.params.isbn}`);
    res.send(response.data);
  } catch (error) {
    res.status(404).json({ message: "Book not found for the given ISBN" });
  }
});

// งานที่ 4 - Get books by author (Axios + async/await)
public_users.get('/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books/author/${encodeURIComponent(req.params.author)}`);
    res.send(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for the given author" });
  }
});

// งานที่ 5 - Get books by title (Axios + async/await)
public_users.get('/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books/title/${encodeURIComponent(req.params.title)}`);
    res.send(response.data);
  } catch (error) {
    res.status(404).json({ message: "No books found for the given title" });
  }
});

// งานที่ 6 - Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn] ? books[isbn].reviews : { message: "Book not found" });
});

module.exports.general = public_users;