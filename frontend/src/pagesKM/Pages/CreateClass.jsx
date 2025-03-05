import React, { useState } from 'react'
import { useCreateClassMutation } from '../../redux/api/classApiSlice'
import './CreateClass.css' // Import the CSS file
import { useSelector } from 'react-redux'

const CreateClass = ({ onClose, refetch }) => {
  const { userInfo } = useSelector((state) => state.user)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [isPublic, setIsPublic] = useState(false) // Public or private class
  const [createClass, { isLoading, error }] = useCreateClassMutation()
  const userId = userInfo._id

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createClass({
        name,
        description,
        subject,
        userId,
        isPublic,
      }).unwrap()
      setName('')
      setDescription('')
      setSubject('')
      setIsPublic(false)
      onClose() // Close modal after successful submission
    } catch (err) {
      console.error('Failed to create class:', err)
    }
    refetch()
  }

  return (
    <div className="create-class-container">
      <h2 className="form-title">Create Class</h2>
      <form className="create-class-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Class Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-textarea"
          />
        </div>
        <div className="form-group">
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make this class public
          </label>
        </div>
        <button type="submit" className="submit-button" disabled={isLoading}>
          Create Class
        </button>
        {error && (
          <p className="error-message">
            Error: {error.data?.message || 'Something went wrong'}
          </p>
        )}
      </form>
    </div>
  )
}

export default CreateClass
