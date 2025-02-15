import jwt, { decode } from 'jsonwebtoken'
import User from '../model/user.model.js'
import asyncHandler from './asyncHandler.js'

const authenticate = asyncHandler(async (req, res, next) => {
  let token
  console.log(req.cookies)

  token = req.cookies.token

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
      req.user = await User.findById(decoded.userId).select('-password')
      next()
    } catch (error) {
      res.status(401)
      throw new Error('Not authorized, token failed')
    }
  } else {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

const authorized = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role == 'admin') {
    next()
  } else {
    res.status(401).send('Not authorized!')
  }
})

export { authenticate, authorized }
