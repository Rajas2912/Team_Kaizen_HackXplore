import mongoose from 'mongoose'

const resourcesSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  documents,
})
