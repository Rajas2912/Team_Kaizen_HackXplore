import mongoose from 'mongoose'

const TimetableSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    schedule: [
      {
        date: { type: String, required: true },
        day: { type: String, required: true },
        hours: { type: Number, required: true, min: 0 },
        topic: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Timetable = mongoose.model('Timetable', TimetableSchema)

export default Timetable
