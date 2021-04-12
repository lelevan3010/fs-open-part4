require('dotenv').config()
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
require('express-async-errors')

const config = require("./config/db")
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const usersRouter = require('./controllers/users')
const blogsRouter = require('./controllers/blogs')
const loginRouter = require('./controllers/login')

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})
.then(() => {
  logger.info('connected to MongoDB')
})
.catch((error) => {
  logger.error('error connection to MongoDB:', error.message)
});

app.use(cors());
app.use(express.json());

app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
