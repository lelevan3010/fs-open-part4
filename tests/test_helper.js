const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "Title 1",
    author: "Author 1",
    url: "URL 1",
  },
  {
    title: "Title 2",
    author: "Author 2",
    url: "URL 2",
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon', date: new Date() })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
}
