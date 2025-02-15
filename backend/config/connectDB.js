import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.URI)
    console.log('Database connected successfully!')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

export default connectDB
