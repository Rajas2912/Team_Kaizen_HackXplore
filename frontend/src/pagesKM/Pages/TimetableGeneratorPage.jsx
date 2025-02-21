import React, { useState } from 'react'
import axios from 'axios'

const UploadPDF = () => {
  const [file, setFile] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(false)

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!file || !startDate || !endDate) {
      alert('Please fill all fields and upload a PDF.')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('start_date', startDate)
    formData.append('end_date', endDate)

    try {
      const response = await axios.post(
        'http://localhost:5000/schedule',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      setSchedule(response.data.raw_schedule)
      console.log(response.data.raw_schedule)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Upload Syllabus </h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <br />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button type="submit">Upload</button>
      </form>

      {loading && <p>Loading schedule...</p>}
      {schedule.length > 0 && (
        <div>
          <h2>Teaching Schedule</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Topic</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((lecture, index) => (
                <tr key={index}>
                  <td>{lecture.date}</td>
                  <td>{lecture.day}</td>
                  <td>{lecture.topic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UploadPDF
