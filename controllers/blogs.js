const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.status(200).json(blogs);
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body;

    const user = await User.findById(request.user)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })

    const newBlog = await blog.save()

    user.blogs = user.blogs.concat(newBlog._id)
    await user.save()

    response.status(201).json(newBlog);
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog.toJSON())
    } else {
      response.status(404).end()
    }
})
  
blogsRouter.delete('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    
    if (!blog) {
        response.status(400).json({error: "No blog found"})
    } else {
        if ( blog.user.toString() === request.user.toString() ) {
            blog.deleteOne()
        }
        response.status(204).end()
    }
})
  
blogsRouter.put('/:id', (request, response, next) => {
    const body = request.body
  
    const blog = {
      user: body.user,
      likes: body.likes,
      author: body.author,
      title: body.title,
      url: body.url
    }
  
    Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
      .then(updatedBlog => {
        response.json(updatedBlog.toJSON())
      })
      .catch(error => next(error))
})

module.exports = blogsRouter
