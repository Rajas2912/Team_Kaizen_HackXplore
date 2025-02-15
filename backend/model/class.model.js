import mongoose from 'mongoose'

const classSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classCode: { type: String, unique: true, required: true }, // Unique class code
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

// Function to generate a unique class code
classSchema.pre('save', async function (next) {
  if (!this.classCode) {
    let uniqueCode
    let isUnique = false
    while (!isUnique) {
      uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase() // Example: 'A1B2C3D4'
      const existingClass = await mongoose
        .model('Class')
        .findOne({ classCode: uniqueCode })
      if (!existingClass) isUnique = true
    }
    this.classCode = uniqueCode
  }
  next()
})

export default mongoose.model('Class', classSchema)
