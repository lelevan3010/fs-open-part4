const blog = require("../models/blog")

const dummy = (blogs) => {
  return 1
}


const favoriteBlog = (blogs) => {
  let mostLikes = blogs.reduce((prevBlog, currentBlog) => {
    if (prevBlog.likes < currentBlog.likes) {
      return currentBlog
    } else {
      return prevBlog
    }
  })

  return mostLikes
}



module.exports = {
  favoriteBlog
}