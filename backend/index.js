import express, { json } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'
import CookieParser from 'cookie-parser'
import registerRoute from './route/user.route.js'
import classRoute from './route/class.route.js'
import connectDB from './config/connectDB.js'
const Frontend_URL = process.env.Frontend_URL
// import {server,app} from './socket/index.js'

connectDB()

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

app.use('/user', registerRoute)
app.use('/class', classRoute)

app.get('/', (req, res) => {
  res.send('hello world')
})
app.listen(PORT, () => {
  console.log(`server run on port ${PORT}`)
})
