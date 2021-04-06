require('dotenv').config()
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./config/db")

const Blog = require('./models/blog')

const app = express();


mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

app.use(cors());
app.use(express.json());

app.get("/api/blogs", async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs);
});

app.post("/api/blogs", (request, response) => {
    const blog = new Blog(request.body);

    const newBlog = blog.save()

    response.status(201).json(newBlog);
});

module.exports = app