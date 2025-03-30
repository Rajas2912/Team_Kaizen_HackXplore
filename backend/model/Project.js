import mongoose from 'mongoose';

const projectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'completed'],
      default: 'requested'
    },
    googleDocId: {
      type: String,
      default: ''
    },
    studentRequest: {
      type: String,
      required: true
    },
    githubRepo: {
        type: String,
        default: ''
      },
    teacherResponse: {
      type: String,
      default: ''
    },
    googleDocId: {
      type: String,
      validate: {
        validator: function(v) {
          // Basic validation for Google Docs URL or ID
          return /^[a-zA-Z0-9_-]+$/.test(v);
        },
        message: props => `${props.value} is not a valid Google Docs ID or URL!`
      }
    },
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;