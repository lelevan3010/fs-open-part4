const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Blog = require('../models/blog')

describe('when there is initially some blogs saved', () => {
  
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const title = response.body.map(r => r.title)
    expect(title).toContain(
      'Title 1'
    )
  })
})

describe('addition of a new blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    await Blog.insertMany(helper.initialBlogs)

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('succeeds with valid data', async () => {
    const usersAtStart = await helper.usersInDb()

    const userId = usersAtStart.map(u => {if (u.username === 'root') return u.id})
    
    const login = await api
      .post('/api/login')
      .send({
        "username": "root",
        "password": "sekret"
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const newBlog = {
      title: "Title",
      author: "Dan",
      url: "123",
      userId: userId[0].toString()
    }
    console.log(`login.body.token`, login.body.token)
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const blogUserIds = blogsAtEnd.map(b => {
      if (b.user) {
        return b.user.toString()
      }
    })
    expect(blogUserIds).toContain(userId[0])
  })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'vannguyen',
        name: 'Van Nguyen',
        password: 'password123',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })
  
    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'root',
        name: 'Root',
        password: 'password123',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('User validation failed: username: Error, expected `username` to be unique. Value: `root`')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })  
})

afterAll(() => {
  mongoose.connection.close()
})
