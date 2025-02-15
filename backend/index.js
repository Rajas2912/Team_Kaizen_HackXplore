import express, { json } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'
import CookieParser from 'cookie-parser'
import registerRoute from './route/user.route.js'
const Frontend_URL = process.env.Frontend_URL
// import {server,app} from './socket/index.js'

const app = express()
app.use(
  cors({
    origin: Frontend_URL, // Allow frontend's origin
    credentials: true, // Allow credentials like cookies
  })
)
app.use(express.json())
app.use(CookieParser())

const PORT = process.env.PORT || 4000
const URI = process.env.URI

// connect to database
try {
  mongoose.connect(URI)
  console.log('connect to mongodb database')
} catch (error) {
  console.log('Error:', error)
}

app.use('/user', registerRoute)

app.get('/', (req, res) => {
  res.send('hello world')
})
app.listen(PORT, () => {
  console.log(`server run on port ${PORT}`)
})
