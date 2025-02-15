import express, { json } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'
import CookieParser from 'cookie-parser'
import registerRoute from './route/user.route.js'
import vivaRoute from "./route/viva.route.js"
import VivaResult from './route/vivaresult.route.js'
import connectDB from './config/connectDB.js'
const Frontend_URL = process.env.Frontend_URL

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
app.use('/viva', vivaRoute);
app.use('/vivaresult', VivaResult);

app.get('/', (req, res) => {
  res.send('hello world')
})
app.listen(PORT, () => {
  console.log(`server run on port ${PORT}`)
})
